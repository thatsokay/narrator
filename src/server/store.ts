import {Subject, Subscription} from 'rxjs'
import {scan, publishBehavior, refCount} from 'rxjs/operators'

export interface Store<S, A> {
  dispatch: (action: A) => void
  subscribe: (listener: (state: S) => void) => Subscription
}

export const createStore = <S, A>(
  reducer: (state: S | undefined, action?: A) => S,
  initialState?: S,
): Store<S, A> => {
  const action$ = new Subject<A>()
  const firstState = initialState || reducer(undefined)
  const state$ = action$.pipe(
    scan(reducer, firstState),
    publishBehavior(firstState),
    refCount(),
  )

  return {
    dispatch: (action: A) => action$.next(action),
    subscribe: (listener: (state: S) => void) => state$.subscribe(listener),
  }
}
