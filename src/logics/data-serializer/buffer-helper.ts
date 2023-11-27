export const stringToUint8Array = (str: string) => {
  return new TextEncoder().encode(str);
};

export const uint8ArrayToString = (uint8array: Uint8Array) => {
  return new TextDecoder().decode(uint8array);
};

export const toUrlSafeBase64 = (uint8Array: Uint8Array) => {
  let binaryString = "";
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });

  const base64String = btoa(binaryString);

  const urlSafeBase64String = base64String
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return urlSafeBase64String;
};

export const fromUrlSafeBase64 = (urlSafeBase64String: string) => {
  let base64String = urlSafeBase64String.replace(/-/g, "+").replace(/_/g, "/");

  while (base64String.length % 4 !== 0) {
    base64String += "=";
  }

  const binaryString = atob(base64String);

  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
};
