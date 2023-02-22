export const sortAddress = (addr?: string): string => {
  if (!addr) return "---";
  if (addr.length > 8) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  } else {
    return addr;
  }
};
