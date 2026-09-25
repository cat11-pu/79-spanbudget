import assert from "node:assert";
import { nest } from "../nest.js";
import { trim } from "../trim.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const spans = [{ id: "s0", start: 0, end: 5, parent: null }, { id: "s1", start: 1, end: 2, parent: "s0" }];

check("nest returns layered list", () => {
  assert.ok(Array.isArray(nest(spans).layered));
});

check("nest reports depth", () => {
  assert.strictEqual(typeof nest(spans).depth, "number");
});

check("trim returns kept", () => {
  assert.ok(Array.isArray(trim(spans, 4, 2).kept));
});

check("trim reports merged", () => {
  assert.ok(Array.isArray(trim(spans, 4, 2).merged));
});

check("render exposes budget_used", () => {
  assert.strictEqual(typeof render({ spans: spans, budget: 4, max_depth: 2 }).budget_used, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
