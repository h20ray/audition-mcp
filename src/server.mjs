#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as E from "./engine.mjs";

const server = new McpServer({ name: "audition-mcp", version: "0.1.0" });
const text = (o) => ({ content: [{ type: "text", text: JSON.stringify(o, null, 2) }] });
const wrap = (fn) => async (a) => {
  try { return text(await fn(a)); }
  catch (e) { return { isError: true, content: [{ type: "text", text: String(e.message) }] }; }
};
const target = z.enum(Object.keys(E.TARGETS)).default("youtube");
const ow = z.boolean().default(false).describe("allow overwriting an existing output file");

server.tool("audio_probe", "Container, duration, codec, sample rate and channels of an audio/video file.",
  { path: z.string() }, wrap(({ path }) => E.probe(path)));

server.tool("loudness_measure", "Measure integrated LUFS, true peak (dBTP) and LRA (EBU R128) without changing the file.",
  { path: z.string(), target }, wrap(async ({ path, target }) => {
    const r = await E.measureLoudness(path, E.TARGETS[target]);
    return { integrated_lufs: r.integrated_lufs, true_peak_dbtp: r.true_peak_dbtp, lra: r.lra, target: E.TARGETS[target],
      gain_needed_db: +(E.TARGETS[target].i - r.integrated_lufs).toFixed(2) };
  }));

server.tool("loudness_normalize", "Two-pass linear loudness normalization to a delivery target; reports before/after.",
  { input: z.string(), output: z.string(), target, overwrite: ow }, wrap((a) => E.normalize(a.input, a.output, a.target, a.overwrite)));

server.tool("dialogue_cleanup", "Voice chain: high-pass, optional mains-hum notch, adaptive denoise, de-ess, mud cut, presence, compression, safety limiter. Does not normalize; run loudness_normalize after.",
  { input: z.string(), output: z.string(), highpass_hz: z.number().optional(), hum_hz: z.union([z.literal(50), z.literal(60)]).optional().describe("mains frequency if hum present"),
    denoise_db: z.number().min(0).max(40).optional().describe("0 disables denoise"), deess: z.boolean().optional(), deess_intensity: z.number().min(0).max(1).optional(),
    mud_cut_db: z.number().optional(), presence_db: z.number().optional(), comp_threshold_db: z.number().optional(), comp_ratio: z.number().optional(), comp_makeup_db: z.number().optional(), overwrite: ow },
  wrap(({ input, output, overwrite, ...o }) => E.dialogueCleanup(input, output, o, overwrite)));

server.tool("silence_detect", "List silent regions (start/end/duration) so cuts can be planned or markers placed.",
  { path: z.string(), noise_db: z.number().default(-35), min_duration_s: z.number().default(0.6) }, wrap((a) => E.silenceDetect(a.path, a.noise_db, a.min_duration_s)));

server.tool("silence_trim", "Shorten long pauses, keeping a short natural gap.",
  { input: z.string(), output: z.string(), noise_db: z.number().default(-35), min_duration_s: z.number().default(0.6), keep_s: z.number().default(0.15), overwrite: ow },
  wrap((a) => E.silenceTrim(a.input, a.output, a.noise_db, a.min_duration_s, a.keep_s, a.overwrite)));

server.tool("duck_music", "Mix music under voice with sidechain ducking (music loops to voice length).",
  { voice: z.string(), music: z.string(), output: z.string(), music_gain_db: z.number().optional(), threshold: z.number().optional(), ratio: z.number().optional(), attack_ms: z.number().optional(), release_ms: z.number().optional(), overwrite: ow },
  wrap(({ voice, music, output, overwrite, ...o }) => E.duckMusic(voice, music, output, o, overwrite)));

server.tool("audio_convert", "Convert/resample/downmix. Output extension picks codec (wav 24-bit, flac, mp3 V0, m4a 256k).",
  { input: z.string(), output: z.string(), sample_rate: z.number().optional(), channels: z.number().optional(), overwrite: ow },
  wrap(({ input, output, overwrite, ...o }) => E.convert(input, output, o, overwrite)));

await server.connect(new StdioServerTransport());
