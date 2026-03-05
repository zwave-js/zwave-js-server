// Usage: node scripts/generate-schema.cjs <source-path> <type-name> <output-base>
// Generates a JSON schema from a TypeScript type, then wraps it as a TS module.
// Output: <output-base>.json and <output-base>.ts
const { execFileSync } = require("child_process");
const { mkdirSync, readFileSync, writeFileSync } = require("fs");
const { dirname } = require("path");

const [sourcePath, typeName, outputBase] = process.argv.slice(2);
if (!sourcePath || !typeName || !outputBase) {
  console.error(
    "Usage: node scripts/generate-schema.cjs <source-path> <type-name> <output-base>",
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
  ],
  { stdio: "inherit" },
);

const json = readFileSync(`${outputBase}.json`, "utf-8").trimEnd();
writeFileSync(`${outputBase}.ts`, `export default ${json};\n`);
