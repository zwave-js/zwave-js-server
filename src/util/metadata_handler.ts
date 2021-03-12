import { ValueID, ValueMetadata, ZWaveNode } from "zwave-js";

export const getValueMetadata = (
  node: ZWaveNode,
  valueArgs: ValueID,
  schemaVersion: number
): ValueMetadata => {
  let metadata: ValueMetadata;
  metadata = node.getValueMetadata(valueArgs);
  schemaTransformValueMetadata(metadata, schemaVersion);
  return metadata;
};

export const schemaTransformValueMetadata = (
  metadata: ValueMetadata,
  schemaVersion: number
): void => {
  if (schemaVersion <= 1 && metadata.type === "buffer") {
    metadata.type = "string";
  }
};
