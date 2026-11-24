---
name: audition-vegas-handoff
description: Use when moving audio between Adobe Audition and Vegas Pro (or After Effects) - roundtrip editing, exporting stems, sample rate/bit depth, sync drift, "audio out of sync after export", what to send and what to bring back.
---

# Audition ⇄ Vegas handoff

## Golden rules
- **48 kHz, 24-bit (or 32-bit float) WAV** for everything that touches video. Mixed 44.1/48 kHz sources are the #1 cause of slow drift and "pitch-shifted" audio.
- **Never lock the cut after the audio leaves.** Picture lock first, then send audio. Any edit after export desyncs the sound.
- Export audio with a **2-second head handle + a 2-pop at -2 s** (a single-frame beep exactly 2 s before first frame) or a slate so you can verify sync on return.
- Send **stems**, not just a mix: Dialogue / Music / SFX. Return the same stems so Vegas can rebalance.

## Roundtrip
1. Vegas: render audio-only WAV of the locked timeline (or per-track stems), same start timecode.
2. Process with this MCP (`dialogue_cleanup`, `silence_trim` only on a copy, never changing duration on a stem that is already synced) or open in Audition for spectral repair / DeReverb.
3. Return WAV of **identical duration** to the source. Check with `audio_probe`: durations must match to within one frame (~0.04 s at 24 fps).
4. Place on a new Vegas track, line up with the pop/slate, mute the original track (don't delete).

## Danger list
- `silence_trim` **changes duration**; it's for rough-cut prep, never for stems returning to a locked timeline.
- Variable frame rate (phone) video: convert to constant frame rate before editing or audio will drift.
- Normalization/limiting changes level only, not timing: safe on returning stems.
- Mono dialogue → keep as mono tracks panned center; upmixing to stereo is unnecessary.

## Live control limits
Audition's own scripting can reach sessions/clips but not the effects rack. Heavy repair (DeReverb, Spectral Frequency Display healing, Match Loudness) is done by hand in Audition; this MCP covers the batch/measurement side.
