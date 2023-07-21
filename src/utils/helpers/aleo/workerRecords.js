import init, * as aleo from 'aleo-wasm-swift-decrypt-record';
import axios from "axios";

  const handleDecrypt = async(response,viewKey,address,privateKey) => {
    let sn = 0;
    await aleo.default()
    console.log("start aleo", response.length);  
    for (let r of response) {
      const vk =aleo.ViewKey.from_string(viewKey);
      sn+=1;

      r.records.forEach(async (tx,i) => {
          try {

            const result = vk.decrypt(tx);
            console.log(result);
            if(result.indexOf(address)>-1){

            const ss = {record_ciphertext:tx,sn_id:r.outputs[i].id}

            const s = aleo.PrivateKey.from_string(privateKey).decryptrecords(JSON.stringify([ss]))


            axios.get('https://vm.aleo.org/api/testnet3/find/transitionID/'+JSON.parse(s)[0].sn_id).then(e=>{
              console.log(e,"is used");
            },err=>{
            console.log(err,"not used");

          
            console.log("insert into indexedDB");

            const request = indexedDB.open('aleoDB', 1);
            
            request.onupgradeneeded = function(event) {
              const db = event.target?.result;
            
              if (!db.objectStoreNames.contains("AleoStore")) {
                  db.createObjectStore("AleoStore", { keyPath: "id" });
              }
            };
            request.onsuccess = event => {
              const db = event.target.result;

              const transaction = db.transaction(['AleoStore'], 'readwrite');
              const store = transaction.objectStore('AleoStore');
              if (result.indexOf(address)>-1){

              const data = { id: r.outputs[i].id,height:r.height, result: result ,record_ciphertext:tx,sn_id:r.outputs[i].id};
              const addRequest = store.add(data);
              addRequest.onsuccess = event => {
                console.log('Data stored successfully in IndexedDB', event.target);
              };

              addRequest.onerror = event => {
                console.error('Failed to store data in IndexedDB:', event.target.error);
              };
              }
              transaction.oncomplete = event => {
                self.postMessage(result);
              };
            };

            request.onerror = event => {
              console.error('Failed to open database:', event.target.error);
            };
          })
        }

          } catch (e) {
            console.log(e);
          }
      })
      }
  }

  self.addEventListener("message", event => {
    const { viewKey,address,response,privateKey } = event.data; 
    handleDecrypt(response,viewKey,address,privateKey) 
  })

   
