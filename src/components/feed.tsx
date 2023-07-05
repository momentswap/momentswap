import { Loader, Moment, ThemeToggle } from "@components";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import faker from 'faker';

import { useMomentSwapContract, useSpaceFNSContract } from "@hooks";
import { MomentMetadata } from "@utils/definitions/interfaces";
import { collectionToMoments } from "@utils/helpers/collection-to-moments";
import { searchKeyState } from "src/atom";
import { useChainList } from "src/hooks/use-chain-list";
import { AleoLayout } from "./AleoLayout";
import { ToDecodeBase58 } from "@utils/helpers/aleo/aleo-decode";
import axios from "axios";
import { TimeAgoAgo } from "@utils/helpers/aleo/time";


export const Feed = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [moments, setMoments] = useState<Array<MomentMetadata>>([]);
  const { getNFTCollection } = useMomentSwapContract();
  const [searchKey, setSearchKey] = useRecoilState(searchKeyState);
  const { getAllDomainByCreator, getAvatar } = useSpaceFNSContract();
  const chainNet = useChainList((s) => s.TYPE);
  const [refresh,setRefresh] = useState<boolean>(false)

  useEffect(() => {
  if(chainNet==="FIL") {
    
    (async () => {
      setLoading(true);
      const collection = await getNFTCollection();

      const _moments = await collectionToMoments(collection);
      for (let m of _moments) {
        try {
          const [_mainDomain] = await getAllDomainByCreator(m.address);
          m.username = _mainDomain;

          const _avatarUrl = await getAvatar(m.address);
          m.userImg = _avatarUrl;
        } catch {
          m.username = "---";
        }
      }
      setMoments(_moments);
      setLoading(false);
    })();
  }
  }, [getNFTCollection, getAvatar]);


const generateFakeData = (): MomentMetadata[] => {
  const fakeData: MomentMetadata[] = [];
  const metadata_uri = JSON.parse(window.localStorage.getItem("aleoRecords") as string)?.filter(t=>t.result.indexOf("metadata_uri1")>-1)
  // const metadata = metadata_uri?.map((t:any)=>t.result.split("metadata_uri1:")[1]?.split(".private")[0].split("field")[0])
  const handledUri = ToDecodeBase58(metadata_uri?.map(t=>{
    const regex = /metadata_uri[1-5]: (\d+)[a-z.]+/g;
    let match;
    const values = [];

    while ((match = regex.exec(t.result)) !== null) {
      const value = match[1].substring(1); // Remove the first digit
      values.push(value);
    }

    const result = values.join('');

  return result;
  }))?.map(t=>t.replace("ipfs://","https://ipfs.io/ipfs/"))
  const requests = handledUri?.map((address:any) => axios.get(address));

  Promise.all(requests)
  .then((results) => {
    results.forEach((response,i) => {
      const timeIndex = metadata_uri[i].result.indexOf("time:");
      const u64Index = metadata_uri[i].result.indexOf("u64", timeIndex);
      const timeValue = metadata_uri[i].result.slice(timeIndex + 5, u64Index).trim();

      const moment: MomentMetadata = {
        id: faker.random.uuid(),
        address: response.data.name,
        timestamp: TimeAgoAgo.format(Number(timeValue)),
        timestamp_n: timeValue,
        metadataURL:"https://ipfs.io/ipfs/"+response.data.properties.media.cid,
        contentText: response.data.description,
        username: window.localStorage.getItem("aleoAvatarName")??"",
        // userImg: window.localStorage.getItem("aleoAvatar") as string??"",
        userImg: "https://i.seadn.io/gcs/files/06a9042df571917b3904517e89baca76.png?auto=format&dpr=1&w=640",
        media: "https://ipfs.io/ipfs/"+response.data.properties.media.cid,
        mediaType: response.data.properties.media.type,
      };
      
      fakeData.push(moment);
      fakeData.sort((a,b)=>(b?.timestamp_n??0) - (a?.timestamp_n??0))
      
      setMoments(fakeData);
      setRefresh(!refresh)
    }); 
  })
  .catch((error) => { 
    console.error( error);
  });
  
  
  return fakeData;
};


useEffect(()=>{
  setMoments([]);
  setLoading(true);
  if(chainNet==="ALEO") {
    // Generate fake data
    setInterval(()=>{})
    const fakeMoments: MomentMetadata[] = generateFakeData();
    
    setMoments(fakeMoments);
    setLoading(false);
  } 
  
},[chainNet])

  return (
    <div className="border-l border-r border-primary xl:min-w-[576px] flex-grow max-w-xl w-[100vw] h-[100%]">
      <div className="flex items-center justify-between p-2 sticky top-0 z-50 bg-base-200 border-primary">
        <h2 className="text-lg sm:text-xl font-bold cursor-pointer">Home</h2>
        <img src="/logo.png" alt="" className="h-8 w-8 sm:hidden" />
        <div className="flex items-center justify-center px-0 w-9 h-9">
          <ThemeToggle />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center h-[100%] items-center">
          <Loader />
        </div>
      ) : chainNet==="FIL"?moments.length > 0 ? (
        <AnimatePresence>
          {moments?.map((moment) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <Moment key={moment.id} moment={moment} />
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <div className="flex justify-center h-[100%] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p>No records</p>
        </div>
      ): chainNet==="ALEO"&&<AleoLayout data={moments}/>
      }
    </div>
  );
};
