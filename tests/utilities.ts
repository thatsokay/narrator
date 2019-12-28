export const mockServerSocket = (id: string) =>
  (({
    id,
    join: jest.fn(),
    on: jest.fn(),
  } as unknown) as SocketIO.Socket)
