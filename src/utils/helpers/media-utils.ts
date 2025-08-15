export const extractCidFromMedia = (mediaCid: any): string | null => {
  if (typeof mediaCid === 'string') {
    return mediaCid;
  } else if (typeof mediaCid === 'object' && mediaCid.cid) {
    return mediaCid.cid;
  }
  return null;
};