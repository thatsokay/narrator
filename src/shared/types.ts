export type EventResponse<T extends object = {}> =
  | ({
      success: true
    } & T)
  | {
      success: false
      reason: string
    }
