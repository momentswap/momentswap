import { Media } from "@utils/definitions/interfaces";
import { PinataSDK } from "pinata";

const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
const pinata = new PinataSDK({
  pinataJwt: jwt,
  pinataGateway: "gray-glad-ostrich-824.mypinata.cloud",
});

// NFT.Stroage
// We can fetch storage deal IDs and pinning info from NFT.Storage
// Would be super handy for future when on mainnet for expanded use case
export const fetchNFTStoreStatus = async (ipfsCID: string) => {
  return pinata.files.public.list().cid(ipfsCID);
};

export const storeMediaToIPFS = async (mediaFile: File) => {
  const mediaType = mediaFile.type;
  console.info("Storing media to IPFS...");
  const mediaCID = await pinata.upload.public.file(mediaFile);
  console.info("Success! Media CID:", mediaCID);
  return { mediaCID, mediaType };
};

// Create NFT Metadata
export const createMomentSwapMetadata = (owner: string, contentText: string, media?: Media) => {
  return {
    name: "MomentSwap Hyperspace NFTs 2023",
    description: contentText,
    image: new Blob(),
    properties: {
      authors: [{ addres: owner }],
      content: {
        "text/markdown": contentText,
      },
      media: {
        cid: media?.cid,
        type: media?.type,
      },
    },
  };
};

// Store NFT Metadata to NFT.Storage
export const storeMetadataToIPFS = async (metadata: any) => {
  console.info("Storing Metadata to IPFS...");
  try {
    const result = await pinata.upload.public.json(metadata);
    const metadataCID = result.cid;
    const url = await pinata.gateways.public.convert(metadataCID);

    console.info("Success! Metadata IPFS URL:", url);
    return url;
  } catch (error) {
    console.error("Failed to store metadata to IPFS:", error);
    throw error;
  }
};

export const ipfsCidToHttpUrl = async (ipfsCid: string) => {
  return await pinata.gateways.public.convert(ipfsCid);
};
