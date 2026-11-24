---
name: sound-design-for-motion
description: Use when adding sound effects to animation, motion graphics, title cards, lower thirds, transitions or kinetic typography - whooshes, risers, impacts, UI ticks - or syncing audio to visual hits. For HyperFrames/Remotion/After Effects/Vegas work.
---

# Sound design for motion graphics

Sound sells motion. An animation with a well-placed sound feels more polished than one with better easing and no sound.

## Pair the sound to the motion
| Visual | Sound | Placement |
|---|---|---|
| Fast slide/wipe in | Short whoosh (150-300 ms) | Starts ~2-3 frames **before** the move ends so it arrives with it |
| Title lands / logo settles | Impact/thud + soft tail | Hit exactly on the settle frame |
| Text pops letter-by-letter | Soft ticks/clicks, randomize pitch ±2 st | One per character group, not every character |
| Build-up before a reveal | Riser (1-3 s) | Peaks one frame before the reveal; silence (or a "reverse reverb") then impact |
| Underline/line draw | Rising tonal sweep | Matches draw duration |
| Hard cut / whip transition | Whoosh with stereo pan in the direction of travel | Centered on the cut |

## Principles
- **Sync tolerance**: audio late by >2 frames feels wrong; audio *early* by 1-2 frames feels tighter. When unsure, nudge sound slightly early.
- **Layer 2-3 sounds** per big moment (body + air + tail), each filtered to its own band so they don't mud together.
- **Leave space**: a 100-200 ms drop to near-silence before an impact multiplies its punch.
- **Don't repeat identical samples** back-to-back; vary pitch/length slightly.
- Keep SFX below dialogue: -10 to -6 dB relative to the voice peak, except deliberate hits.
- Use `hyperframes audio` to find where onsets/hits already land in a track, and `hyperframes beats` to snap cuts to the beat; then align SFX to those timestamps.

## Delivery
Print SFX to their own stem so music and dialogue can be rebalanced later; then `loudness_measure` the full mix.
