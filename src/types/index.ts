// Type definitions

export interface SeasonData {
  season: string;
  currentRound: number;
  totalRounds: number;
  status: string;
}

export interface DriverStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  driverId: string;
  firstName: string;
  lastName: string;
  constructor: string;
  constructorId: string;
  nationality: string;
}

export interface ConstructorStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  constructorId: string;
  name: string;
  nationality: string;
}

export interface Race {
  season: string;
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  locality: string;
  date: string;
  time: string;
  winner?: string;
}

export interface DriverInfo {
  driverId: string;
  permanentNumber: string;
  code: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  imageUrl?: string;
  team: string;
  biography?: string;
  championships?: number;
  wins?: number;
  podiums?: number;
  careerPoints?: number;
}

export interface ConstructorInfo {
  constructorId: string;
  name: string;
  nationality: string;
  logoUrl?: string;
  carImageUrl?: string;
  headquarters?: string;
  teamPrincipal?: string;
  technicalDirector?: string;
  championships?: number;
  wins?: number;
  podiums?: number;
  polePositions?: number;
  history?: string;
}

export interface RaceResults {
  season: string;
  round: number;
  raceName: string;
  circuitName: string;
  date: string;
  time: string;
  circuitInfo?: {
    name: string;
    location: string;
    country: string;
    length: string;
    laps: number;
    firstGrandPrix: string;
    lapRecord: string;
    imageUrl?: string;
  };
  results: Array<{
    position: number;
    positionText: string;
    points: number;
    driverId: string;
    driverName: string;
    constructorId: string;
    constructorName: string;
    grid: number;
    laps: number;
    status: string;
    time?: string;
  }>;
  fastestLap?: {
    driverName: string;
    lap: number;
    time: string;
  };
}
