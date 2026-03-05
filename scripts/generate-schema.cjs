// Usage: node scripts/generate-schema.cjs <source-path> <type-name> <output> [...flags]
// Generates a JSON schema from a TypeScript type.
// Extra flags are passed through to ts-json-schema-generator.
const { execFileSync } = require("child_process");
const { mkdirSync } = require("fs");
const { dirname, join } = require("path");

const [sourcePath, typeName, output, ...extraFlags] = process.argv.slice(2);
if (!sourcePath || !typeName || !output) {
  console.error(
    "Usage: node scripts/generate-schema.cjs <source-path> <type-name> <output> [...flags]",
  );
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });

execFileSync(
  join(__dirname, "../node_modules/.bin/ts-json-schema-generator"),
  [
    "--path",
    sourcePath,
    "--type",
    typeName,
    "--tsconfig",
    "tsconfig.json",
    "--no-type-check",
    "--out",
    output,
    ...extraFlags,
  ],
  { stdio: "inherit" },
);
