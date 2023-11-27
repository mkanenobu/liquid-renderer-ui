import { expect, test } from "vitest";
import { compress, decompress } from "./compress.ts";
import { uint8ArrayToString } from "./buffer-helper.ts";

test("compress and decompress", async () => {
  const data = "hello world!";

  const compressed = await compress(data);
  console.log(compressed);

  const uncompressed = await decompress(compressed);
  console.log(uncompressed);
  console.log(uint8ArrayToString(uncompressed));
  expect(uint8ArrayToString(uncompressed)).toBe(data);
});
