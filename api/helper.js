const fs = require("fs");

const { promisify } = require("util");
const readFile = promisify(fs.readFile);

const getRandom = async (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function createDirectory(uri) {
	if (!fs.existsSync(uri)) {
		fs.mkdirSync(uri);
		console.log("created");
	}
}

async function timeHour() {
	const date = new Date();
	const hour = date.getHours() + ":" + date.getMinutes();
	return hour;
}

async function timeDay() {
	const date = new Date();
	const day =
		date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
	return day;
}

async function dateTime() {
	const dateTime = (await timeHour()) + " " + (await timeDay());
	return dateTime;
}

async function readJson(uri) {
	if (fs.existsSync(uri)) {
		const rawdata = await readFile(uri, "utf8");
		const json = JSON.parse(rawdata);
		return json;
	} else {
		throw "Cannot read that path";
	}
}

async function writeJson(jsonData, uri) {
	const json = JSON.stringify(jsonData);

	fs.writeFile(uri, json, "utf8", function(err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
		let arrayStr = uri.split("/");
		let fileName =
			arrayStr[arrayStr.length - 2] + " : " + arrayStr[arrayStr.length - 1];
		console.log(fileName + " has been saved. ");
	});
}

async function sleepRandom(MIN_TIME, MAX_TIME) {
	let sleepTime = await getRandom(MIN_TIME, MAX_TIME);
	time = parseInt(sleepTime);
	time = time / (1000 * 60);
	console.log("Sleeping :" + time + " minutes");
	await sleep(sleepTime);
}

function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

async function sleep(time) {
	// notice that we can await a function
	// that returns a promise
	await delay(time);
}

async function checkMemory() {
	let _maxMemoryConsumption = 0;
	let _dtOfMaxMemoryConsumption;

	process.nextTick(() => {
		let memUsage = process.memoryUsage();
		if (memUsage.rss > _maxMemoryConsumption) {
			_maxMemoryConsumption = memUsage.rss;
			_dtOfMaxMemoryConsumption = new Date();
		}
	});

	process.on("exit", () => {
		console.log(
			`Max memory consumption: ${_maxMemoryConsumption /
				1024 /
				1024} at ${_dtOfMaxMemoryConsumption}`
		);
	});
}

exports.checkMemory = checkMemory;
exports.sleep = sleep;
exports.getRandom = getRandom;
exports.sleepRandom = sleepRandom;
exports.dateTime = dateTime;
exports.readJson = readJson;
exports.writeJson = writeJson;
exports.createDirectory = createDirectory;
