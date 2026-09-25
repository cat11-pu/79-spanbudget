import fs from "node:fs";
import { nest } from "./nest.js";
import { trim } from "./trim.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/spans.json", "utf8"));
const layered = nest(spec.spans || []);
const trimmed = trim(spec.spans || [], spec.budget, spec.max_depth);
const view = render(spec);

emit("每个区间的层 =", JSON.stringify(layered.layered));
emit("最大深度 =", layered.depth);
emit("保留的区间 =", JSON.stringify(trimmed.kept));
emit("超出预算被合并的区间 =", JSON.stringify(trimmed.merged));
emit("丢弃的区间 =", JSON.stringify(trimmed.dropped));
emit("预算消耗 =", trimmed.used);
emit("深度上限 =", spec.max_depth);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = nest([{ id: "s0", start: 0, end: 5, parent: "missing" }]);
  emit("父区间缺失的错误码", bad.layered.length ? (bad.code || "no-code") : "no-error");
} catch (error) {
  emit("父区间缺失的错误码", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "每个区间的层": [
    [
      "s0",
      0
    ],
    [
      "s1",
      1
    ],
    [
      "s2",
      2
    ],
    [
      "s3",
      1
    ],
    [
      "s4",
      2
    ],
    [
      "s5",
      0
    ]
  ],
  "最大深度": 2,
  "保留的区间": [
    "s0",
    "s1",
    "s3",
    "s5"
  ],
  "超出预算被合并的区间": [],
  "丢弃的区间": [
    "s2",
    "s4"
  ],
  "预算消耗": 4,
  "深度上限": 2
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
