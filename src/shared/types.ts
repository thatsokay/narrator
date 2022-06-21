export type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>
}

export type EventResponse<T extends object = {}> =
  | ({
      success: true
    } & T)
  | {
      success: false
      reason: string
    }
