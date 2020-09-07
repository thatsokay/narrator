import {Server} from 'http'
import puppeteer from 'puppeteer'
import R from 'ramda'

import app from '../src/server/server'

describe('e2e', () => {
  let server: Server
  let browser: puppeteer.Browser
  let pages: puppeteer.Page[]

  jest.setTimeout(30_000)

  beforeAll(async () => {
    server = app.listen(3002)
    browser = await puppeteer.launch()
    pages = await Promise.all(R.range(0, 6).map((_) => browser.newPage()))
    pages.map((page) => page.setDefaultTimeout(1000))
    await Promise.all(pages.map((page) => page.goto('http://localhost:3002')))
  })

  afterAll(async () => {
    await browser.close()
    server.close()
  })

  test('start game', async (done) => {
    await (await pages[0].waitFor('#create-player-name')).type('player0\n')
    const roomIdHandle = await pages[0].waitFor('#room-id')
    const roomId = (await roomIdHandle.evaluate(
      (node) => node.textContent,
    )) as string
    expect(roomId.length).toBe(4)
    await Promise.all(
      pages.slice(1).map(async (page, i) => {
        await (await page.waitFor('#join-room-form')).click()
        const roomHandle = await page.waitFor('#join-room-id')
        await roomHandle.type(roomId)
        const nameHandle = await page.waitFor('#join-player-name')
        await nameHandle.type(`player${i + 1}\n`)
      }),
    )
    await Promise.all(
      pages.map(async (page) => {
        const statusHandle = await page.waitFor('h2')
        expect(await statusHandle.evaluate((node) => node.textContent)).toBe(
          'waiting',
        )
      }),
    )
    done()
  })
})
