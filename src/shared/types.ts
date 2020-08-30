export type Dict<V> = Partial<Record<string, V>>
export type Defined<T> = Exclude<T, undefined>

declare global {
  // Fix `Object.values` and `Object.entries` return types for Dict.
  interface ObjectConstructor {
    values<T, TDefined extends boolean = true>(
      o: {[s in string]: T} | ArrayLike<T>
    ): TDefined extends true ? Defined<T>[] : T[]

    entries<T, TDefined extends boolean = true>(
      o: {[s: string]: T} | ArrayLike<T>
    ): TDefined extends true ? [string, Defined<T>][] : [string, T][]
  }
}

export type EventResponse<T extends object = {}> =
  | ({
      success: true
    } & T)
  | {
      success: false
      reason: string
    }
