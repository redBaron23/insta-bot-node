const getRandom = async (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function sleep(time) {
  // notice that we can await a function
  // that returns a promise
  await delay(time);
}

exports.sleep = sleep
exports.getRandom = getRandom
