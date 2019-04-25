const fs = require('fs')
const express = require('express')
const puppeteer = require('puppeteer')
const app = express()
const port = 3005;

(async () => {
  const browser = await puppeteer.launch({ devtools: true })
  const page = await browser.newPage()

  process.on('uncaughtException', async (err, origin) => {
    fs.writeSync(
      process.stderr.fd,
      `Caught exception: ${err}\n` +
      `Exception origin: ${origin}`
    )
    await browser.close()
    process.exit()
  })

  await page.goto('https://google-developers.appspot.com/maps/documentation/utils/geocoder/embed')
  await page.waitForSelector('#query-input')
  await page.waitForSelector('#geocode-button')
  const $submit = await page.$('#geocode-button')

  let busy = false
  app.get('/', async (req, res) => {
    //单线程工作，避免多开chrome，需要多chrome，可以多开app.js
    if (busy) {
      res.json({ error: "busy" })
      return
    }
    const { address } = req.query
    //没有地址参数
    if (!address) {
      res.json({ error: "query param address needed" })
      return
    }

    busy = true
    //输入新内容
    await page.evaluate((address) => {
      document.querySelector('#query-input').value = address
    }, address)

    //点击并等待响应
    try {
      await Promise.all([
        $submit.click(),
        page.waitForResponse((response) => {
          return response.url().includes('https://maps.googleapis.com/maps/api/js/GeocodeService.Search')
        })
      ])
    } catch (e) {
      busy = false
      res.json({ error: 'over time limit' })
      return
    }
    const data = await page.evaluate(() => {
      const OK = document.querySelector('#status-display-div').textContent.includes('OK')
      if (!OK) {
        return { OK }
      }
      let list = []
      document.querySelectorAll('#results-display-div>div')
        .forEach(x => {
          let ps = x.children[0].children[0].children[0].children[0].children[1].children
          let address = ps[0].textContent.trim()
          let location = ps[1].textContent.split(':')[1].trim()
          let types = ps[2].textContent.split(':')[1].trim()
          list.push({
            address,
            location,
            types
          })
        })

      return {
        OK,
        list,
      }
    })

    busy = false
    res.json({
      ...data,
      address,
    })
  })

  app.listen(port, async (err) => {
    if (err) {
      throw err
    }
    console.log(`Example app listening on port ${port}!`)
  })
})();