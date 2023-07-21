export const workerRecordHelper = ()=>{
    return new Worker(new URL('./workerRecords.js', import.meta.url))
}

export const workerHelper = ()=>{
    return new Worker(new URL('./worker.js', import.meta.url))
}