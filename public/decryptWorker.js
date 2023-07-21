import init, * as aleo from 'aleo-wasm-swift';
console.log("worker.js");

aleo.initThreadPool(18);

self.addEventListener("message",async event => {
    const { viewKey, t } = event.data; // 从接收到的消息中获取 viewKey 和 t
    val.default();

    const result = aleo.ViewKey.from_string(viewKey).decrypt(t.records[0]);


    self.postMessage(result);
  });