// Usage: node scripts/wrap-json-module.cjs <input.json> <output.ts>
// Wraps a JSON file as a TypeScript module with a default export.
const { readFileSync, writeFileSync } = require("fs");

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error(
    "Usage: node scripts/wrap-json-module.cjs <input.json> <output.ts>",
  );
  process.exit(1);
}

const json = readFileSync(input, "utf-8").trimEnd();
writeFileSync(output, `export default ${json};\n`);
