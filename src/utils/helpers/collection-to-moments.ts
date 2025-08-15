import { MomentMetadata, MomentSwapFRC721NFT } from "@utils/definitions/interfaces";
import { ipfsCidToHttpUrl } from "@utils/helpers/nftstorage";
import { extractCidFromMedia } from "@utils/helpers/media-utils"; // 添加导入

export const collectionToMoments = async (collection: MomentSwapFRC721NFT[]): Promise<MomentMetadata[]> => {
  let result: Array<MomentMetadata> = [];

  if (collection.length === 0) return result;

  const preMoments = [...collection].reverse().map<MomentMetadata>((item) => ({
    address: item[0],
    id: item[2].toString(),
    timestamp: item[3].toNumber(),
    metadataURL: item[1],
  }));

  if (!preMoments) return result;

  for (let index = 0; index < preMoments.length; index++) {
    let metadata;
    try {
      metadata = await fetch(preMoments[index].metadataURL).then((res) => res.json());
    } catch (err) {
      console.error(`Failed get Metadata [${preMoments[index].id}] from [${preMoments[index].metadataURL}]`);
      continue;
    }

    preMoments[index].contentText = metadata.properties.content["text/markdown"];

    try {
      const actualCid = extractCidFromMedia(metadata.properties.media?.cid);
      if (actualCid) {
        preMoments[index].media = await ipfsCidToHttpUrl(actualCid);
        preMoments[index].mediaType = metadata.properties.media.type || '';
      }
    } catch (error) {
      console.error('Error processing media for NFT', preMoments[index].id, error);
    }

    result.push(preMoments[index]);
  }

  return result;
};