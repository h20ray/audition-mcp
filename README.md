# audition-mcp

An MCP server for **audio engineering workflows** around Adobe Audition (and any video editor): loudness measurement and delivery targets, dialogue cleanup, silence handling, music ducking and format conversion, plus a set of audio-engineering **skills** for AI agents.

> **Scope, honestly.** Adobe Audition's scripting reaches multitrack sessions and clips but not the effects rack, and Adobe documents little of it. This project therefore does the work that doesn't need Audition open: it is an **ffmpeg-based engine**, not a remote control for Audition's UI. A live Audition bridge (CEP panel) is a planned, separate phase. It is not affiliated with Adobe.

## Tools
| Tool | What it does |
|---|---|
| `audio_probe` | codec, duration, sample rate, channels |
| `loudness_measure` | integrated LUFS, true peak, LRA, and the gain needed for a target |
| `loudness_normalize` | two-pass linear normalization to YouTube / podcast / EBU R128 / ATSC A/85 / TikTok targets, with before/after |
| `dialogue_cleanup` | high-pass, hum notch (50/60 Hz), adaptive denoise, de-ess, EQ, compression, limiter |
| `silence_detect` / `silence_trim` | find or shorten dead air |
| `duck_music` | sidechain-duck music under a voice |
| `audio_convert` | resample, downmix, WAV/FLAC/MP3/AAC |

Outputs never overwrite the input; overwriting another existing file needs `overwrite=true`.

## Install
Requires Node 20+ and ffmpeg/ffprobe on PATH (or set `FFMPEG_PATH` / `FFPROBE_PATH`).
```
git clone https://github.com/h20ray/audition-mcp.git
cd audition-mcp && npm ci && npm test
```
Register in a project's `.mcp.json`:
```json
{ "mcpServers": { "audition-audio": { "command": "node", "args": ["C:/path/to/audition-mcp/src/server.mjs"] } } }
```

## Skills
`skills/` holds agent skills (copy into `.claude/skills/`): `loudness-delivery`, `dialogue-cleanup`, `music-voice-mixing`, `sound-design-for-motion`, `audition-vegas-handoff`, `podcast-voiceover-workflow`.

## Roadmap
- CEP panel bridge to run ExtendScript in a live Audition (sessions, tracks, markers).
- Stem separation (Demucs) and speech-to-text markers.

MIT licensed.
