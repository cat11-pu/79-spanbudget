// trim.js：预算裁剪（基线：不裁剪、不标记）
export function trim(spans, budget, maxDepth) {
  return { kept: spans.map((span) => span.id), dropped: [], merged: [], used: spans.length };
}
