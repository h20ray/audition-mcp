// ffmpeg engine: every call uses spawn with an argv array (no shell), so paths can't inject commands.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

export const TARGETS = {
  youtube: { i: -14, tp: -1.0, lra: 11 },
  podcast: { i: -16, tp: -1.0, lra: 9 },
  broadcast_ebu_r128: { i: -23, tp: -1.0, lra: 15 },
  broadcast_atsc_a85: { i: -24, tp: -2.0, lra: 15 },
  tiktok_reels: { i: -14, tp: -1.0, lra: 9 },
  spotify: { i: -14, tp: -1.0, lra: 11 },
};

export function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { windowsHide: true });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) => reject(new Error(`${cmd} failed to start: ${e.message} (set FFMPEG_PATH/FFPROBE_PATH)`)));
    p.on("close", (code) => (code === 0 ? resolve({ out, err }) : reject(new Error(`${cmd} exit ${code}\n${err.slice(-1500)}`))));
  });
}

export function mustExist(p) {
  if (!existsSync(p)) throw new Error(`File not found: ${p}`);
  return path.resolve(p);
}

// Refuse to overwrite the source file; overwriting other outputs is explicit via overwrite=true.
export function checkOut(inp, out, overwrite = false) {
  const o = path.resolve(out);
  if (o.toLowerCase() === path.resolve(inp).toLowerCase()) throw new Error("output must differ from input");
  if (existsSync(o) && !overwrite) throw new Error(`Output exists: ${o} (pass overwrite=true)`);
  return o;
}

export async function probe(file) {
  const { out } = await run(FFPROBE, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", mustExist(file)]);
  const j = JSON.parse(out);
  return {
    format: j.format.format_name,
    duration_s: Number(j.format.duration),
    streams: j.streams.map((s) => ({ type: s.codec_type, codec: s.codec_name, sample_rate: s.sample_rate, channels: s.channels, channel_layout: s.channel_layout, bit_rate: s.bit_rate })),
  };
}

// EBU R128 measurement via loudnorm in analysis mode (JSON is printed at the end of stderr).
export async function measureLoudness(file, t = TARGETS.youtube) {
  const { err } = await run(FFMPEG, ["-hide_banner", "-nostats", "-i", mustExist(file), "-vn", "-af", `loudnorm=I=${t.i}:TP=${t.tp}:LRA=${t.lra}:print_format=json`, "-f", "null", "-"]);
  const start = err.lastIndexOf("{"), end = err.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("could not parse loudnorm output:\n" + err.slice(-600));
  const j = JSON.parse(err.slice(start, end + 1));
  return { integrated_lufs: +j.input_i, true_peak_dbtp: +j.input_tp, lra: +j.input_lra, threshold: +j.input_thresh, raw: j };
}

const codecArgs = (out) => {
  const e = path.extname(out).toLowerCase();
  if (e === ".wav") return ["-c:a", "pcm_s24le"];
  if (e === ".flac") return ["-c:a", "flac"];
  if (e === ".mp3") return ["-c:a", "libmp3lame", "-q:a", "0"];
  if (e === ".m4a" || e === ".aac") return ["-c:a", "aac", "-b:a", "256k"];
  return [];
};

// Two-pass linear loudnorm: measure, then apply measured values so the gain is a pure offset (no pumping).
export async function normalize(inp, out, target, overwrite) {
  const t = TARGETS[target];
  if (!t) throw new Error(`unknown target ${target}; use ${Object.keys(TARGETS).join(", ")}`);
  const o = checkOut(inp, out, overwrite);
  const m = (await measureLoudness(inp, t)).raw;
  const af = `loudnorm=I=${t.i}:TP=${t.tp}:LRA=${t.lra}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=summary`;
  await run(FFMPEG, ["-hide_banner", "-y", "-i", inp, "-vn", "-af", af, "-ar", "48000", ...codecArgs(o), o]);
  return { output: o, before: { lufs: +m.input_i, tp: +m.input_tp }, target: t, after: await measureLoudness(o, t).then((r) => ({ lufs: r.integrated_lufs, tp: r.true_peak_dbtp })) };
}

// Order matters: HPF -> denoise -> de-ess -> EQ -> compress -> (normalize separately).
export async function dialogueCleanup(inp, out, o = {}, overwrite) {
  const out_ = checkOut(inp, out, overwrite);
  const f = [];
  f.push(`highpass=f=${o.highpass_hz ?? 80}`);
  if (o.hum_hz) for (let h = 1; h <= 3; h++) f.push(`bandreject=f=${o.hum_hz * h}:width_type=q:w=30`); // 50/60 Hz mains + harmonics
  if (o.denoise_db !== 0) f.push(`afftdn=nr=${o.denoise_db ?? 12}:nf=-40:tn=1`); // tn=1 tracks noise floor
  if (o.deess !== false) f.push(`deesser=i=${o.deess_intensity ?? 0.4}:m=0.5:f=0.5`);
  f.push(`equalizer=f=250:t=q:w=1.2:g=${o.mud_cut_db ?? -2}`); // low-mid mud
  f.push(`equalizer=f=4000:t=q:w=1.0:g=${o.presence_db ?? 1.5}`); // presence
  f.push(`acompressor=threshold=${o.comp_threshold_db ?? -20}dB:ratio=${o.comp_ratio ?? 3}:attack=15:release=150:makeup=${o.comp_makeup_db ?? 3}`);
  f.push("alimiter=limit=0.89:level=false"); // ~ -1 dBFS safety
  await run(FFMPEG, ["-hide_banner", "-y", "-i", inp, "-vn", "-af", f.join(","), "-ar", "48000", ...codecArgs(out_), out_]);
  return { output: out_, chain: f };
}

export async function silenceDetect(file, noiseDb = -35, minDur = 0.6) {
  const { err } = await run(FFMPEG, ["-hide_banner", "-nostats", "-i", mustExist(file), "-vn", "-af", `silencedetect=noise=${noiseDb}dB:d=${minDur}`, "-f", "null", "-"]);
  const s = [...err.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const e = [...err.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map((m) => ({ end: +m[1], dur: +m[2] }));
  return s.map((start, i) => ({ start, end: e[i]?.end ?? null, duration: e[i]?.dur ?? null }));
}

export async function silenceTrim(inp, out, noiseDb = -35, minDur = 0.6, keep = 0.15, overwrite) {
  const o = checkOut(inp, out, overwrite);
  // Shorten long pauses but keep `keep` seconds so speech doesn't feel clipped.
  const af = `silenceremove=stop_periods=-1:stop_duration=${minDur}:stop_threshold=${noiseDb}dB:stop_silence=${keep}`;
  await run(FFMPEG, ["-hide_banner", "-y", "-i", inp, "-vn", "-af", af, ...codecArgs(o), o]);
  const [a, b] = await Promise.all([probe(inp), probe(o)]);
  return { output: o, duration_before_s: a.duration_s, duration_after_s: b.duration_s };
}

// Sidechain ducking: voice drives the compressor on the music bus.
export async function duckMusic(voice, music, out, o = {}, overwrite) {
  const out_ = checkOut(voice, out, overwrite);
  const fc = `[1:a]volume=${o.music_gain_db ?? -6}dB[m];[m][0:a]sidechaincompress=threshold=${o.threshold ?? 0.05}:ratio=${o.ratio ?? 8}:attack=${o.attack_ms ?? 20}:release=${o.release_ms ?? 400}[d];[0:a][d]amix=inputs=2:normalize=0:duration=first[o]`;
  await run(FFMPEG, ["-hide_banner", "-y", "-i", voice, "-stream_loop", "-1", "-i", mustExist(music), "-filter_complex", fc, "-map", "[o]", "-ar", "48000", ...codecArgs(out_), out_]);
  return { output: out_ };
}

export async function convert(inp, out, o = {}, overwrite) {
  const out_ = checkOut(inp, out, overwrite);
  const a = ["-hide_banner", "-y", "-i", inp, "-vn"];
  if (o.sample_rate) a.push("-ar", String(o.sample_rate));
  if (o.channels) a.push("-ac", String(o.channels));
  await run(FFMPEG, [...a, ...codecArgs(out_), out_]);
  return { output: out_ };
}
