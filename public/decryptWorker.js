import init, * as aleo from 'aleo-wasm-swift';
console.log("worker.js");

aleo.initThreadPool(18);

self.addEventListener("message",async event => {
    console.log(9);
    const { viewKey, t } = event.data; // 从接收到的消息中获取 viewKey 和 t
    val.default();
    console.log(333);

    const result = aleo.ViewKey.from_string(viewKey).decrypt(t.records[0]);
    console.log(22);
    console.log(result);


    self.postMessage(result);
  });