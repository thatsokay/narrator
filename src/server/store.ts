import {Subject, BehaviorSubject, Subscription} from 'rxjs'
import {scan} from 'rxjs/operators'

export type Reducer<S, A> = (state?: S, action?: A) => S
export type Dispatcher<A> = (action: A) => void

export interface Store<S, A> {
  state$: BehaviorSubject<S>
  dispatch: Dispatcher<A>
  subscribe: (listener: (state: S) => void) => Subscription
  getState: () => S
}

export type StoreCreator<S, A> = (
  reducer: Reducer<S, A>,
  initialState?: S,
) => Store<S, A>

export const createStore = <S, A>(
  reducer: Reducer<S, A>,
  initialState?: S,
): Store<S, A> => {
  const firstState = initialState || reducer()
  const dispatch$ = new Subject<A>()
  const state$ = new BehaviorSubject<S>(firstState)
  dispatch$.pipe(scan(reducer, firstState)).subscribe(state$)

  return {
    state$,
    dispatch: (action: A) => dispatch$.next(action),
    subscribe: (listener: (state: S) => void) => state$.subscribe(listener),
    getState: () => state$.getValue(),
  }
}

export type Middleware<S, A> = (
  store: Store<S, A>,
) => (next: Dispatcher<A>) => Dispatcher<A>

/**
 * Takes a series of middlewares, then a createStore function, and returns a new
 * createStore function patched with the middlewares.
 */
export const applyMiddleware =
  <S, A>(...middlewares: Middleware<S, A>[]) =>
  (createStore: StoreCreator<S, A>): StoreCreator<S, A> =>
  (reducer, initialState): Store<S, A> => {
    const store = createStore(reducer, initialState)
    const patchers = middlewares.map((middleware) => middleware(store))
    const dispatch = patchers.reduceRight(
      (acc, patcher) => patcher(acc),
      store.dispatch,
    )
    const dispatch$ = new Subject<A>()
    dispatch$.subscribe(dispatch)
    // TODO: Replace store.dispatch so that it can be used by middlewares
    return {
      ...store,
      dispatch: (action: A) => dispatch$.next(action),
    }
  }
