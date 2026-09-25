// nest.js：分层。层号为从根到该区间的深度（根为零），迭代计算避免深链爆栈。
export function nest(spans) {
  const byId = new Map();
  for (const span of spans) byId.set(span.id, span);
  const depthOf = new Map();
  for (const span of spans) {
    if (depthOf.has(span.id)) continue;
    const chain = [];
    const seen = new Set();
    let node = span;
    while (node && !depthOf.has(node.id)) {
      if (seen.has(node.id)) {
        const error = new Error("parent chain never reaches a root at " + node.id);
        error.code = "E_MISSING_PARENT";
        throw error;
      }
      seen.add(node.id);
      chain.push(node);
      const parentId = node.parent;
      if (parentId === null || parentId === undefined) {
        node = null;
      } else {
        const parent = byId.get(parentId);
        if (!parent) {
          const error = new Error("missing parent " + parentId + " for span " + node.id);
          error.code = "E_MISSING_PARENT";
          throw error;
        }
        node = parent;
      }
    }
    let depth = node ? depthOf.get(node.id) + 1 : 0;
    for (let index = chain.length - 1; index >= 0; index -= 1) {
      depthOf.set(chain[index].id, depth);
      depth += 1;
    }
  }
  const layered = spans.map((span) => [span.id, depthOf.get(span.id)]);
  let depth = 0;
  for (const pair of layered) if (pair[1] > depth) depth = pair[1];
  return { layered, depth, merged: [] };
}
