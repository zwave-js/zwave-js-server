import { configs } from "triple-beam";

const loglevels = configs.npm.levels;

export function numberFromLogLevel(
  logLevel: string | undefined,
): number | undefined {
  if (logLevel == undefined) return;
  for (const [level, value] of Object.entries(loglevels)) {
    if (level === logLevel) return value;
  }
}
