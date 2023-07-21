import init, * as aleo from 'aleo-wasm-swift';

console.log("start aleo");
self.addEventListener("message",async ev => {
    

    await init();
    await aleo.default();
    
    const aleoProgramManager = new aleo.ProgramManager();


     if (ev.data.type === 'ALEO_EXECUTE_PROGRAM_ON_CHAIN') {
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
        console.log( privateKey,
        aleoFunction,
        inputs,
        fee,
        feeRecord,
        url,);
        (async function() {
            try {
                let executeTransaction = await aleoProgramManager.execute(
                    aleo.PrivateKey.from_string(privateKey),
                    remoteProgram,
                    aleoFunction,
                    inputs,
                    fee,
                    aleo.RecordPlaintext.fromString(feeRecord),
                    url,
                    true
                );
                    console.log("executeTransaction");
                    console.log(executeTransaction);
                console.log(`Web worker: On-chain execution transaction created in ${performance.now() - startTime} ms`);
                let transaction = executeTransaction.toString();
                console.log(transaction);
                self.postMessage({type: 'EXECUTION_TRANSACTION_COMPLETED', executeTransaction: transaction});
            } catch (error) {
                console.log(error);
                self.postMessage({ type: 'ERROR', errorMessage: error.toString() });
            }
        })();
    }
    
});