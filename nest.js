// nest.js：按 parent 链迭代计算每个区间的层号（根为 0），不使用递归，十万级区间不会爆栈。
export function nest(spans) {
  const list = spans || [];
  const byId = new Map();
  for (const span of list) byId.set(span.id, span);

  const depthOf = new Map();
  let maxDepth = 0;

  function fail(message) {
    const error = new Error(message);
    error.code = "E_MISSING_PARENT";
    throw error;
  }

  for (const span of list) {
    if (depthOf.has(span.id)) continue;

    // 沿 parent 链向上收集当前路径；遇到已算层号的祖先可直接回填，遇到重复节点说明有环。
    const chain = [];
    const visiting = new Set();
    let node = span;
    let baseDepth;

    while (true) {
      if (depthOf.has(node.id)) {
        baseDepth = depthOf.get(node.id);
        break;
      }
      if (visiting.has(node.id)) fail("区间父子链存在环: " + node.id);
      visiting.add(node.id);
      chain.push(node.id);

      const parentId = node.parent;
      if (parentId === null || parentId === undefined) {
        baseDepth = -1; // 链尾是根，回填时 +1 得到 0
        break;
      }
      const parent = byId.get(parentId);
      if (!parent) fail("父区间缺失: " + parentId);
      node = parent;
    }

    let depth = baseDepth;
    for (let i = chain.length - 1; i >= 0; i--) {
      depth += 1;
      depthOf.set(chain[i], depth);
      if (depth > maxDepth) maxDepth = depth;
    }
  }

  const layered = list.map((span) => [span.id, depthOf.get(span.id)]);
  return { layered, depth: list.length ? maxDepth : 0, merged: [] };
}
