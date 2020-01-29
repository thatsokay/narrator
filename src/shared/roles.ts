export interface Role {
  description: string
  side: 'mafia' | 'village' // Which side they win with
  appearsAs: 'mafia' | 'village' // Side revealed on 'see' actions
  actions: {
    firstNight?: ActionType
    day?: ActionType
    night?: ActionType
  }
}

export type ActionType =
  | 'inform' // Reveal role to others at night
  | 'lynch' // Vote to lynch target at day
  | 'kill' // Vote to kill target at night
  | 'see' // See a target's side
  | 'heal' // Prevent a kill on target

export const ROLES: Readonly<Record<string, Role>> = Object.freeze({
  villager: {
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: 'lynch',
    },
  },
  mafia: {
    description: '',
    side: 'mafia',
    appearsAs: 'mafia',
    actions: {
      firstNight: 'inform',
      day: 'lynch',
      night: 'kill',
    },
  },
  detective: {
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: 'lynch',
      night: 'see',
    },
  },
  nurse: {
    description: '',
    side: 'village',
    appearsAs: 'village',
    actions: {
      day: 'lynch',
      night: 'heal',
    },
  },
})
