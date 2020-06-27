const getRandom = async (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sleepRandom(MIN_TIME,MAX_TIME){
    let time = await getRandom(MIN_TIME,MAX_TIME)
    console.log('Sleeping :'+time/(1000/60)+' minutes')
    await sleep(time);
  
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function sleep(time) {
  // notice that we can await a function
  // that returns a promise
  await delay(time);
}

async function checkMemory(){
let _maxMemoryConsumption = 0;
let _dtOfMaxMemoryConsumption;

process.nextTick(() => {
  let memUsage = process.memoryUsage();
  if (memUsage.rss > _maxMemoryConsumption) {
    _maxMemoryConsumption = memUsage.rss;
    _dtOfMaxMemoryConsumption = new Date();
  }
});

process.on('exit', () => {
  console.log(`Max memory consumption: ${_maxMemoryConsumption/1024/1024} at ${_dtOfMaxMemoryConsumption}`);
});
}

exports.checkMemory = checkMemory
exports.sleep = sleep
exports.getRandom = getRandom
exports.sleepRandom = sleepRandom
