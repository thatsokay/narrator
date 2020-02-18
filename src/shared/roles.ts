export interface RoleBase {
  name: RoleName
  description: string
  side: 'mafia' | 'village' // Which side they win with
  appearsAs: 'mafia' | 'village' // Side revealed on 'see' actions
  actions: RoleActions<any, any, any>
}

export type RoleName = 'villager' | 'mafia' | 'detective' | 'nurse'

// @ts-ignore
type PhaseActionType =
  | 'inform' // Reveal role to others at night
  | 'lynch' // Vote to lynch target at day
  | 'kill' // Vote to kill target at night
  | 'investigate' // Reveal a target's `appearAs`
  | 'heal' // Prevent a kill on target

type PhaseAction<T extends {name: PhaseActionType}> = {
  completed: boolean
} & T

interface RoleActions<
  F extends {name: PhaseActionType} | never,
  D extends {name: PhaseActionType} | never,
  N extends {name: PhaseActionType} | never
> {
  // Want to be able to specify that certain fields never have a value but still
  // want to be able to use optional chaining on arbitrary RoleActions.
  firstNight?: F extends never ? never : PhaseAction<F>
  day?: D extends never ? never : PhaseAction<D>
  night?: N extends never ? never : PhaseAction<N>
}

type Inform = {name: 'inform'}
type Lynch = {name: 'lynch'; lynch: string | null}
type Kill = {name: 'kill'; kill: string}
type Investigate = {name: 'investigate'; investigate: string}
type Heal = {name: 'heal'; heal: string}

interface Villager extends RoleBase {
  name: 'villager'
  description: string
  side: 'village'
  appearsAs: 'village'
  actions: RoleActions<never, Lynch, never>
}

interface Mafia extends RoleBase {
  name: 'mafia'
  description: string
  side: 'mafia'
  appearsAs: 'mafia'
  actions: RoleActions<Inform, Lynch, Kill>
}

interface Detective extends RoleBase {
  name: 'detective'
  description: string
  side: 'village'
  appearsAs: 'village'
  actions: RoleActions<never, Lynch, Investigate>
}

interface Nurse extends RoleBase {
  name: 'nurse'
  description: string
  side: 'village'
  appearsAs: 'village'
  actions: RoleActions<never, Lynch, Heal>
}

export type Role = Villager | Mafia | Detective | Nurse

export const ROLES = {
  villager: {
    name: 'villager',
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: {
        completed: false,
        name: 'lynch',
        lynch: null,
      },
    },
  } as Villager,
  mafia: {
    name: 'mafia',
    description: '',
    side: 'mafia',
    appearsAs: 'mafia',
    actions: {
      firstNight: {
        completed: false,
        name: 'inform',
      },
      day: {
        completed: false,
        name: 'lynch',
        lynch: null,
      },
      night: {
        completed: false,
        name: 'kill',
      },
    },
  } as Mafia,
  detective: {
    name: 'detective',
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: {
        completed: false,
        name: 'lynch',
        lynch: null,
      },
      night: {
        completed: false,
        name: 'investigate',
      },
    },
  } as Detective,
  nurse: {
    name: 'nurse',
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: {
        completed: false,
        name: 'lynch',
        lynch: null,
      },
      night: {
        completed: false,
        name: 'heal',
      },
    },
  } as Nurse,
} as const
