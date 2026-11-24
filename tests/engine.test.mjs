import test from "node:test";
import assert from "node:assert/strict";
import { TARGETS, checkOut, mustExist } from "../src/engine.mjs";

test("targets cover the main delivery platforms", () => {
  for (const k of ["youtube", "podcast", "broadcast_ebu_r128", "tiktok_reels"]) assert.ok(TARGETS[k].i < 0);
  assert.equal(TARGETS.broadcast_ebu_r128.i, -23);
});
test("refuses to overwrite the input", () => {
  assert.throws(() => checkOut("a.wav", "A.WAV"), /differ from input/);
});
test("missing input is reported", () => {
  assert.throws(() => mustExist("nope-does-not-exist.wav"), /not found/i);
});
