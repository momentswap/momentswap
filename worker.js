"use strict";

var aleo = _interopRequireWildcard(require("aleo-wasm-swift"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
await (0, aleo.default)();
aleo.initThreadPool(18);
const aleoProgramManager = aleo.ProgramManager.new();
self.addEventListener("message", ev => {
  console.log(ev);
  console.log("ev");
  if (ev.data.type === 'ALEO_EXECUTE_PROGRAM_LOCAL') {
    const {
      localProgram,
      aleoFunction,
      inputs,
      privateKey
    } = ev.data;
    console.log('Web worker: Executing function locally...');
    let startTime = performance.now();
    try {
      let response = aleoProgramManager.execute_local(localProgram, aleoFunction, inputs, aleo.PrivateKey.from_string(privateKey), true);
      console.log(`Web worker: Local execution completed in ${performance.now() - startTime} ms`);
      let outputs = response.getOutputs();
      console.log(`Function execution response: ${outputs}`);
      self.postMessage({
        type: 'OFFLINE_EXECUTION_COMPLETED',
        outputs
      });
    } catch (error) {
      console.log(error);
      self.postMessage({
        type: 'ERROR',
        errorMessage: error.toString()
      });
    }
  } else if (ev.data.type === 'ALEO_EXECUTE_PROGRAM_ON_CHAIN') {
    console.log("ALEO_EXECUTE_PROGRAM_ON_CHAIN");
    const {
      remoteProgram,
      aleoFunction,
      inputs,
      privateKey,
      fee,
      feeRecord,
      url
    } = ev.data;
    console.log('Web worker: Creating execution...');
    let startTime = performance.now();
    (async function () {
      try {
        let executeTransaction = await aleoProgramManager.execute(remoteProgram, aleoFunction, inputs, aleo.PrivateKey.from_string(privateKey), fee, aleo.RecordPlaintext.fromString(feeRecord), url);
        console.log("executeTransaction");
        console.log(executeTransaction);
        console.log(`Web worker: On-chain execution transaction created in ${performance.now() - startTime} ms`);
        let transaction = executeTransaction.toString();
        console.log(transaction);
        self.postMessage({
          type: 'EXECUTION_TRANSACTION_COMPLETED',
          executeTransaction: transaction
        });
      } catch (error) {
        console.log(error);
        self.postMessage({
          type: 'ERROR',
          errorMessage: error.toString()
        });
      }
    })();
  } else if (ev.data.type === 'ALEO_TRANSFER') {
    const {
      privateKey,
      amountCredits,
      recipient,
      amountRecord,
      fee,
      feeRecord,
      url
    } = ev.data;
    console.log('Web worker: Creating transfer...');
    let startTime = performance.now();
    (async function () {
      try {
        let transferTransaction = await aleoProgramManager.transfer(aleo.PrivateKey.from_string(privateKey), amountCredits, recipient, aleo.RecordPlaintext.fromString(amountRecord), fee, aleo.RecordPlaintext.fromString(feeRecord), url);
        console.log(`Web worker: Transfer transaction created in ${performance.now() - startTime} ms`);
        let transaction = transferTransaction.toString();
        console.log(transaction);
        self.postMessage({
          type: 'TRANSFER_TRANSACTION_COMPLETED',
          transferTransaction: transaction
        });
      } catch (error) {
        console.log(error);
        self.postMessage({
          type: 'ERROR',
          errorMessage: error.toString()
        });
      }
    })();
  } else if (ev.data.type === 'ALEO_DEPLOY') {
    const {
      program,
      privateKey,
      fee,
      feeRecord,
      url
    } = ev.data;
    console.log('Web worker: Creating deployment...');
    let startTime = performance.now();
    (async function () {
      try {
        let deployTransaction = await aleoProgramManager.deploy(program, undefined, aleo.PrivateKey.from_string(privateKey), fee, aleo.RecordPlaintext.fromString(feeRecord), url);
        console.log(`Web worker: Deployment transaction created in ${performance.now() - startTime} ms`);
        let transaction = deployTransaction.toString();
        console.log(transaction);
        self.postMessage({
          type: 'DEPLOY_TRANSACTION_COMPLETED',
          deployTransaction: transaction
        });
      } catch (error) {
        console.log(error);
        self.postMessage({
          type: 'ERROR',
          errorMessage: error.toString()
        });
      }
    })();
  } else if (ev.data.type === 'ALEO_SPLIT') {
    const {
      splitAmount,
      record,
      privateKey,
      url
    } = ev.data;
    console.log('Web worker: Creating split...');
    let startTime = performance.now();
    (async function () {
      try {
        let splitTransaction = await aleoProgramManager.split(aleo.PrivateKey.from_string(privateKey), splitAmount, aleo.RecordPlaintext.fromString(record), url, true);
        console.log(`Web worker: Split transaction created in ${performance.now() - startTime} ms`);
        let transaction = splitTransaction.toString();
        console.log(transaction);
        self.postMessage({
          type: 'SPLIT_TRANSACTION_COMPLETED',
          splitTransaction: transaction
        });
      } catch (error) {
        console.log(error);
        self.postMessage({
          type: 'ERROR',
          errorMessage: error.toString()
        });
      }
    })();
  } else if (ev.data.type === 'ALEO_JOIN') {
    const {
      recordOne,
      recordTwo,
      fee,
      feeRecord,
      privateKey,
      url
    } = ev.data;
    console.log('Web worker: Creating join...');
    let startTime = performance.now();
    (async function () {
      try {
        let joinTransaction = await aleoProgramManager.join(aleo.PrivateKey.from_string(privateKey), aleo.RecordPlaintext.fromString(recordOne), aleo.RecordPlaintext.fromString(recordTwo), 0, aleo.RecordPlaintext.fromString(feeRecord), url, true);
        console.log(`Web worker: Join transaction created in ${performance.now() - startTime} ms`);
        let transaction = joinTransaction.toString();
        console.log(transaction);
        self.postMessage({
          type: 'JOIN_TRANSACTION_COMPLETED',
          joinTransaction: transaction
        });
      } catch (error) {
        console.log(error);
        self.postMessage({
          type: 'ERROR',
          errorMessage: error.toString()
        });
      }
    })();
  }
});