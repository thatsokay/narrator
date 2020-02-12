export interface RoleBase {
  name: RoleName
  description: string
  side: 'mafia' | 'village' // Which side they win with
  appearsAs: 'mafia' | 'village' // Side revealed on 'see' actions
  actions: RoleActions
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
  F extends Object = {},
  D extends Object = {},
  N extends Object = {}
> {
  firstNight?: PhaseAction<F>
  day?: PhaseAction<D>
  night?: PhaseAction<N>
}

interface Villager extends RoleBase {
  name: 'villager'
  description: ''
  side: 'village'
  appearsAs: 'village'
  actions: RoleActions<{}, {lynch: string | null}, {}>
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
  actions: RoleActions<{}, {lynch: string | null}, {}>
}

interface Nurse extends RoleBase {
  name: 'nurse'
  description: ''
  side: 'village'
  appearsAs: 'village'
  actions: RoleActions<{}, {lynch: string | null}, {}>
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
        lynch: null as string | null,
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
        lynch: null as string | null,
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
        lynch: null as string | null,
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
        lynch: null as string | null,
      },
      night: {
        completed: false,
      },
    },
  } as Nurse,
} as const
