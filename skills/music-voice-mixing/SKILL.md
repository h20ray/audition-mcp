---
name: music-voice-mixing
description: Use when mixing music or sound effects under dialogue/voice-over - ducking, balance, EQ carving, "music is too loud", "can't hear the voice", background music for YouTube, ads, shorts, or podcasts.
---

# Music under voice

## Level relationships (starting points, then trust your ears on small speakers)
- Voice sits around -14 LUFS in the final. Music bed under speech: **-18 to -24 dB below the voice** (about -30 to -38 LUFS short-term on its own).
- Intro/outro music with no voice can rise to full level; ramp over 0.5-1.0 s, not a jump cut.
- SFX hits (whoosh, impact) should *peak* near the voice peak but be short; they are punctuation, not bed.

## Ducking (`duck_music`)
- Sidechain: the voice triggers compression on the music. Defaults: ratio 8, attack 20 ms, release 400 ms.
- Attack too slow → first syllables get buried. Release too fast → music "pumps" audibly between words; 300-600 ms feels natural.
- For fully-manual control use volume automation; ducking is fastest for long-form.

## Frequency carving
Voice intelligibility lives at 1-4 kHz. Carve a gentle 2-3 dB dip at 2-3 kHz on the *music* so the voice sits in a hole instead of fighting it. Cut music below 100 Hz if the voice is thin or the delivery is phone-speaker (shorts).

## Choosing music
- Vocals in music under speech compete for the same words. Prefer instrumental beds for talking.
- Tempo should match edit pace: cuts on beat feel intentional; sync the *hook* to a downbeat.
- Avoid dense mid-range instruments (piano, acoustic guitar strumming) under dialogue-heavy content.

## Check
Listen on phone speaker at low volume: if you lose words, lower the music another 3 dB.
