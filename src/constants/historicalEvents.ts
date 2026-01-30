/**
 * Historical Solar Storm Events Database
 * Famous geomagnetic storms for time-travel bookmarking
 */

export interface HistoricalEvent {
  id: string;
  name: string;
  date: Date;
  kpValue: number;
  solarWindSpeed: number; // km/s
  bzValue: number; // nT
  dstValue: number; // nT
  description: string;
  category: 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'EXTREME';
  impacts: string[];
}

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: 'carrington-1859',
    name: 'Carrington Event',
    date: new Date('1859-09-01T11:00:00Z'),
    kpValue: 9,
    solarWindSpeed: 2500,
    bzValue: -50,
    dstValue: -1760,
    description: 'The most powerful geomagnetic storm in recorded history. Telegraph systems worldwide failed, operators received shocks, and auroras were visible near the equator.',
    category: 'EXTREME',
    impacts: [
      'Telegraph systems worldwide failed',
      'Auroras visible in Caribbean',
      'Estimated -1760 nT Dst (strongest ever)',
      'Papers caught fire from induced currents'
    ]
  },
  {
    id: 'quebec-1989',
    name: 'Quebec Blackout',
    date: new Date('1989-03-13T02:44:00Z'),
    kpValue: 9,
    solarWindSpeed: 1000,
    bzValue: -35,
    dstValue: -589,
    description: 'Caused a 9-hour blackout in Quebec affecting 6 million people. Transformers were damaged across North America.',
    category: 'G5',
    impacts: [
      '6 million without power for 9 hours',
      'Transformers damaged in USA',
      'Satellite anomalies reported',
      'Aurora visible in Florida and Texas'
    ]
  },
  {
    id: 'halloween-2003',
    name: 'Halloween Storm',
    date: new Date('2003-10-29T06:00:00Z'),
    kpValue: 9,
    solarWindSpeed: 2000,
    bzValue: -40,
    dstValue: -383,
    description: 'Series of X-class flares and CMEs. Caused power outages in Sweden and damaged multiple satellites including ADEOS-2.',
    category: 'G5',
    impacts: [
      'Power outage in Malmö, Sweden',
      'ADEOS-2 satellite lost',
      'Mars Odyssey went into safe mode',
      'Aviation radiation dose exceeded limits'
    ]
  },
  {
    id: 'bastille-2000',
    name: 'Bastille Day Storm',
    date: new Date('2000-07-14T10:24:00Z'),
    kpValue: 9,
    solarWindSpeed: 1200,
    bzValue: -33,
    dstValue: -301,
    description: 'X5.7 flare followed by fast CME. Caused satellite anomalies and beautiful auroras visible across northern Europe and North America.',
    category: 'G5',
    impacts: [
      'X5.7-class solar flare',
      'Satellite operations affected',
      'Radio blackouts on sunlit side of Earth',
      'Auroras in southern US states'
    ]
  },
  {
    id: 'may-2024',
    name: 'May 2024 Superstorm',
    date: new Date('2024-05-10T20:00:00Z'),
    kpValue: 8,
    solarWindSpeed: 900,
    bzValue: -28,
    dstValue: -412,
    description: 'Strongest storm in over 20 years. Multiple X-class flares from AR 3664. Auroras visible across southern US, Europe, and Australia. STEVE phenomenon widely observed.',
    category: 'G5',
    impacts: [
      'First G5 watch since 2005',
      'Auroras in southern US (Alabama, Arizona)',
      'STEVE phenomenon widespread',
      'Farmer reports of GPS issues',
      'Starlink satellites degraded',
      'Power grid operators on alert'
    ]
  },
  {
    id: 'jan-2005',
    name: 'January 2005 Storm',
    date: new Date('2005-01-21T18:00:00Z'),
    kpValue: 8,
    solarWindSpeed: 850,
    bzValue: -25,
    dstValue: -265,
    description: 'Strong G4 storm that disrupted GPS and satellite operations. Part of Solar Cycle 23 peak activity.',
    category: 'G4',
    impacts: [
      'GPS timing errors reported',
      'Satellite drag increased',
      'HF radio blackouts',
      'Auroras visible in Scotland and northern US'
    ]
  },
  {
    id: 'sep-2017',
    name: 'September 2017 Storm',
    date: new Date('2017-09-08T00:00:00Z'),
    kpValue: 8,
    solarWindSpeed: 800,
    bzValue: -24,
    dstValue: -142,
    description: 'X9.3 flare, largest of Solar Cycle 24. Caused radio blackouts and affected hurricane relief efforts in Caribbean.',
    category: 'G4',
    impacts: [
      'X9.3 flare (largest of cycle 24)',
      'Radio blackouts during Hurricane Irma',
      'Satellite operations affected',
      'Radiation storm warnings issued'
    ]
  },
  {
    id: 'st-patricks-2015',
    name: "St. Patrick's Day Storm",
    date: new Date('2015-03-17T04:45:00Z'),
    kpValue: 8,
    solarWindSpeed: 700,
    bzValue: -22,
    dstValue: -223,
    description: 'Strong G4 storm caused widespread auroral displays. CME from X2.2 flare on March 11.',
    category: 'G4',
    impacts: [
      'Auroras visible in northern Europe',
      'Minor power grid fluctuations',
      'Satellite anomalies reported',
      'HF radio propagation affected'
    ]
  }
];

/**
 * Get event by ID
 */
export function getEventById(id: string): HistoricalEvent | undefined {
  return HISTORICAL_EVENTS.find(event => event.id === id);
}

/**
 * Get events by category
 */
export function getEventsByCategory(category: HistoricalEvent['category']): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(event => event.category === category);
}

/**
 * Get events within date range
 */
export function getEventsInRange(startDate: Date, endDate: Date): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(
    event => event.date >= startDate && event.date <= endDate
  );
}

/**
 * Sort events by severity (Kp value)
 */
export function getEventsBySeverity(): HistoricalEvent[] {
  return [...HISTORICAL_EVENTS].sort((a, b) => b.kpValue - a.kpValue);
}

/**
 * Get most extreme events (Kp >= 9)
 */
export function getExtremeEvents(): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(event => event.kpValue >= 9);
}
