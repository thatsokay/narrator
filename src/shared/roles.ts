export interface Role {
  name: string
  description: string
  side: 'mafia' | 'village' // Which side they win with
  appearsAs: 'mafia' | 'village' // Side revealed on 'see' actions
  actions: {
    firstNight?: RoleAction
    day?: RoleAction
    night?: RoleAction
  }
}

export type RoleName = 'villager' | 'mafia' | 'detective' | 'nurse'

export type RoleActionType =
  | 'inform' // Reveal role to others at night
  | 'lynch' // Vote to lynch target at day
  | 'kill' // Vote to kill target at night
  | 'see' // See a target's side
  | 'heal' // Prevent a kill on target

export type RoleAction<T extends Object = {}> = {
  completed: boolean
} & T

export const ROLES = Object.freeze({
  villager: {
    name: 'villager',
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: {
        completed: false,
      },
    },
  } as Role,
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
      },
      night: {
        completed: false,
      },
    },
  } as Role,
  detective: {
    name: 'detective',
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: {
        completed: false,
      },
      night: {
        completed: false,
      },
    },
  } as Role,
  nurse: {
    name: 'nurse',
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: {
        completed: false,
      },
      night: {
        completed: false,
      },
    },
  } as Role,
})
