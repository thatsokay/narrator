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
  | 'see' // See a target's side
  | 'heal' // Prevent a kill on target

type PhaseAction<T extends Object = {}> = {
  completed: boolean
} & T

interface RoleActions<
  F extends Object | never,
  D extends Object | never,
  N extends Object | never
> {
  // Want to be able to specify that certain fields never have a value but still
  // want to be able to use optional chaining on arbitrary RoleActions.
  firstNight?: F extends Object ? PhaseAction<F> : never
  day?: D extends Object ? PhaseAction<D> : never
  night?: N extends Object ? PhaseAction<N> : never
}

interface Villager extends RoleBase {
  name: 'villager'
  description: ''
  side: 'village'
  appearsAs: 'village'
  actions: RoleActions<never, {lynch: string | null}, never>
}

interface Mafia extends RoleBase {
  name: 'mafia'
  description: ''
  side: 'mafia'
  appearsAs: 'mafia'
  actions: RoleActions<{}, {lynch: string | null}, {}>
}

interface Detective extends RoleBase {
  name: 'detective'
  description: ''
  side: 'village'
  appearsAs: 'village'
  actions: RoleActions<never, {lynch: string | null}, {}>
}

interface Nurse extends RoleBase {
  name: 'nurse'
  description: ''
  side: 'village'
  appearsAs: 'village'
  actions: RoleActions<never, {lynch: string | null}, {}>
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
      },
      day: {
        completed: false,
        lynch: null,
      },
      night: {
        completed: false,
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
        lynch: null,
      },
      night: {
        completed: false,
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
        lynch: null,
      },
      night: {
        completed: false,
      },
    },
  } as Nurse,
} as const
