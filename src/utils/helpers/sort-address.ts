export const sortAddress = (addr?: string): string => {
  if (!addr) return "---";
  if (addr.length > 8) {
    return `${addr.slice(0, 5)}...${addr.slice(-3)}`;
  } else {
    return addr;
  }
};
