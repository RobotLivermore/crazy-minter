export function bytesToHex(bytes: Uint8Array) {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
}

export function hexToBytes(hexString: string) {
  // Remove any leading "0x" if present
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }

  // Check if the string has an odd length
  if (hexString.length % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters.");
  }

  // Create a new Uint8Array
  const uint8Array = new Uint8Array(hexString.length / 2);

  // Convert the hexadecimal string to bytes
  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.slice(i, i + 2), 16);
    uint8Array[i / 2] = byteValue;
  }

  return uint8Array;
}