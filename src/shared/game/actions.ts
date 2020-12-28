import * as rt from 'runtypes'

type Action<T extends string, TFields extends object = {}> = {
  type: T
} & TFields

export type GameStart = Action<'game/start'>
export type GamePhaseDay = Action<'game/phase/day'>
export type GamePhaseNight = Action<'game/phase/night'>
export type GameSleep = Action<'game/sleep'>
export type GameWakeMafia = Action<'game/wake/mafia'>
export type GameWakeDetective = Action<'game/wake/detective'>
export type GameWakeNurse = Action<'game/wake/nurse'>
export type GameLynch = Action<'game/lynch', {lynch: string}>

export type GameAction =
  | GameStart
  | GamePhaseDay
  | GamePhaseNight
  | GameSleep
  | GameWakeMafia
  | GameWakeDetective
  | GameWakeNurse
  | GameLynch

export const roomJoin = rt.Record({
  type: rt.Literal('room/join'),
})

export const roomLeave = rt.Record({
  type: rt.Literal('room/leave'),
})

export const waitingReady = rt.Record({
  type: rt.Literal('waiting/ready'),
})

export const nightInform = rt.Record({
  type: rt.Literal('night/inform'),
})

export const dayLynch = rt.Record({
  type: rt.Literal('day/lynch'),
  lynch: rt.String.Or(rt.Null),
})

export const clientAction = rt.Union(
  roomJoin,
  roomLeave,
  waitingReady,
  nightInform,
  dayLynch,
)
export type ClientAction = rt.Static<typeof clientAction>
export type PlayerAction = ClientAction & {sender: string}

export type RootAction = GameAction | PlayerAction
