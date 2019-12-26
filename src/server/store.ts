import {Subject, BehaviorSubject, Subscription} from 'rxjs'
import {scan} from 'rxjs/operators'

export interface Store<S, A> {
  dispatch: (action: A) => void
  subscribe: (listener: (state: S) => void) => Subscription
}

export const createStore = <S, A>(
  reducer: (state: S | undefined, action?: A) => S,
  initialState?: S,
): Store<S, A> => {
  const firstState = initialState || reducer(undefined)
  const action$ = new Subject<A>()
  const state$ = new BehaviorSubject<S>(firstState)
  action$.pipe(scan(reducer, firstState)).subscribe(state$)

  return {
    dispatch: (action: A) => action$.next(action),
    subscribe: (listener: (state: S) => void) => state$.subscribe(listener),
  }
}
