export function sortAddress(addr?: string): string {
  if (!addr) return "None";
  return `${addr.slice(0, 5)}...${addr.slice(-3)}`;
}
