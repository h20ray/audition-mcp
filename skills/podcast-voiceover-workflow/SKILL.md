---
name: podcast-voiceover-workflow
description: Use for end-to-end audio production of podcasts, voice-overs, narration or YouTube talking-head audio - from raw recording to delivered file - including multi-speaker leveling, room-tone, mic technique problems, and an ordered checklist.
---

# Podcast / voice-over pipeline

1. **Ingest**: `audio_probe` each file; convert everything to 48 kHz WAV (`audio_convert`).
2. **Edit content first** (cut ums, retakes). `silence_detect` finds dead air; use `silence_trim` for a first pass, then fine-tune by ear. Leave ~0.15-0.3 s natural gaps.
3. **Room tone**: keep a few seconds of silence from the recording; fill cuts with it so the background doesn't "drop out" between edits.
4. **Match speakers** before processing: bring each voice to a similar level (±3 dB) by clip gain.
5. **Cleanup chain** (`dialogue_cleanup`, see that skill). Use light settings on a clean recording.
6. **Music/stings** under voice with `duck_music`.
7. **Loudness**: `loudness_normalize` target `podcast` (-16 LUFS) or `youtube` (-14).
8. **QC**: `loudness_measure` the final; listen to the first 30 s, the loudest part, and every edit point. Check on phone speaker and earbuds.
9. **Export**: WAV master; MP3 128 kbps mono / 96 kbps for speech-only podcast distribution.

## Mic-technique facts worth telling the speaker
- 10-15 cm (a fist-and-thumb) from the mic, slightly off-axis to tame plosives; pop filter.
- Record -12 to -6 dBFS peaks. Too hot clips (unfixable); too quiet raises noise on gain-up.
- Soft furnishings kill room reverb more than any plugin.
- One 5 s clap or silence at start helps sync and noise profiling.
