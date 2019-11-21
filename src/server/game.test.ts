import {newGame, Game} from './game'
import {EventResponse} from '../shared/types'

let game: Game

beforeEach(() => {
  game = newGame()
})

test('player leaving', () => {
  game.join('foo')
  game.leave('foo')
})

test('non-existent player leaving', () => {
  expect(() => {
    game.leave('foo')
  }).toThrow('Player foo does not exist in this game')
})

test('player joining with existing name', () => {
  game.join('foo')
  expect(() => {
    game.join('foo')
  }).toThrow('Player name foo is already taken')
})

test('invalid action', async done => {
  const callback = game.join('foo')
  await expect(
    new Promise(resolve => {
      callback('foo', {} as SocketIO.Server, () => ({}))(
        {type: 'foo'},
        (response: EventResponse<{}>) => {
          resolve(response)
        },
      )
    }),
  ).resolves.toStrictEqual({success: false, reason: 'Unrecognised action type'})
  done()
})

test('start game', async done => {
  const playerEmit = jest.fn() as any
  const playerSockets = new Array(6).fill(null).reduce((acc, _, i) => {
    acc[`foo${i}`] = {to: (_: string) => ({emit: playerEmit})}
    return acc
  }, {})
  const serverEmit = jest.fn() as any
  const server = {in: _ => ({emit: serverEmit})} as SocketIO.Server
  const callbacks = new Array(6)
    .fill(null)
    .map((_, i) => game.join(`foo${i}`)('foo', server, () => playerSockets))
  await expect(
    Promise.all(
      callbacks.map(
        callback =>
          new Promise(resolve => {
            callback({type: 'ready'}, (response: EventResponse<{}>) => {
              resolve(response.success)
            })
          }),
      ),
    ),
  ).resolves.toStrictEqual(new Array(6).fill(true))
  expect(playerEmit).toHaveBeenCalledTimes(6)
  expect(serverEmit).toHaveBeenCalledWith('gameEvent', {type: 'start'})
  done()
})

test('invalid event arguments', () => {
  expect(() => {
    game.join('foo')('foo', {} as SocketIO.Server, () => ({}))(
      null,
      (_: EventResponse<{}>) => {},
    )
  }).not.toThrow()
})
