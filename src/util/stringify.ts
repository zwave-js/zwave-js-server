import { isUint8Array } from "node:util/types";

export function stringifyReplacer(key: string, value: any): any {
  // Ensure that Uint8Arrays are serialized as if they were Buffers
  // to keep the API backwards compatible
  if (isUint8Array(value)) {
    return { type: "Buffer", data: Array.from(value) };
  }
  return value;
}
