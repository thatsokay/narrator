export type EventResponse<T> = {
  success: true
} & T | {
  success: false
  reason: string
}
