---
name: dialogue-cleanup
description: Use when cleaning voice recordings - noise, hum, hiss, room echo, harsh S sounds, plosives, muddy or thin voice, uneven levels - for podcasts, YouTube talking heads, voice-over, interviews. Gives the processing order and how to map each symptom to a fix.
---

# Dialogue cleanup

**Order matters.** Each stage assumes the previous one is done:
`gain stage → high-pass → hum notch → denoise → de-ess → EQ → compress → limit → loudness`

`dialogue_cleanup` implements this chain. Tune, then run `loudness_normalize` last.

## Symptom → fix
| You hear | Cause | Fix |
|---|---|---|
| Constant "shhh" | Preamp/room noise | `denoise_db` 8-15. Above ~15 dB you get "underwater" artifacts; reduce less, gate in the edit instead |
| Low buzz + harmonics | Mains hum (50 Hz in Indonesia/EU, 60 Hz US) | `hum_hz`: 50 or 60 (notches fundamental + 2 harmonics) |
| Rumble, desk thumps, wind | Sub-bass | high-pass 80 Hz (male) / 100 Hz (female); 120 Hz for noisy locations |
| Boomy, "boxy" | 200-400 Hz build-up (close mic, small room) | `mud_cut_db` -2 to -4 |
| Hard S / sibilance | 5-9 kHz peaks | `deess_intensity` 0.3-0.6; don't exceed or you lisp |
| Dull, far away | Missing 3-5 kHz | `presence_db` +1 to +3 |
| Uneven loudness | Wide dynamics | compressor ratio 3:1, threshold so peaks reduce 3-6 dB |
| Echo / reverb tail | Hard room | Cannot be fixed cleanly by EQ; use a dereverb tool (Audition: Effects > Noise Reduction > Adaptive/DeReverb), or re-record close to the mic |
| Clipping (flat tops) | Input too hot | Audition: Diagnostics > Declipper; prevention is cheaper |

## Rules
- Cleaning should be **inaudible**. If you can hear the processing, back off.
- Denoise before compression: compression raises the noise floor.
- Cut with EQ, boost sparingly. Cuts sound natural; boosts exaggerate noise.
- Compare A/B at matched loudness; louder always sounds "better" and fools you.
- Keep a dry copy. Process the copy; never overwrite the original recording.
