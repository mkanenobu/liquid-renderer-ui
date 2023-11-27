import { compress, decompress } from "./data-serializer/compress.ts";
import {
  fromUrlSafeBase64,
  toUrlSafeBase64,
  uint8ArrayToString,
} from "./data-serializer/buffer-helper.ts";

export const serializeData = async (data: object) => {
  const compressed = await compress(JSON.stringify(data));
  const urlSafeBase64 = toUrlSafeBase64(compressed);
  return urlSafeBase64;
};

export const deserializeData = async (rawData: string) => {
  const compressed = fromUrlSafeBase64(rawData);
  const decompressed = await decompress(compressed);
  const str = uint8ArrayToString(decompressed);
  return str;
};
