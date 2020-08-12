const cheerio = require('cheerio')
const axios = require('axios').default


const fethHtml = async url => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch {
    console.error(
      `ERROR: An error occurred while trying to fetch the URL: ${url}`
    );
  }
}

const getFollowers = async () => {

  const url = 'https://www.instagram.com/pato.toledo/'
  
  const html = await fethHtml(url);
  
  const $ = cheerio.load(html);

  console.log(html)
}


const main = async() =>{

  getFollowers();

}

main()
