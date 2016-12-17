
import fs from 'fs'
import fetch from 'node-fetch'
import {remote as fetchRemote} from 'fetch-base64'
import cheerio from 'cheerio'

const urlEn = 'http://xkcd.com/'
const urlRu = 'http://xkcd.ru/'
const firstPost = 1
const lastPost = 2000

let count = 1

async function parseXkcd(url) {
  try {
    const resPage = await fetch(url)

    if (resPage.status !== 200) {
      return ''
    }

    return await resPage.text()
  } catch (e) {
    console.error(url, e)
    return ''
  }
}

async function parse(index) {
  try {
    const enPageText = await parseXkcd(urlEn + index)
    if (!enPageText) {
      return
    }

    const pathToFile = `result/${index}`
    if (!fs.existsSync(pathToFile)) {
      fs.mkdirSync(pathToFile)
    }

    const enPageDom = cheerio.load(enPageText)
    const enImage = await fetchRemote(`http:${enPageDom('#comic img').attr('src')}`)

    const data = {
      id: index,
      locales: {
        en: {
          title: enPageDom('#ctitle').text(),
          description: '',
          transcription: '',
          image: enImage[1],
          url: urlEn + index
        }
      }
    }
    const ruPageText = await parseXkcd(urlRu + index)
    if (ruPageText) {
      const ruPageDom = cheerio.load(ruPageText)
      const ruImage = await fetchRemote(ruPageDom('.nav + .clearer + a img').attr('src'))
      data.locales.ru = {
        title: ruPageDom('h1').text(),
        description: ruPageDom('.comics_text').text(),
        comment: ruPageDom('.comment').text(),
        transcription: ruPageDom('#transcription').text(),
        image: ruImage[1],
        url: urlRu + index
      }
    }
    fs.writeFileSync(`${pathToFile}/${index}.json`, JSON.stringify(data, '', 2))
    console.log(count, index)
    count += 1
  } catch (e) {
    console.error(index, e)
  }
}

for (let i = firstPost; i <= lastPost; i += 1) {
  parse(i)
}
