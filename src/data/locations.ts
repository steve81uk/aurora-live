import type { Location } from '../types/aurora';

/**
 * Curated list of aurora viewing locations worldwide.
 * Includes Arctic classics, detailed UK/Ireland coverage, US northern tier dark sky sites,
 * and southern hemisphere locations.
 */
export const LOCATIONS: Location[] = [
  // ===== ARCTIC CLASSICS =====
  {
    name: 'Reykjavik, Iceland',
    lat: 64.1466,
    lon: -21.9426,
    magneticLat: 64.8,
    hemisphere: 'north'
  },
  {
    name: 'Tromsø, Norway',
    lat: 69.6492,
    lon: 18.9553,
    magneticLat: 66.7,
    hemisphere: 'north'
  },
  {
    name: 'Fairbanks, Alaska',
    lat: 64.8378,
    lon: -147.7164,
    magneticLat: 65.3,
    hemisphere: 'north'
  },
  {
    name: 'Yellowknife, Canada',
    lat: 62.4540,
    lon: -114.3718,
    magneticLat: 69.5,
    hemisphere: 'north'
  },
  {
    name: 'Abisko, Sweden',
    lat: 68.3547,
    lon: 18.8200,
    magneticLat: 65.8,
    hemisphere: 'north'
  },
  {
    name: 'Svalbard, Norway',
    lat: 78.2232,
    lon: 15.6267,
    magneticLat: 75.3,
    hemisphere: 'north'
  },
  
  // ===== UK & IRELAND (DETAILED) =====
  // England - East
  {
    name: 'Cambridge, England',
    lat: 52.2053,
    lon: 0.1218,
    magneticLat: 54.1,
    hemisphere: 'north'
  },
  {
    name: 'Norfolk Coast, England',
    lat: 52.9540,
    lon: 0.9730,
    magneticLat: 54.8,
    hemisphere: 'north'
  },
  
  // Scotland - North
  {
    name: 'Edinburgh, Scotland',
    lat: 55.9533,
    lon: -3.1883,
    magneticLat: 57.5,
    hemisphere: 'north'
  },
  {
    name: 'Inverness, Scotland',
    lat: 57.4778,
    lon: -4.2247,
    magneticLat: 59.1,
    hemisphere: 'north'
  },
  {
    name: 'Isle of Skye, Scotland',
    lat: 57.2736,
    lon: -6.2155,
    magneticLat: 58.8,
    hemisphere: 'north'
  },
  {
    name: 'Cairngorms Dark Sky Park, Scotland',
    lat: 57.0833,
    lon: -3.6667,
    magneticLat: 58.7,
    hemisphere: 'north'
  },
  
  // England - North
  {
    name: 'Lake District, England',
    lat: 54.4500,
    lon: -3.1000,
    magneticLat: 56.2,
    hemisphere: 'north'
  },
  {
    name: 'Kielder Forest, Northumberland',
    lat: 55.2100,
    lon: -2.5500,
    magneticLat: 56.9,
    hemisphere: 'north'
  },
  {
    name: 'Yorkshire Dales, England',
    lat: 54.2167,
    lon: -2.0833,
    magneticLat: 56.0,
    hemisphere: 'north'
  },
  
  // Wales
  {
    name: 'Cardiff, Wales',
    lat: 51.4816,
    lon: -3.1791,
    magneticLat: 53.4,
    hemisphere: 'north'
  },
  {
    name: 'Brecon Beacons, Wales',
    lat: 51.8833,
    lon: -3.4333,
    magneticLat: 53.7,
    hemisphere: 'north'
  },
  {
    name: 'Snowdonia Dark Sky Reserve, Wales',
    lat: 52.9108,
    lon: -3.9089,
    magneticLat: 54.7,
    hemisphere: 'north'
  },
  
  // England - South
  {
    name: 'Cornwall, England',
    lat: 50.2660,
    lon: -5.0527,
    magneticLat: 52.3,
    hemisphere: 'north'
  },
  {
    name: 'South Downs, England',
    lat: 50.8800,
    lon: -0.5400,
    magneticLat: 52.8,
    hemisphere: 'north'
  },
  
  // Ireland & Northern Ireland
  {
    name: 'Dublin, Ireland',
    lat: 53.3498,
    lon: -6.2603,
    magneticLat: 55.1,
    hemisphere: 'north'
  },
  {
    name: 'Malin Head, Ireland',
    lat: 55.3789,
    lon: -7.3661,
    magneticLat: 57.0,
    hemisphere: 'north'
  },
  {
    name: 'OM Dark Sky Park, Tyrone',
    lat: 54.6211,
    lon: -7.2869,
    magneticLat: 56.3,
    hemisphere: 'north'
  },
  
  // ===== USA (NORTHERN TIER & DARK SKIES) =====
  // Northeast
  {
    name: 'Acadia National Park, Maine',
    lat: 44.3386,
    lon: -68.2733,
    magneticLat: 55.2,
    hemisphere: 'north'
  },
  {
    name: 'Cherry Springs State Park, Pennsylvania',
    lat: 41.6611,
    lon: -77.8208,
    magneticLat: 52.0,
    hemisphere: 'north'
  },
  
  // Midwest
  {
    name: 'Headlands Dark Sky Park, Michigan',
    lat: 45.7744,
    lon: -85.0436,
    magneticLat: 55.8,
    hemisphere: 'north'
  },
  {
    name: 'Voyageurs National Park, Minnesota',
    lat: 48.5000,
    lon: -92.8333,
    magneticLat: 60.0,
    hemisphere: 'north'
  },
  {
    name: 'Theodore Roosevelt National Park, North Dakota',
    lat: 46.9789,
    lon: -103.4500,
    magneticLat: 58.5,
    hemisphere: 'north'
  },
  
  // West
  {
    name: 'Glacier National Park, Montana',
    lat: 48.7596,
    lon: -113.7870,
    magneticLat: 60.2,
    hemisphere: 'north'
  },
  {
    name: 'Idaho Panhandle',
    lat: 47.6777,
    lon: -116.7805,
    magneticLat: 58.5,
    hemisphere: 'north'
  },
  {
    name: 'Olympic National Park, Washington',
    lat: 47.8021,
    lon: -123.6044,
    magneticLat: 57.8,
    hemisphere: 'north'
  },
  
  // ===== ADDITIONAL NORTH AMERICA =====
  {
    name: 'Whitehorse, Yukon',
    lat: 60.7212,
    lon: -135.0568,
    magneticLat: 66.0,
    hemisphere: 'north'
  },
  {
    name: 'Churchill, Manitoba',
    lat: 58.7684,
    lon: -94.1648,
    magneticLat: 68.5,
    hemisphere: 'north'
  },
  {
    name: 'Anchorage, Alaska',
    lat: 61.2181,
    lon: -149.9003,
    magneticLat: 61.5,
    hemisphere: 'north'
  },
  {
    name: 'Juneau, Alaska',
    lat: 58.3019,
    lon: -134.4197,
    magneticLat: 59.8,
    hemisphere: 'north'
  },
  
  // ===== ADDITIONAL SCANDINAVIA =====
  {
    name: 'Rovaniemi, Finland',
    lat: 66.5039,
    lon: 25.7294,
    magneticLat: 63.5,
    hemisphere: 'north'
  },
  {
    name: 'Kiruna, Sweden',
    lat: 67.8558,
    lon: 20.2253,
    magneticLat: 65.0,
    hemisphere: 'north'
  },
  {
    name: 'Lofoten Islands, Norway',
    lat: 68.2250,
    lon: 13.6089,
    magneticLat: 65.5,
    hemisphere: 'north'
  },
  {
    name: 'Alta, Norway',
    lat: 69.9689,
    lon: 23.2717,
    magneticLat: 66.8,
    hemisphere: 'north'
  },
  {
    name: 'Nuuk, Greenland',
    lat: 64.1814,
    lon: -51.6941,
    magneticLat: 72.0,
    hemisphere: 'north'
  },
  
  // ===== ADDITIONAL EUROPE =====
  {
    name: 'Orkney Islands, Scotland',
    lat: 59.0000,
    lon: -3.0000,
    magneticLat: 60.5,
    hemisphere: 'north'
  },
  {
    name: 'Shetland Islands, Scotland',
    lat: 60.1557,
    lon: -1.1450,
    magneticLat: 61.7,
    hemisphere: 'north'
  },
  
  // ===== SOUTHERN HEMISPHERE =====
  {
    name: 'Ushuaia, Argentina',
    lat: -54.8019,
    lon: -68.3029,
    magneticLat: -53.2,
    hemisphere: 'south'
  },
  {
    name: 'Hobart, Tasmania',
    lat: -42.8821,
    lon: 147.3272,
    magneticLat: -50.8,
    hemisphere: 'south'
  },
  {
    name: 'Dunedin, New Zealand',
    lat: -45.8788,
    lon: 170.5028,
    magneticLat: -48.5,
    hemisphere: 'south'
  },
  {
    name: 'Stewart Island, New Zealand',
    lat: -46.8983,
    lon: 168.1267,
    magneticLat: -49.8,
    hemisphere: 'south'
  },
  {
    name: 'Invercargill, New Zealand',
    lat: -46.4132,
    lon: 168.3538,
    magneticLat: -49.2,
    hemisphere: 'south'
  }
];

/**
 * Finds the nearest location from the LOCATIONS list to given coordinates.
 * Uses the Haversine formula to calculate great-circle distances.
 * 
 * @param lat - Latitude of the target point
 * @param lon - Longitude of the target point
 * @returns The closest Location from the list
 */
export function findNearestLocation(lat: number, lon: number): Location {
  let nearestLocation = LOCATIONS[0];
  let minDistance = Number.MAX_VALUE;
  
  for (const location of LOCATIONS) {
    const distance = haversineDistance(lat, lon, location.lat, location.lon);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = location;
    }
  }
  
  return nearestLocation;
}

/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula.
 * 
 * @param lat1 - Latitude of first point in degrees
 * @param lon1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lon2 - Longitude of second point in degrees
 * @returns Distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
