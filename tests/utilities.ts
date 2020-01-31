import {Subject} from 'rxjs'

export const mockServerSocket = (id: string): any => {
  const events$ = new Subject<any>()
  return {
    id,
    join: jest.fn(),
    emit: jest.fn(),
    // FIXME: Filter stream by given event
    on: jest.fn((_event: string, listener: any) => events$.subscribe(listener)),
    clientEmit: (_event: string, value: any) => events$.next(value),
  }
}
