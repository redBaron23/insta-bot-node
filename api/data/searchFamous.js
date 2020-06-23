const cheerio = require('cheerio')
const fs = require('fs');
const util = require('util');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

function getStuff() {
  return readFile('wikipedia.html',"utf8");
}

// Can't use `await` outside of an async function so you need to chain
// with then()

async function main(){
  const result = await getStuff();
  let array = []
   const $ = cheerio.load(result);
 $("#mw-content-text > div > table:nth-child(8) > tbody > tr > td:nth-child(2)").each((index, element) => {
  let users = $(element).text().slice(1) 
  array = [...array,users.replace("\n","")]
 });

   console.log(array);
  var json = JSON.stringify(array);
  fs.writeFile('accountFamous.json', json, 'utf8', () => {
    console.log('Todo ok')
  });


}
main()
