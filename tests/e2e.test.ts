import {Server} from 'http'
import puppeteer from 'puppeteer'
import R from 'ramda'

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

  test('start game', async done => {
    const pages = await Promise.all(R.range(0, 6).map(_ => browser.newPage()))
    await Promise.all(pages.map(page => page.goto('http://localhost:3000')))
    await (await pages[0].waitFor('#create-player-name')).type('player0\n')
    const roomIdHandle = await pages[0].waitFor('h1')
    const roomId = (await roomIdHandle.evaluate(
      node => node.textContent,
    )) as string
    expect(roomId.length).toBe(4)
    await Promise.all(
      pages.slice(1).map(async (page, i) => {
        const roomHandle = await page.waitFor('#join-room-id')
        await roomHandle.type(roomId)
        const nameHandle = await page.waitFor('#join-player-name')
        await nameHandle.type(`player${i + 1}\n`)
      }),
    )
    await Promise.all(
      pages.map(async page => {
        const statusHandle = await page.waitFor('h2')
        expect(await statusHandle.evaluate(node => node.textContent)).toBe(
          'waiting',
        )
      }),
    )
    done()
  })
})
