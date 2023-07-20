import minimist from "minimist";

export const parseArgs = <T>(expectedKeys: string[]): T => {
  const args = minimist(process.argv.slice(2));

  const extraKeys = Object.keys(args).filter(
    (key) => !expectedKeys.includes(key),
  );

  if (extraKeys.length > 0) {
    console.error(`Error: Got unexpected keys ${extraKeys.join(", ")}`);
    process.exit(1);
  }

  return args as unknown as T;
};
