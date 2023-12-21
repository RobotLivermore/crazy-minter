export function bytesToHex(bytes: Uint8Array) {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
}