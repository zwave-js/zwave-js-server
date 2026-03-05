// Usage: node scripts/generate-schema.cjs <source-path> <type-name> <output-base> [...flags]
// Generates a JSON schema from a TypeScript type, then wraps it as a TS module.
// Output: <output-base>.json and <output-base>.ts
// Extra flags are passed through to ts-json-schema-generator.
const { execFileSync } = require("child_process");
const { mkdirSync, readFileSync, writeFileSync } = require("fs");
const { dirname } = require("path");

const [sourcePath, typeName, outputBase, ...extraFlags] = process.argv.slice(2);
if (!sourcePath || !typeName || !outputBase) {
  console.error(
    "Usage: node scripts/generate-schema.cjs <source-path> <type-name> <output-base> [...flags]",
  );
  process.exit(1);
}

mkdirSync(dirname(outputBase), { recursive: true });

execFileSync(
  "ts-json-schema-generator",
  [
    "--path",
    sourcePath,
    "--type",
    typeName,
    "--tsconfig",
    "tsconfig.json",
    "--no-type-check",
    "--out",
    `${outputBase}.json`,
    ...extraFlags,
  ],
  { stdio: "inherit" },
);

const json = readFileSync(`${outputBase}.json`, "utf-8").trimEnd();
writeFileSync(`${outputBase}.ts`, `export default ${json};\n`);
