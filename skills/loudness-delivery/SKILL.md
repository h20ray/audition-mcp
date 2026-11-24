---
name: loudness-delivery
description: Use when the user asks about LUFS, loudness targets, true peak, "too quiet/too loud", normalizing for YouTube/podcast/TikTok/broadcast, or preparing final audio for delivery. Covers targets, measurement order, and what to do when a mix misses the target.
---

# Loudness & delivery

Measure first, then correct. Never normalize blind: `loudness_measure` before `loudness_normalize`.

## Targets (integrated LUFS / true peak)
| Destination | LUFS | True peak | Notes |
|---|---|---|---|
| YouTube / Spotify | -14 | -1 dBTP | Platforms turn louder content *down*, never up past this; louder gains nothing |
| Podcast (Apple/most apps) | -16 (stereo), -19 (mono) | -1 | Speech-heavy; LRA ≤ 9 |
| TikTok / Reels / Shorts | -14 | -1 | Phones are small speakers: keep dialogue forward, cut sub-80 Hz |
| EBU R128 broadcast | -23 ±0.5 | -1 | |
| ATSC A/85 (US TV) | -24 ±2 | -2 | |

## Rules that avoid the usual mistakes
- Integrated LUFS is measured over the *whole* program. Measure the finished mix, not a stem.
- Fix peaks before loudness. If true peak exceeds target after gain, the limiter must work: a mix that needs >6 dB limiting is a mixing problem, not a loudness problem.
- Linear (two-pass) normalization only applies gain. If the result misses the target by LRA/peak, the dynamics are too wide: compress dialogue first (see `dialogue-cleanup`).
- Always deliver at 48 kHz for video (44.1 kHz only for audio-only music releases). 24-bit WAV master, then derive AAC/MP3.
- Never normalize twice or re-encode lossy to lossy.

## Workflow
1. `loudness_measure` the mix → read `gain_needed_db`.
2. If |gain| > 10 dB or LRA > target LRA, fix the mix, don't just normalize.
3. `loudness_normalize` with the target → confirm `after.lufs` within ±0.5 and `after.tp` ≤ target.
4. Hand the WAV to Vegas/Audition; do not let the NLE normalize again.
