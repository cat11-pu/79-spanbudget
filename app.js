// app.js：渲染结果
import { nest } from "./nest.js";
import { trim } from "./trim.js";

export function render(spec) {
  const layered = nest(spec.spans || []);
  const trimmed = trim(spec.spans || [], spec.budget, spec.max_depth);
  return { layered: layered.layered, depth: layered.depth, kept: trimmed.kept,
           dropped: trimmed.dropped, merged: trimmed.merged, budget_used: trimmed.used };
}
