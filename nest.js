// nest.js：分层（基线：全部放在同一层）
export function nest(spans) {
  return { layered: spans.map((span) => [span.id, 0]), depth: 1, merged: [] };
}
