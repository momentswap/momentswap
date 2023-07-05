import { XIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import axios from "axios";

import { useMomentSwapContract, useNotifyStatus, useWalletProvider } from "@hooks";
import { Media } from "@utils/definitions/interfaces";
import { createMomentSwapMetadata, storeMediaToIPFS, storeMetadataToIPFS } from "@utils/helpers";
import { useAleoPrivateKey, useAleoRecords, useChainList } from "src/hooks/use-chain-list";
import { workerHelper } from "@utils/helpers/aleo/worker-helper";
import { aleoHelper } from "@utils/helpers/aleo/aleo-helper";
import { base58ToAscii, base58ToInteger, integerToBase58, splitAndAddField, stringToBase58 } from "@utils/helpers/aleo/aleo-decode";


export const PublishModal = () => {
  const router = useRouter();
  const { address } = useWalletProvider();
  const { mintMomentSwapNFT } = useMomentSwapContract();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media | undefined>(undefined);
  const setNotifySuccess = useNotifyStatus((state) => state.success);
  const setNotifyFail = useNotifyStatus((state) => state.fail);
  const setNotifyReset = useNotifyStatus((state) => state.resetStatus);
  const currentNet = useChainList((s) => s.TYPE);
  const workerRef = useRef<Worker>();
  const aleoAddress = useAleoPrivateKey(s=>s.Address)
  const aleoRecords = useAleoRecords(s=>s.records)
  const x1 = useAleoPrivateKey(s=>s.PK)    

  
  
  
  // const inputString = 'aleo1nhhxn6j9eepa83yhyzu9zsm37axygm9d2ds6z4yft4et63kt7y8qt23hmw';
  // const base58String = stringToBase58(inputString);
  // console.log(base58ToInteger(base58String));
  // console.log(integerToBase58(base58ToInteger(base58String)));
  // console.log(base58ToAscii(integerToBase58(base58ToInteger(base58String))));
  


  const uploadInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length == 0 || loading) {
      return;
    }
    const file = e.target.files && e.target.files[0];
    setLoading(true);
    if (file) {
      try {
        const { mediaCID, mediaType } = await storeMediaToIPFS(file);
        setMedia({ url: `https://${mediaCID}.ipfs.dweb.link`, type: mediaType, cid: mediaCID });
      } catch (err) {
        console.error("Failed to store media, error:", err);
        alert("Failed to store media, please try again.");
      }
    }
    setLoading(false);
  };

  const publishHandler = async () => {
    if (currentNet==="FIL"&&!address) return;
    const metadata = currentNet==="FIL"? createMomentSwapMetadata(address as string, text, media):currentNet==="ALEO"&&createMomentSwapMetadata(aleoAddress, text, media);

    try {
      const metadataIPFS = await storeMetadataToIPFS(metadata);
      const feeRecord = JSON.parse(window.localStorage.getItem("aleoRecords") as string)?.filter((t:any)=>t.result.indexOf("microcredits")>-1).sort((a,b)=>b.height-a.height)[0];

      setNotifySuccess();
      if(currentNet==="ALEO"){
        workerRef.current = workerHelper();
        workerRef.current.addEventListener("message", ev => {
          if (ev.data.type == 'EXECUTION_TRANSACTION_COMPLETED') {
              axios.post("https://vm.aleo.org/api" + "/testnet3/transaction/broadcast", ev.data.executeTransaction, {
                  headers: {
                      'Content-Type': 'application/json',
                  }
              }).then(
                  (response:any) => {
                      console.log(response.data);
                      var request = indexedDB.open('aleoDB', 1);

                    request.onsuccess = function(event:any) {
                      var db = event.target.result;

                      var transaction = db.transaction(['AleoStore'], 'readwrite');
                      var store = transaction.objectStore('AleoStore');

                      var deleteRequest = store.delete(feeRecord.id);

                      deleteRequest.onsuccess = function(event) {
                        console.log('success');
                      };

                      deleteRequest.onerror = function(event) {
                        console.log('fail');
                      };

                      transaction.oncomplete = function() {
                        db.close();
                      };
                    };

                    request.onerror = function(event) {
                      console.log('open db error');
                    };
                  }
              )
          } else if (ev.data.type == 'ERROR') {
              alert(ev.data.errorMessage);
              console.log(ev.data.errorMessage);
          }
      });
        const {remoteProgram,privateKey,url} = aleoHelper();
      
        workerRef.current?.postMessage({
          type: 'ALEO_EXECUTE_PROGRAM_ON_CHAIN',
          remoteProgram,
          aleoFunction:"create_public_moment",
          inputs:[...splitAndAddField(base58ToInteger(stringToBase58(metadataIPFS.toString())), "field"),new Date().getTime().toString()+"u64"],
          privateKey:x1,
          fee: 0.1,
          feeRecord:feeRecord.result,
          url
        });
      }
      if(currentNet==="FIL"){
        const res = await mintMomentSwapNFT(metadataIPFS.toString());
        await res.wait();
      }
     
      // alert("Successfully published moment!");
      setNotifyReset();
      router.push("/");
    } catch (err) {
      setNotifyFail();
      console.error("Failed to publish moment, error:", err);
      // alert("Failed to publish moment.");
    }
  };

  const cleanFileInput = () => {
    // TODO: Reset "media-input" selected file.
    setMedia(undefined);
  };

  return (
    <>
      <input type="checkbox" id="publish-modal" className="modal-toggle" />
      <label htmlFor="publish-modal" className="modal cursor-pointer select-none">
        <label htmlFor="" className="modal-box px-14">
          <label htmlFor="publish-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>
          <h3 className="font-bold text-lg">Record your moments!</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="textarea textarea-bordered w-full mt-5"
            placeholder="Just say something."
          />

          <div
            className={`relative min-h-16 rounded-2xl overflow-hidden ${!media && !loading && "hidden"} ${
              loading && "animate-pulse bg-base-300"
            }`}
          >
            <XIcon
              onClick={cleanFileInput}
              className="border h-7 z-50 m-1 absolute right-2 top-2 cursor-pointer shadow-md bg-white text-gray-500 rounded-full"
            />
            {/^image/.test(media?.type || "unknow") ? (
              <img src={media?.url} alt="moment-media" />
            ) : /^video/.test(media?.type || "unknow") ? (
              <video controls disablePictureInPicture src={media?.url} />
            ) : null}
          </div>

          <div className="divider" />

          {/* Media Uploader */}

          <label
            htmlFor="media-input"
            className="inline-block p-1 hover:bg-primary rounded-full active:bg-primary-focus"
          >
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
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </label>
          <input
            id="media-input"
            hidden
            type="file"
            accept=".jpeg,.jpg,.png,.gif,image/*,video/mp4,video/webm,video/ogg"
            onChange={uploadInput}
          />

          <div className="modal-action">
            <label
              htmlFor="publish-modal"
              className={`btn btn-primary ${loading && "pointer-events-none saturate-0"}`}
              onClick={publishHandler}
            >
              Publish
            </label>
          </div>
        </label>
      </label>
    </>
  );
};
