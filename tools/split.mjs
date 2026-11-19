// Inverse of reassemble.mjs: after editing src/engine/model.ts or shader.ts, write them back into
// numbered parts (each ≤ 24 kB, cut on line boundaries) so `npm run reassemble` reproduces them exactly.
//   node tools/split.mjs
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIMIT = 24000;
const dir = join(root, 'src/engine/parts');
for (const name of ['model', 'shader', 'skin']) {
  const src = readFileSync(join(root, `src/engine/${name}.ts`));
  for (const f of readdirSync(dir)) if (f.startsWith(`${name}.part`)) unlinkSync(join(dir, f));
  let at = 0, n = 0;
  while (at < src.length) {
    let end = Math.min(src.length, at + LIMIT);
    if (end < src.length) { const nl = src.lastIndexOf(10, end - 1); if (nl > at) end = nl + 1; }
    writeFileSync(join(dir, `${name}.part${String(++n).padStart(2, '0')}.txt`), src.subarray(at, end));
    at = end;
  }
  console.log(`split: src/engine/${name}.ts (${src.length} bytes) -> ${n} parts`);
}
