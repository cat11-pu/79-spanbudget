// trim.js：超过深度上限的区间合并进上限层（记入 merged）；其余区间按层号、起点排序后在预算内保留。
import { nest } from "./nest.js";

export function trim(spans, budget, maxDepth) {
  const list = spans || [];
  const { layered } = nest(list);
  const layerOf = new Map(layered);

  const depthCap = Number.isFinite(maxDepth) ? maxDepth : Infinity;
  const budgetCap = Number.isFinite(budget) ? budget : Infinity;
  const merged = [];
  const candidates = [];

  list.forEach((span, index) => {
    const layer = layerOf.get(span.id);
    if (layer > depthCap) {
      merged.push(span.id); // 太深不单独画，折叠进上限那一层
    } else {
      candidates.push({ id: span.id, layer, start: span.start, index });
    }
  });

  // 保留优先级：层号升序，同层按起点升序，再用输入下标兜底保证确定顺序（幂等）。
  const ordered = candidates.slice().sort((a, b) => {
    if (a.layer !== b.layer) return a.layer - b.layer;
    const startA = Number.isFinite(a.start) ? a.start : 0;
    const startB = Number.isFinite(b.start) ? b.start : 0;
    if (startA !== startB) return startA - startB;
    return a.index - b.index;
  });

  const limit = Math.max(0, Math.min(budgetCap, ordered.length));
  const keptSet = new Set();
  for (let i = 0; i < limit; i++) keptSet.add(ordered[i].id);

  // 输出按原始输入顺序，便于与输入逐条对照。
  const kept = [];
  const dropped = [];
  for (const span of list) {
    if (layerOf.get(span.id) > depthCap) continue;
    if (keptSet.has(span.id)) kept.push(span.id);
    else dropped.push(span.id);
  }

  return { kept, dropped, merged, used: kept.length };
}
