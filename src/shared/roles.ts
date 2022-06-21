import {DeepReadonly} from './types'

export type RoleName = 'villager' | 'mafia' | 'detective' | 'nurse'

type PhaseActionType =
  | 'lynch' // Vote to lynch target at day
  | 'kill' // Vote to kill target at night
  | 'investigate' // Reveal a target's `side`
  | 'heal' // Prevent a kill on target

export interface RoleBase {
  name: RoleName
  side: 'mafia' | 'village' // Which side they win with
  actions: {day?: PhaseActionType; night?: PhaseActionType}
}

interface Villager extends RoleBase {
  name: 'villager'
  side: 'village'
  actions: {
    day: 'lynch'
    night?: never
  }
}

interface Mafia extends RoleBase {
  name: 'mafia'
  side: 'mafia'
  actions: {
    day: 'lynch'
    night: 'kill'
  }
}

interface Detective extends RoleBase {
  name: 'detective'
  side: 'village'
  actions: {
    day: 'lynch'
    night: 'investigate'
  }
}

interface Nurse extends RoleBase {
  name: 'nurse'
  side: 'village'
  actions: {
    day: 'lynch'
    night: 'heal'
  }
}

export type Role = Villager | Mafia | Detective | Nurse

export const ROLES: DeepReadonly<{[T in RoleName]: Role & {name: T}}> = {
  villager: {
    name: 'villager',
    side: 'village',
    actions: {
      day: 'lynch',
    },
  },
  mafia: {
    name: 'mafia',
    side: 'mafia',
    actions: {
      day: 'lynch',
      night: 'kill',
    },
  },
  detective: {
    name: 'detective',
    side: 'village',
    actions: {
      day: 'lynch',
      night: 'investigate',
    },
  },
  nurse: {
    name: 'nurse',
    side: 'village',
    actions: {
      day: 'lynch',
      night: 'heal',
    },
  },
}

export interface PhaseActionStates extends Record<PhaseActionType, {}> {
  lynch: {
    lynch: string | null
  }
  kill: {
    kill: string
  }
  investigate: {
    investigate: string
  }
  heal: {
    heal: string
  }
}

type PhaseActionState<T extends PhaseActionType | undefined> =
  T extends keyof PhaseActionStates ? PhaseActionStates[T] : undefined

type RoleActionState<TRole extends Role> = {
  day?: PhaseActionState<TRole['actions']['day']>
  night?: PhaseActionState<TRole['actions']['night']>
}

type RoleState<TRole extends Role> = {
  name: TRole['name']
  actionStates: RoleActionState<TRole>
}

export type RoleActionStates = {
  [TRole in Role as TRole['name']]: RoleActionState<TRole>
}

export type RoleStates = {
  [TRole in Role as TRole['name']]: RoleState<TRole>
}
