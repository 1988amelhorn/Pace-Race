import {
  DistanceOption,
  EnvironmentalConditions,
  EnvironmentFactorResult,
  RacePrediction,
  SplitItem,
  SplitStrategy,
  TrainingPaces,
} from '../types/pace';

export const STANDARD_DISTANCES: DistanceOption[] = [
  { id: '100m', name: '100 Meters', category: 'sprint', distanceMeters: 100, defaultUnit: 'm' },
  { id: '200m', name: '200 Meters', category: 'sprint', distanceMeters: 200, defaultUnit: 'm' },
  { id: '400m', name: '400 Meters (1 Lap)', category: 'sprint', distanceMeters: 400, defaultUnit: 'm' },
  { id: '800m', name: '800 Meters (2 Laps)', category: 'middle', distanceMeters: 800, defaultUnit: 'm' },
  { id: '1500m', name: '1,500 Meters', category: 'middle', distanceMeters: 1500, defaultUnit: 'm' },
  { id: '1mile', name: '1 Mile', category: 'middle', distanceMeters: 1609.344, defaultUnit: 'mi' },
  { id: '1.5mile', name: '1.5 Miles', category: 'middle', distanceMeters: 2414.016, defaultUnit: 'mi' },
  { id: '2mile', name: '2 Miles', category: 'middle', distanceMeters: 3218.688, defaultUnit: 'mi' },
  { id: '3k', name: '3,000 Meters (3K)', category: 'distance', distanceMeters: 3000, defaultUnit: 'km' },
  { id: '3mile', name: '3 Miles', category: 'distance', distanceMeters: 4828.032, defaultUnit: 'mi' },
  { id: '5k', name: '5,000 Meters (5K)', category: 'distance', distanceMeters: 5000, defaultUnit: 'km' },
  { id: '4mile', name: '4 Miles', category: 'distance', distanceMeters: 6437.376, defaultUnit: 'mi' },
  { id: '5mile', name: '5 Miles', category: 'distance', distanceMeters: 8046.72, defaultUnit: 'mi' },
  { id: '8k', name: '8,000 Meters (8K)', category: 'distance', distanceMeters: 8000, defaultUnit: 'km' },
  { id: '6mile', name: '6 Miles', category: 'distance', distanceMeters: 9656.064, defaultUnit: 'mi' },
  { id: '10k', name: '10,000 Meters (10K)', category: 'distance', distanceMeters: 10000, defaultUnit: 'km' },
  { id: '7mile', name: '7 Miles', category: 'road', distanceMeters: 11265.408, defaultUnit: 'mi' },
  { id: '8mile', name: '8 Miles', category: 'road', distanceMeters: 12874.752, defaultUnit: 'mi' },
  { id: '9mile', name: '9 Miles', category: 'road', distanceMeters: 14484.096, defaultUnit: 'mi' },
  { id: '10mile', name: '10 Miles', category: 'road', distanceMeters: 16093.44, defaultUnit: 'mi' },
  { id: '11mile', name: '11 Miles', category: 'road', distanceMeters: 17702.784, defaultUnit: 'mi' },
  { id: '12mile', name: '12 Miles', category: 'road', distanceMeters: 19312.128, defaultUnit: 'mi' },
  { id: '13mile', name: '13 Miles', category: 'road', distanceMeters: 20921.472, defaultUnit: 'mi' },
  { id: 'half', name: 'Half Marathon (13.1 mi)', category: 'road', distanceMeters: 21097.5, defaultUnit: 'mi' },
  { id: '14mile', name: '14 Miles', category: 'road', distanceMeters: 22530.816, defaultUnit: 'mi' },
  { id: '15mile', name: '15 Miles', category: 'road', distanceMeters: 24140.16, defaultUnit: 'mi' },
  { id: '16mile', name: '16 Miles', category: 'road', distanceMeters: 25749.504, defaultUnit: 'mi' },
  { id: '17mile', name: '17 Miles', category: 'road', distanceMeters: 27358.848, defaultUnit: 'mi' },
  { id: '18mile', name: '18 Miles', category: 'road', distanceMeters: 28968.192, defaultUnit: 'mi' },
  { id: '19mile', name: '19 Miles', category: 'road', distanceMeters: 30577.536, defaultUnit: 'mi' },
  { id: '20mile', name: '20 Miles', category: 'road', distanceMeters: 32186.88, defaultUnit: 'mi' },
  { id: '21mile', name: '21 Miles', category: 'road', distanceMeters: 33796.224, defaultUnit: 'mi' },
  { id: '22mile', name: '22 Miles', category: 'road', distanceMeters: 35405.568, defaultUnit: 'mi' },
  { id: '23mile', name: '23 Miles', category: 'road', distanceMeters: 37014.912, defaultUnit: 'mi' },
  { id: '24mile', name: '24 Miles', category: 'road', distanceMeters: 38624.256, defaultUnit: 'mi' },
  { id: '25mile', name: '25 Miles', category: 'road', distanceMeters: 40233.6, defaultUnit: 'mi' },
  { id: 'marathon', name: 'Marathon (26.2 mi)', category: 'road', distanceMeters: 42195, defaultUnit: 'mi' },
  { id: '50k', name: '50K Ultra', category: 'ultra', distanceMeters: 50000, defaultUnit: 'km' },
];

export function formatTime(totalSeconds: number, includeMs = false): string {
  if (isNaN(totalSeconds) || totalSeconds < 0 || !isFinite(totalSeconds)) return '00:00';

  const ms = Math.floor((totalSeconds % 1) * 10);
  const secs = Math.floor(totalSeconds % 60);
  const totalMins = Math.floor(totalSeconds / 60);
  const mins = totalMins % 60;
  const hours = Math.floor(totalMins / 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  let result = '';
  if (hours > 0) {
    result = `${hours}:${pad(mins)}:${pad(secs)}`;
  } else {
    result = `${pad(mins)}:${pad(secs)}`;
  }

  if (includeMs) {
    result += `.${ms}`;
  }

  return result;
}

export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;

  const clean = timeStr.trim();

  // Colon format e.g. 1:20:00 or 20:00 or 5:30
  if (clean.includes(':')) {
    const parts = clean.split(':').map((p) => parseFloat(p) || 0);

    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
  }

  // Direct numeric string
  if (/^\d+(\.\d+)?$/.test(clean)) {
    const num = parseFloat(clean);
    if (clean.length === 4 && num > 600) {
      const m = parseInt(clean.substring(0, 2), 10);
      const s = parseInt(clean.substring(2, 4), 10);
      if (s < 60) return m * 60 + s;
    }
    if (clean.length === 3 && num > 100) {
      const m = parseInt(clean.substring(0, 1), 10);
      const s = parseInt(clean.substring(1, 3), 10);
      if (s < 60) return m * 60 + s;
    }
    return num;
  }

  return 0;
}

export function secondsPerMileToKm(secPerMile: number): number {
  return secPerMile / 1.609344;
}

export function secondsPerKmToMile(secPerKm: number): number {
  return secPerKm * 1.609344;
}

export function calcDewPointF(tempF: number, humidity: number): number {
  const td = tempF - ((100 - humidity) / 5) * 1.8;
  return Math.round(td * 10) / 10;
}

export function calculateEnvironmentFactors(
  basePaceSecPerMile: number,
  distanceMeters: number,
  env: EnvironmentalConditions
): EnvironmentFactorResult {
  const dewPointF = calcDewPointF(env.tempF, env.humidityPercent);
  const heatPlusDew = env.tempF + dewPointF;

  let heatImpact = 0;
  let caution: 'optimal' | 'moderate' | 'high' | 'hazardous' = 'optimal';

  if (heatPlusDew <= 100) {
    heatImpact = 0;
    caution = 'optimal';
  } else if (heatPlusDew <= 120) {
    heatImpact = 0.015;
    caution = 'moderate';
  } else if (heatPlusDew <= 140) {
    heatImpact = 0.04;
    caution = 'high';
  } else {
    heatImpact = 0.08;
    caution = 'hazardous';
  }

  let altitudeImpact = 0;
  const feet = env.altitudeFeet;
  if (feet > 3000) {
    const extraThousand = (feet - 3000) / 1000;
    altitudeImpact = extraThousand * 0.018;
  }

  let windImpact = 0;
  if (env.windMph > 5) {
    windImpact = (env.windMph - 5) * 0.003;
  }

  let gradeImpact = 0;
  if (env.gradePercent !== 0) {
    gradeImpact = env.gradePercent * 0.033; // ~3.3% per 1% grade
  }

  const totalFactor = 1 + heatImpact + altitudeImpact + windImpact + gradeImpact;

  const adjustedPaceMile = basePaceSecPerMile * totalFactor;
  const adjustedPaceKm = secondsPerMileToKm(adjustedPaceMile);

  const totalMiles = distanceMeters / 1609.344;
  const baseTimeSec = basePaceSecPerMile * totalMiles;
  const adjustedTimeSec = adjustedPaceMile * totalMiles;
  const timeDifferenceSec = adjustedTimeSec - baseTimeSec;

  return {
    heatDewImpactPercent: heatImpact * 100,
    altitudeImpactPercent: altitudeImpact * 100,
    windImpactPercent: windImpact * 100,
    gradeImpactPercent: gradeImpact * 100,
    totalAdjustmentPercent: (totalFactor - 1) * 100,
    dewPointF,
    heatCautionLevel: caution,
    adjustedPaceSecondsPerMile: adjustedPaceMile,
    adjustedPaceSecondsPerKm: adjustedPaceKm,
    adjustedTotalTimeSeconds: adjustedTimeSec,
    timeDifferenceSeconds: timeDifferenceSec,
  };
}

export function generateSplits(
  distanceMeters: number,
  paceSecPerMile: number,
  unit: 'mi' | 'km' | 'lap400',
  strategy: SplitStrategy,
  terrainProfile: 'flat' | 'rolling' | 'steep' | 'mountain' = 'flat',
  customHillTaxSec: number = 0
): SplitItem[] {
  let intervalMeters = 1609.344; // default 1 mile
  if (unit === 'km') intervalMeters = 1000;
  if (unit === 'lap400') intervalMeters = 400;

  const totalIntervals = Math.ceil(distanceMeters / intervalMeters);
  const splits: SplitItem[] = [];

  let cumulativeTime = 0;

  for (let i = 1; i <= totalIntervals; i++) {
    const isLast = i === totalIntervals;
    const previousMeters = (i - 1) * intervalMeters;
    const currentMeters = isLast ? distanceMeters : i * intervalMeters;
    const segmentMeters = currentMeters - previousMeters;

    let strategyFactor = 1.0;
    const progress = (i - 0.5) / totalIntervals;

    if (strategy === 'negative') {
      strategyFactor = 1.03 - progress * 0.06;
    } else if (strategy === 'positive') {
      strategyFactor = 0.97 + progress * 0.06;
    } else if (strategy === 'surge') {
      if (i === 1 || isLast) strategyFactor = 0.95;
      else strategyFactor = 1.02;
    }

    let intervalBaseSecMile = paceSecPerMile * strategyFactor;

    // Calculate Hill Tax Adjustment per mile for segment
    let hillTaxSecPerMile = 0;
    let terrainType: 'flat' | 'uphill' | 'downhill' = 'flat';

    if (terrainProfile === 'rolling') {
      // Rolling hills: uphill +3s/mi, downhill -2s/mi
      if (i % 2 === 1) {
        hillTaxSecPerMile = 3;
        terrainType = 'uphill';
      } else {
        hillTaxSecPerMile = -2;
        terrainType = 'downhill';
      }
    } else if (terrainProfile === 'steep') {
      // Steep grade: uphill +6s/mi, downhill -4s/mi
      if (i % 3 === 2 || (totalIntervals > 2 && i === Math.floor(totalIntervals / 2))) {
        hillTaxSecPerMile = 6;
        terrainType = 'uphill';
      } else if (i % 2 === 0) {
        hillTaxSecPerMile = -4;
        terrainType = 'downhill';
      } else {
        hillTaxSecPerMile = 3;
        terrainType = 'uphill';
      }
    } else if (terrainProfile === 'mountain') {
      // Capped maximum grade: uphill +8.5s to +9s/mi max (strictly constrained to max 9s limit)
      if (i % 2 === 1) {
        hillTaxSecPerMile = 8.5;
        terrainType = 'uphill';
      } else {
        hillTaxSecPerMile = -5;
        terrainType = 'downhill';
      }
    } else if (customHillTaxSec !== 0) {
      // Strictly clamp custom hill tax between -5 and +9 sec/mile max
      hillTaxSecPerMile = Math.max(-5, Math.min(9, customHillTaxSec));
      terrainType = hillTaxSecPerMile > 0 ? 'uphill' : hillTaxSecPerMile < 0 ? 'downhill' : 'flat';
    }

    const effectivePaceMile = intervalBaseSecMile + hillTaxSecPerMile;
    const segmentTimeSec = (effectivePaceMile * segmentMeters) / 1609.344;

    cumulativeTime += segmentTimeSec;

    const segmentPaceMile = (segmentTimeSec / segmentMeters) * 1609.344;
    const segmentPaceKm = secondsPerMileToKm(segmentPaceMile);

    let label = '';
    if (unit === 'mi') label = isLast && segmentMeters < 1500 ? `Finish (${(segmentMeters / 1609.344).toFixed(2)} mi)` : `Mile ${i}`;
    else if (unit === 'km') label = isLast && segmentMeters < 900 ? `Finish (${Math.round(segmentMeters)}m)` : `KM ${i}`;
    else label = `Lap ${i} (400m)`;

    splits.push({
      number: i,
      distanceLabel: label,
      splitDistanceMeters: segmentMeters,
      splitTimeSeconds: segmentTimeSec,
      cumulativeTimeSeconds: cumulativeTime,
      paceSecondsPerMile: segmentPaceMile,
      paceSecondsPerKm: segmentPaceKm,
      hillTaxSeconds: hillTaxSecPerMile,
      terrainType,
    });
  }

  return splits;
}

export function predictRaceTimes(knownDistMeters: number, knownTimeSec: number): RacePrediction[] {
  const riegelExponent = 1.06;

  return STANDARD_DISTANCES.map((target) => {
    const predictedTime = knownTimeSec * Math.pow(target.distanceMeters / knownDistMeters, riegelExponent);
    const paceMile = (predictedTime / target.distanceMeters) * 1609.344;
    const paceKm = secondsPerMileToKm(paceMile);

    return {
      distanceName: target.name,
      meters: target.distanceMeters,
      predictedTimeSeconds: predictedTime,
      paceMileSeconds: paceMile,
      paceKmSeconds: paceKm,
    };
  });
}

export function estimateTrainingPaces(fiveKSec: number): TrainingPaces {
  const fiveKPaceMile = (fiveKSec / 5000) * 1609.344;
  const vdot = Math.round(1000 / (fiveKSec / 60));

  return {
    vdot: Math.max(25, Math.min(85, vdot)),
    easyPaceMileSeconds: fiveKPaceMile * 1.25,
    marathonPaceMileSeconds: fiveKPaceMile * 1.15,
    tempoPaceMileSeconds: fiveKPaceMile * 1.07,
    intervalPaceMileSeconds: fiveKPaceMile * 0.96,
    repetition400mSeconds: (fiveKPaceMile * 0.90 * 400) / 1609.344,
  };
}
