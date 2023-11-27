import { stringToUint8Array } from "./buffer-helper.ts";

export const compress = async (data: string) => {
  const buffer = stringToUint8Array(data);

  const compressionStream = new CompressionStream("deflate");
  const writer = compressionStream.writable.getWriter();

  writer.write(buffer);
  writer.close();

  const reader = compressionStream.readable.getReader();

  const chunks = [];
  let totalSize = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    totalSize += value.length;
  }

  const compressed = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  return compressed;
};

export const decompress = async (data: Uint8Array) => {
  const decompressionStream = new DecompressionStream("deflate");
  const writer = decompressionStream.writable.getWriter();

  writer.write(data);
  writer.close();

  const reader = decompressionStream.readable.getReader();

  const chunks = [];
  let totalSize = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    totalSize += value.length;
  }

  const decompressed = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    decompressed.set(chunk, offset);
    offset += chunk.length;
  }

  return decompressed;
};
