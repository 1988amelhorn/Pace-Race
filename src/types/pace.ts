export type UnitType = 'mi' | 'km' | 'm';

export interface DistanceOption {
  id: string;
  name: string;
  category: 'sprint' | 'middle' | 'distance' | 'road' | 'ultra' | 'custom';
  distanceMeters: number;
  defaultUnit: UnitType;
}

export type SplitStrategy = 'even' | 'negative' | 'positive' | 'surge';

export interface SplitItem {
  number: number;
  distanceLabel: string;
  splitDistanceMeters: number;
  paceSecondsPerKm: number;
  paceSecondsPerMile: number;
  splitTimeSeconds: number;
  cumulativeTimeSeconds: number;
  elevationEffectPercent?: number;
  hillTaxSeconds?: number;
  terrainType?: 'flat' | 'uphill' | 'downhill';
}

export interface EnvironmentalConditions {
  tempF: number;
  humidityPercent: number;
  altitudeFeet: number;
  windMph: number;
  windType: 'headwind' | 'tailwind' | 'crosswind' | 'none';
  gradePercent: number; // +2% uphill, -2% downhill etc.
}

export interface EnvironmentFactorResult {
  heatDewImpactPercent: number;
  altitudeImpactPercent: number;
  windImpactPercent: number;
  gradeImpactPercent: number;
  totalAdjustmentPercent: number;
  dewPointF: number;
  heatCautionLevel: 'optimal' | 'moderate' | 'high' | 'hazardous';
  adjustedPaceSecondsPerMile: number;
  adjustedPaceSecondsPerKm: number;
  adjustedTotalTimeSeconds: number;
  timeDifferenceSeconds: number;
}

export interface TrainingPaces {
  vdot: number;
  easyPaceMileSeconds: number;
  marathonPaceMileSeconds: number;
  tempoPaceMileSeconds: number;
  intervalPaceMileSeconds: number;
  repetition400mSeconds: number;
}

export interface RacePrediction {
  distanceName: string;
  meters: number;
  predictedTimeSeconds: number;
  paceMileSeconds: number;
  paceKmSeconds: number;
}

export interface SavedRacePlan {
  id: string;
  name: string;
  date: string;
  distanceName: string;
  distanceMeters: number;
  targetTimeSeconds: number;
  strategy: SplitStrategy;
  envConditions: EnvironmentalConditions;
  notes: string;
}
