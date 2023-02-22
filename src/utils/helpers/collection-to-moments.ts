import { MomentMetadata, MomentSwapFRC721NFT } from "@utils/definitions/interfaces";

export const collectionToMoments = async (collection: MomentSwapFRC721NFT[]): Promise<MomentMetadata[]> => {
  if (collection.length === 0) return [];
  const moments = [...collection].reverse().map<MomentMetadata>((item) => ({
    address: item[0],
    id: item[2].toString(),
    timestamp: item[3].toNumber(),
    metadataURL: `https://${item[1].split("/")[2]}.ipfs.dweb.link/metadata.json`,
  }));

  if (!moments) return [];
  for (const m of moments) {
    const metadata = await fetch(m.metadataURL).then((res) => res.json());
    m.contentText = metadata.properties.content["text/markdown"];
    m.media = `https://${metadata.properties.media.cid}.ipfs.dweb.link`;
    m.mediaType = metadata.properties.media.type;
  }

  return moments;
};
