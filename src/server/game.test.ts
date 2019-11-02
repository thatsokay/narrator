import {newGame, Game} from './game'

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
      callback('foo')({} as SocketIO.Server)({type: 'foo'}, response => {
        resolve(response)
      })
    }),
  ).resolves.toStrictEqual({success: false, reason: 'Unrecognised action type'})
  done()
})

test('start game', async done => {
  const emit = jest.fn() as any
  const server = {in: _ => ({emit})} as SocketIO.Server
  const callbacks = new Array(6)
    .fill(null)
    .map((_, i) => game.join(`foo${i}`)('foo')(server))
  await expect(
    Promise.all(
      callbacks.map(
        callback =>
          new Promise(resolve => {
            callback({type: 'ready'}, response => {
              resolve(response.success)
            })
          }),
      ),
    ),
  ).resolves.toStrictEqual(new Array(6).fill(true))
  expect(emit).toHaveBeenCalledWith('start')
  done()
})
