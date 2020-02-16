import puppeteer from 'puppeteer'
import {Server} from 'http'

import app from '../src/server/server'

describe('e2e', () => {
  let browser: puppeteer.Browser
  let server: Server

  jest.setTimeout(30_000)

  beforeAll(async () => {
    browser = await puppeteer.launch()
    server = app.listen(3000)
  })

  afterAll(async () => {
    await browser.close()
    server.close()
  })

  test('connect', async () => {
    const page = await browser.newPage()
    await page.goto('http://localhost:3000')
    await page.waitFor('#create-player-name', {timeout: 100})
  })
})
