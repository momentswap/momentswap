"use client"
import { SearchIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Key, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import Link from 'next/link'

import { Footer, News } from "@components";
import { searchKeyState } from "src/atom";
import { useAleoLoading, useAleoPrivateKey, useAleoRecords, useChainList } from "src/hooks/use-chain-list";
import { Collapse,Button, Form, Input, InputNumber,Select,Option } from "antd";
import axios from "axios";
import { workerHelper, workerRecordHelper } from "@utils/helpers/aleo/worker-helper";
import ReactDOM from "react-dom";
import { aleoHelper } from "@utils/helpers/aleo/aleo-helper";

//@ts-ignore

export const Widgets = ({ newsResults, randomUsersResults }: any) => {
  const [articleNum, setArticleNum] = useState(3);
  const [_searchKey, _setSearchKey] = useState("");
  const [randomUserNum, setRandomUserNum] = useState(3);
  const [searchKey, setSearchKey] = useRecoilState(searchKeyState);
  const [aleo,setAleo] = useState<any>(null)
  const [records,setRecords] = useState<any>(null)
  const [loadingRegister,setLoadingRegister] = useState(true)
  const started = useRef(false);
  const isLogin = useAleoPrivateKey(s=>s.login)    
  useEffect(()=>{
    setAleoRecords(records)
  },[records])
  useEffect(() => {
    _setSearchKey(searchKey);
  }, [searchKey]);

  const chainList = useChainList(s=>s.TYPE)
  const setIsLogin = useAleoPrivateKey(s=>s.setLogin)    
  const setAleoLoading = useAleoLoading(s=>s.setLoading)
  const aleoLoading = useAleoLoading(s=>s.loading)
  const setAleoRecords = useAleoRecords(s=>s.setRecords)
  const aleoRecords = useAleoRecords(s=>s.records)

  const workerRef = useRef<Worker>();
  const workerExecRef = useRef<Worker>();
  const x1 = useAleoPrivateKey(s=>s.PK)    
  const setAleoAddress = useAleoPrivateKey(s=>s.setAleoAddress)   
  const [rqPage,setRqPage] = useState(1)
  
  console.log("---------------------------------------------------");
  const handleClick =  () => {
    //@ts-ignore
    import('aleo-wasm-swift-decrypt-record').then(module =>  setAleo(module));
  };
  useEffect(()=>{
    handleClick()
    spawnWorker()

  },[])
    useEffect(()=>{
      
      handleRecords()
    },[isLogin])

    useEffect(()=>{
      (async function() {
      aleo&&await aleo.default()
      typeof window !== "undefined"&&JSON.parse(window?.localStorage.getItem("aleoRecords") as string)&&typeof window !== "undefined"&&JSON.parse(window?.localStorage.getItem("aleoRecords") as string).forEach((t,i) => {
        const s = aleo?.PrivateKey?.from_string(x1).decryptrecords(JSON.stringify([{record_ciphertext:t.record_ciphertext,sn_id:t.sn_id}]))
        
        s&&axios.get('https://vm.aleo.org/api/testnet3/find/transitionID/'+ (JSON.parse(s)[0].sn_id)).then(e=>{
          console.log(e,"is used");
          var request = indexedDB.open('aleoDB', 1);

          request.onsuccess = function(event:any) {
            var db = event.target.result;

            var transaction = db.transaction(['AleoStore'], 'readwrite');
            var store = transaction.objectStore('AleoStore');

            var deleteRequest = store.delete(t.id);

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
        })
      });
    }())

    })

  const spawnWorker = useCallback(()=> {
    workerRef.current = workerRecordHelper();
    workerExecRef.current = workerHelper();
  },[])
console.log(aleo);


  const handleRecords = async (now?:string) => {
    if(started.current){return}
    console.log(aleo);
    
    await aleo.default() 
    const privateKey = (aleo?.PrivateKey.from_string(x1));

    const viewKey = privateKey?.to_view_key().to_string();
    const v = aleo?.ViewKey.from_string(viewKey);
    const address = privateKey?.to_address().to_string();
    console.log(viewKey);
    console.log(privateKey?.to_string());
    console.log(privateKey?.to_address().to_string());
    address&&setAleoAddress(address)
    address&&window.localStorage.setItem("aleoAddress",address)
    
    
    let page 
    if(window.localStorage.getItem("aleoHeight")){
      page = parseInt(window.localStorage.getItem("aleoHeight") as string)
    }else{
      page = 0
    }
    // setAleoLoading(true)

    while (true) {
      started.current = true;
      const height = await axios.get('https://vm.aleo.org/api/testnet3/latest/height').then(e=>(e.data))
      console.log("current height: "+height);
      const response:any = await axios.get('http://localhost:8080/records', {
        params: {
          start_block: page,
          end_block: page+1000,
        }
      });
      if(response.data.length===0){

        page>height? window.localStorage.setItem("aleoHeight",height.toString()): window.localStorage.setItem("aleoHeight",page.toString())
        // const regex = /(\w+)\s*:\s*([^\s,]+)/g;
        // const dominNFT:any = []
        // records.forEach(t => {

        //   let match;
        //   const parsedObject:any = {};

        //   while ((match = regex.exec(t.result)) !== null) {
        //     const propertyName = match[1];
        //     const propertyValue = match[2];
        //     parsedObject[propertyName] = propertyValue;
        //   }
        //   parsedObject?.name&&dominNFT.push(parsedObject.name)

        // });
        // if(dominNFT.length===0){
        //   setLoadingRegister(false)
        // }else{
        //   setAleoLoading(false)
        // }

      }
        window.localStorage.setItem("aleoHeight",page.toString())
        response.data.length>1?page = response.data[response.data.length-1].height:page
        setRqPage(page)
      try {
        const task = {viewKey,address,response:response.data,privateKey:x1};      
        workerRef.current?.postMessage(task);
      } catch (error) {
        return;
      }
  
      console.log(page);
      // page+1000>height?page:page += 1000;
      
      delete response.data 

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    
  }


  function AleoWalletCard(){
    const aleoAddress = useAleoPrivateKey(s=>s.Address)    
    const [aleoAddressPub,setAleoAddressPub] = useState("")

    const { Panel } = Collapse;
   
    
    
    console.log(aleoAddress);
    
      useEffect(()=>{
          handleGetRecords()
          // setAleoRecords(JSON.parse(window.localStorage.getItem("aleoRecords") as string??"[]"))
      },[rqPage])
      useEffect(()=>{
        handleAddr()
      },[])


      const handleGetRecords = useCallback(()=>{
        var request = indexedDB.open('aleoDB', 1);

        request.onupgradeneeded = function(event:any) {
          const db = event.target?.result;
        
          if (!db.objectStoreNames.contains("AleoStore")) {
              db.createObjectStore("AleoStore", { keyPath: "id" });
          }
        };
        request.onsuccess = function(event:any) {
          var db = event.target.result;

          var transaction = db.transaction(['AleoStore'], 'readonly');
          var objectStore = transaction.objectStore('AleoStore');
    

          var getDataRequest = objectStore.getAll();
          
          getDataRequest.onsuccess = function(event:any) {
            var data = event.target.result;
            window.localStorage.setItem("aleoRecords",JSON.stringify(data))
            setTimeout(()=>{

            // setRecords(data);

            },5000)
          };
          transaction.oncomplete = function(event:any) {
            db.close(); 
          };
        };
      },[])
      

    
    const handleAddr = async () => {
      aleo&&await aleo.default()
      const privateKey = (aleo?.PrivateKey?.from_string(x1));

      setAleoAddressPub(privateKey?.to_address().to_string());
      
    }

      const onChange = (key: string | string[]) => {
        console.log(key);
      };
      const longWord=(x:string)=>{
        if(x.length>30){
          return x.slice(0,15)+"..."+x.slice(-15)
        }
        return x
      }


      console.log(aleoAddressPub );
      
    return (
      <>
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure><img src="https://bafkreia2nqgrm63pca2l7aagznrbd466qy4dker4wevcrfxmsr7algkiie.ipfs.dweb.link/" alt="Shoes" /></figure>
        <div className="card-body">
          <h2 className="card-title">Aleo!</h2>
          <p>Addr: {aleoAddressPub===""?"": aleoAddressPub?.slice(0,12)+"..."+aleoAddressPub?.slice(-12)}</p>
          <div className="card-actions justify-end">
            <Link href={"/user"}> <button className="btn btn-primary">Profile</button></Link>
            {isLogin?typeof window !== "undefined"&&JSON.parse(window?.localStorage.getItem("aleoRecords") as string)?.filter(t=>t.result.indexOf("nick_name")>-1)[0]?<button className="btn btn-primary">Refresh</button>:<><label
            htmlFor="identity-modal"
            className={`btn btn-primary`}
          >
            Register
          </label></>:<button className="btn btn-primary">SET PRIVATEKEY</button>}
          </div>
        </div>

      <Collapse className="overflow-hidden" defaultActiveKey={['1']} onChange={onChange}>
      <Panel header="Domain" key="1"> 
      <p>{typeof window !== "undefined"&&JSON.parse(window?.localStorage.getItem("aleoRecords") as string)?.filter(t=>t.result.indexOf("nick_name")>-1)[0]?.result}</p>

      </Panel>
      <Panel header="Aleo Record" key="2">
        <p>{typeof window !== "undefined"&&JSON.parse(window?.localStorage.getItem("aleoRecords") as string)?.map(t=><div>{t.result}</div>)}</p>
      </Panel>
    </Collapse>
      </div>
      </>

    )
  }

  const LoadingCard=()=>{
    const [feeRecords,setFeeRecords] = useState<any>([])
    const workerExecRef = useRef<Worker>();

    const x1 = useAleoPrivateKey(s=>s.PK)    


   
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    
    
    console.log(records);
    const handleChange = (value: string | string[]) => {
      setFeeRecords(value)
      console.log(`Selected: ${value}`);
    };
    
    const options = records.map(t=>({label:t.id,value:t.result}))
    const onFinish = (values: any) => {
      console.log(values);
      
      setLoadingRegister(true)
      let selectedRecord = values.record

      workerExecRef.current = workerHelper();
      workerExecRef.current.addEventListener("message", ev => {
        if (ev.data.type == 'EXECUTION_TRANSACTION_COMPLETED') {
            axios.post("https://vm.aleo.org/api" + "/testnet3/transaction/broadcast", ev.data.executeTransaction, {
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then(
                (response:any) => {
                  options.forEach((t:any)=>{t.value===selectedRecord&&
                    console.log(t.id);
                    var request = indexedDB.open('aleoDB', 1);

                    request.onsuccess = function(event:any) {
                      var db = event.target.result;

                      var transaction = db.transaction(['AleoStore'], 'readwrite');
                      var store = transaction.objectStore('AleoStore');

                      var deleteRequest = store.delete(t.id);

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
                    
                  })
                    setAleoLoading(false)
                    console.log(response.data);
                }
            )
        } else if (ev.data.type == 'ERROR') {
            alert(ev.data.errorMessage);
            console.log(ev.data.errorMessage);
            setAleoLoading(false)
        }
    });
      const privateKey = (aleo.PrivateKey.from_string(x1));

      const {remoteProgram,aleoFunction,inputs,feeRecord,url} = aleoHelper()
      const formInputs =  Object.values({
        creator: values.aleo.creator, 
          name: values.aleo.name+"field",
          nick_name: values.aleo.nick_name+"field", 
          phone_number: values.aleo.phone_number+"field",
          identification_number: values.aleo.identification_number+"field", 
          nation: values.aleo.nation+"field",

      })
     
      workerExecRef.current?.postMessage({
          type: 'ALEO_EXECUTE_PROGRAM_ON_CHAIN',
          remoteProgram,
          aleoFunction,
          inputs:formInputs,
          privateKey:x1,
          fee: 0.1,
          feeRecord:selectedRecord,
          url
        });
    };



    if (typeof window === 'object') {
    return ReactDOM.createPortal(<>
      <div className="fixed inset-0 bg-gray-900/90  fixed z-10 flex justify-center items-center flex-col	">
        {!loadingRegister?
      // <Form
      //   {...layout}
      //   name="nest-messages"
      //   onFinish={onFinish}
      //   style={{ maxWidth: 600 ,color:"white"}}
      //   validateMessages={{}}
      // >
      //     <Form.Item name={['aleo', 'creator']} style={{color:"white"}} label="Creator" rules={[{ required: true }]}>
      //       <Input />
      //     </Form.Item>
      //     <Form.Item name={['aleo', 'name']} label="Name" rules={[{ required: true }]}>
      //       <Input />
      //     </Form.Item>
      //     <Form.Item name={['aleo', 'nick_name']} label="Nick Name" rules={[{ required: true }]}>
      //       <Input />
      //     </Form.Item>
      //     <Form.Item name={['aleo', 'phone_number']} label="Phone Number" rules={[{ required: true }]}>
      //       <Input />
      //     </Form.Item>
      //     <Form.Item name={['aleo', 'identification_number']} label="Identification Number" rules={[{ required: true }]}>
      //     <Input />
      //     </Form.Item>
      //     <Form.Item name={['aleo', 'nation']} label="Nation" rules={[{ required: true }]}>
      //     <Input />
      //     </Form.Item>
      //     <Form.Item name={['aleo', 'fee']} placeholder="s" label="Fee" rules={[{ required: true }]}>
      //     <InputNumber />
      //     </Form.Item>
      //     <Form.Item name="record" label="Record" rules={[{ required: true }]}>
      //     <Select
      //     size={"middle"}
      //     defaultValue="Select a Record"
      //     onChange={handleChange}
      //     style={{ width: 200 }}
      //     options={options}
      //   />
      //     </Form.Item>
      //     <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
      //       <Button style={{background:"lightblue"}} type="primary" htmlType="submit">
      //         Register
      //       </Button>
      //     </Form.Item>
      //  </Form>
      <></>
        :
      <div role="status">
      <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
        <span className="sr-only">Loading...</span>
    </div>}
      </div>
    </>,document?.getElementById("__next") as HTMLElement)
    }else{
      return <></>
    }
  }


  return (
    <div className="sm:w-[300px] xl:w-[450px] hidden lg:inline ml-8 space-y-5">
      <div className="w-[90%] sticky top-0 py-1.5 z-50">
        <div className="flex items-center p-3 rounded-full relative">
          <SearchIcon className="h-5 z-50 text-gray-500" />
          <input
            className="absolute inset-0 rounded-full pl-11 border-gray-500 text-gray-700 focus:shadow-lg focus:bg-white bg-gray-100"
            type="text"
            placeholder="Search Moment"
            value={_searchKey}
            onChange={(e) => _setSearchKey(e.target.value)}
            onBlur={(e) => setSearchKey(e.target.value)}
            onKeyDown={(e) => {
              //@ts-ignore
              if (e.key === "Enter") setSearchKey(e.target.value);
            }}
          />
        </div>
      </div>
      {chainList==="ALEO"&&<AleoWalletCard/>}
      {aleoLoading&&<LoadingCard/>}
      {/* <LoadingCard/> */}
      <div className="text-gray-700 space-y-3 bg-gray-100 rounded-xl pt-2 w-[90%]">
        <h4 className="font-bold text-xl px-4">Whats happening</h4>
        <AnimatePresence>
          {newsResults?.slice(0, articleNum).map((article: { title: Key | null | undefined }) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <News key={article.title} article={article} />
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={() => setArticleNum(articleNum + 3)} className="text-blue-300 pl-4 pb-3 hover:text-blue-400">
          Show more
        </button>
      </div>
      <div className="sticky top-16 text-gray-700 space-y-3 bg-gray-100 pt-2 rounded-xl w-[90%]">
        <h4 className="font-bold text-xl px-4">Who to follow</h4>
        <AnimatePresence>
          {randomUsersResults?.slice(0, randomUserNum).map((randomUser: any) => (
            <motion.div
              key={randomUser.login.username}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div
                key={randomUser.login.username}
                className="flex items-center px-4 py-2  cursor-pointer hover:bg-gray-200 transition duration-500 ease-out"
              >
                <img className="rounded-full" width="40" src={randomUser.picture.thumbnail} alt="" />
                <div className="truncate ml-4 leading-5">
                  <h4 className="font-bold hover:underline text-[14px] truncate">{randomUser.login.username}</h4>
                  <h5 className="text-[13px] text-gray-500 truncate">
                    {randomUser.name.first + " " + randomUser.name.last}
                  </h5>
                </div>
                <button className="ml-auto bg-black text-white rounded-full text-sm px-3.5 py-1.5 font-bold">
                  Follow
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <button
          onClick={() => setRandomUserNum(randomUserNum + 3)}
          className="text-blue-300 pl-4 pb-3 hover:text-blue-400"
        >
          Show more
        </button>
      </div>


      <Footer />
    </div>
  );
};
