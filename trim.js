// trim.js：预算裁剪。超深区间并入上限层（记入 merged，不再占预算）；
// 其余按层号升序、同层按起点升序占用预算，超预算的记入 dropped。
import { nest } from "./nest.js";

export function trim(spans, budget, maxDepth) {
  const depthOf = new Map(nest(spans).layered);
  const cap = typeof maxDepth === "number" ? maxDepth : Infinity;
  const limit = typeof budget === "number" ? Math.max(0, budget) : spans.length;
  const merged = [];
  const candidates = [];
  spans.forEach((span, index) => {
    if (depthOf.get(span.id) > cap) merged.push(span.id);
    else candidates.push({ id: span.id, depth: depthOf.get(span.id), start: span.start, index });
  });
  candidates.sort((a, b) => (a.depth - b.depth) || (a.start - b.start) || (a.index - b.index));
  const keptIds = new Set(candidates.slice(0, limit).map((item) => item.id));
  const mergedIds = new Set(merged);
  const kept = [];
  const dropped = [];
  for (const span of spans) {
    if (mergedIds.has(span.id)) continue;
    (keptIds.has(span.id) ? kept : dropped).push(span.id);
  }
  return { kept, dropped, merged, used: kept.length };
}
