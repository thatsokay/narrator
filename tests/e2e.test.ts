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
    pages.forEach((page) => page.setDefaultTimeout(5000))
    await Promise.all(pages.map((page) => page.goto('http://localhost:3002')))
  })

  afterAll(async () => {
    await browser.close()
    server.close()
  })

  test('start game', async () => {
    const playerNameHandle = await pages[0]!.waitForSelector(
      '#start-form #player-name',
    )
    await playerNameHandle?.type('player0\n')
    const roomIdHandle = await pages[0]!.waitForSelector('#game #room-id')
    const roomId = (await roomIdHandle?.evaluate(
      (node) => node.textContent,
    )) as string
    expect(roomId.length).toBe(4)
    await Promise.all(
      pages.slice(1).map(async (page, i) => {
        const joinRoomHandle = await page.waitForSelector('#join-room-form')
        await joinRoomHandle?.click()
        const roomHandle = await page.waitForSelector('#start-form #room-id')
        await roomHandle?.type(roomId)
        const nameHandle = await page.waitForSelector(
          '#start-form #player-name',
        )
        await nameHandle?.type(`player${i + 1}\n`)
      }),
    )
    await Promise.all(
      pages.map(async (page) => {
        const statusHandle = await page.waitForSelector('h2')
        expect(await statusHandle?.evaluate((node) => node.textContent)).toBe(
          'waiting',
        )
      }),
    )
  })
})
