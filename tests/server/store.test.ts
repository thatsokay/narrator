import {Subscription} from 'rxjs'

import {createStore, Store} from '../../src/server/store'

interface State {
  count: number
}

const reducer = (state: State = {count: 0}, action?: any) => {
  if (typeof action !== 'object' || action === null) {
    return state
  }
  if (action.type === 'INCREMENT') {
    return {
      count: state.count + 1,
    }
  } else if (action.type === 'DECREMENT') {
    return {
      count: state.count - 1,
    }
  }
  return state
}

let store: Store<State, any>
let states: State[]
let subscription: Subscription | null

beforeEach(() => {
  store = createStore(reducer)
  states = []
  subscription = null
})

afterEach(() => {
  subscription?.unsubscribe()
})

test('subscription', () => {
  subscription = store.subscribe(state => states.push(state))
  expect(states).toStrictEqual([{count: 0}])
})

test('dispatch', () => {
  subscription = store.subscribe(state => states.push(state))
  store.dispatch({type: 'INCREMENT'})
  expect(states).toStrictEqual([{count: 0}, {count: 1}])
})

test('dispatch before subscribing', () => {
  store.dispatch({type: 'INCREMENT'})
  subscription = store.subscribe(state => states.push(state))
  store.dispatch({type: 'INCREMENT'})
  expect(states).toStrictEqual([{count: 1}, {count: 2}])
})

test('multiple subscriptions', () => {
  const states2: State[] = []
  const states3: State[] = []

  subscription = store.subscribe(state => states.push(state))
  store.dispatch({type: 'INCREMENT'})

  const sub2 = store.subscribe(state => states2.push(state))
  store.dispatch({type: 'INCREMENT'})

  const sub3 = store.subscribe(state => states3.push(state))
  store.dispatch({type: 'INCREMENT'})

  expect(states).toStrictEqual([{count: 0}, {count: 1}, {count: 2}, {count: 3}])
  expect(states2).toStrictEqual([{count: 1}, {count: 2}, {count: 3}])
  expect(states3).toStrictEqual([{count: 2}, {count: 3}])

  sub2.unsubscribe()
  sub3.unsubscribe()
})

test('get state', () => {
  expect(store.getState()).toStrictEqual({count: 0})
  store.dispatch({type: 'INCREMENT'})
  expect(store.getState()).toStrictEqual({count: 1})
})
