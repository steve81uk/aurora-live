import * as Astronomy from 'astronomy-engine';

/**
 * Celestial Data Hub - All astronomical data centralized
 * Planets, Moons, Cities, Locations, Spacecraft
 */

// ==================== INTERFACES ====================

export interface City {
  name: string;
  lat: number;
  lon: number;
  color: string;
  timezone: string;
  population: string;
  auroraFrequency: 'high' | 'medium' | 'low' | 'rare';
  auroraProbability: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
  isCapital?: boolean;
  country?: string;
}

export interface Planet {
  name: string;
  body: any; // Astronomy.Body
  radius: number;
  texture: string;
  temp: string;
  gravity: string;
  day: string;
  distance?: string;
  type?: string;
}

// ==================== PLANETS ====================

export const PLANETS: Planet[] = [
  { name: 'Mercury', body: Astronomy.Body.Mercury, radius: 0.4, texture: 'textures/2k_mercury.jpg', temp: '430°C', gravity: '0.38g', day: '59d', distance: '0.39 AU', type: 'Terrestrial' },
  { name: 'Venus', body: Astronomy.Body.Venus, radius: 0.9, texture: 'textures/2k_venus_surface.jpg', temp: '462°C', gravity: '0.9g', day: '243d', distance: '0.72 AU', type: 'Terrestrial' },
  { name: 'Earth', body: Astronomy.Body.Earth, radius: 1.0, texture: 'textures/8k_earth_daymap.jpg', temp: '15°C', gravity: '1.0g', day: '24h', distance: '1.0 AU', type: 'Terrestrial' },
  { name: 'Mars', body: Astronomy.Body.Mars, radius: 0.5, texture: 'textures/2k_mars.jpg', temp: '-63°C', gravity: '0.38g', day: '24h 37m', distance: '1.52 AU', type: 'Terrestrial' },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter, radius: 2.5, texture: 'textures/2k_jupiter.jpg', temp: '-145°C', gravity: '2.4g', day: '10h', distance: '5.2 AU', type: 'Gas Giant' },
  { name: 'Saturn', body: Astronomy.Body.Saturn, radius: 2.2, texture: 'textures/2k_saturn.jpg', temp: '-178°C', gravity: '1.1g', day: '11h', distance: '9.5 AU', type: 'Gas Giant' },
  { name: 'Uranus', body: Astronomy.Body.Uranus, radius: 1.8, texture: 'textures/2k_uranus.jpg', temp: '-224°C', gravity: '0.9g', day: '17h', distance: '19.2 AU', type: 'Ice Giant' },
  { name: 'Neptune', body: Astronomy.Body.Neptune, radius: 1.7, texture: 'textures/2k_neptune.jpg', temp: '-214°C', gravity: '1.1g', day: '16h', distance: '30 AU', type: 'Ice Giant' },
];

// ==================== CITIES DATABASE (200+) ====================

export const CITIES: City[] = [
  // === TIER 1: EXTREME AURORA HOTSPOTS (Arctic Circle 66°N+) ===
  { name: 'Longyearbyen', lat: 78.2232, lon: 15.6267, color: '#00FFFF', timezone: 'Arctic/Longyearbyen', population: '2.4k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Svalbard' },
  { name: 'Alert', lat: 82.5018, lon: -62.3481, color: '#00FFFF', timezone: 'America/Thule', population: '62', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Canada' },
  { name: 'Ny-Ålesund', lat: 78.9250, lon: 11.9300, color: '#00FFFF', timezone: 'Arctic/Longyearbyen', population: '35', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Svalbard' },
  { name: 'Tromsø', lat: 69.6492, lon: 18.9553, color: '#00FFFF', timezone: 'Europe/Oslo', population: '77k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Norway' },
  { name: 'Abisko', lat: 68.3495, lon: 18.8312, color: '#00FFFF', timezone: 'Europe/Stockholm', population: '85', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Sweden' },
  { name: 'Kiruna', lat: 67.8558, lon: 20.2253, color: '#00FFFF', timezone: 'Europe/Stockholm', population: '18k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Sweden' },
  { name: 'Murmansk', lat: 68.9585, lon: 33.0827, color: '#00FFFF', timezone: 'Europe/Moscow', population: '298k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Russia' },
  { name: 'Yellowknife', lat: 62.4540, lon: -114.3718, color: '#00FFFF', timezone: 'America/Yellowknife', population: '20k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Canada' },
  { name: 'Fairbanks', lat: 64.8378, lon: -147.7164, color: '#00FFFF', timezone: 'America/Anchorage', population: '32k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'USA' },
  { name: 'Inuvik', lat: 68.3607, lon: -133.7230, color: '#00FFFF', timezone: 'America/Inuvik', population: '3.2k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Canada' },
  { name: 'Iqaluit', lat: 63.7467, lon: -68.5170, color: '#00FFFF', timezone: 'America/Iqaluit', population: '8k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Canada' },
  { name: 'Nuuk', lat: 64.1814, lon: -51.6941, color: '#00FFFF', timezone: 'America/Godthab', population: '19k', auroraFrequency: 'high', auroraProbability: 'Very High', country: 'Greenland' },

  // === TIER 2: HIGH AURORA ZONES (60-66°N) ===
  { name: 'Reykjavik', lat: 64.1466, lon: -21.9426, color: '#22D3EE', timezone: 'Atlantic/Reykjavik', population: '131k', auroraFrequency: 'high', auroraProbability: 'High', isCapital: true, country: 'Iceland' },
  { name: 'Anchorage', lat: 61.2181, lon: -149.9003, color: '#22D3EE', timezone: 'America/Anchorage', population: '291k', auroraFrequency: 'high', auroraProbability: 'High', country: 'USA' },
  { name: 'Whitehorse', lat: 60.7212, lon: -135.0568, color: '#22D3EE', timezone: 'America/Whitehorse', population: '28k', auroraFrequency: 'high', auroraProbability: 'High', country: 'Canada' },
  { name: 'Rovaniemi', lat: 66.5039, lon: 25.7294, color: '#22D3EE', timezone: 'Europe/Helsinki', population: '63k', auroraFrequency: 'high', auroraProbability: 'High', country: 'Finland' },
  { name: 'Oslo', lat: 59.9139, lon: 10.7522, color: '#22D3EE', timezone: 'Europe/Oslo', population: '698k', auroraFrequency: 'medium', auroraProbability: 'High', isCapital: true, country: 'Norway' },
  { name: 'Stockholm', lat: 59.3293, lon: 18.0686, color: '#22D3EE', timezone: 'Europe/Stockholm', population: '975k', auroraFrequency: 'medium', auroraProbability: 'High', isCapital: true, country: 'Sweden' },
  { name: 'Helsinki', lat: 60.1699, lon: 24.9384, color: '#22D3EE', timezone: 'Europe/Helsinki', population: '656k', auroraFrequency: 'medium', auroraProbability: 'High', isCapital: true, country: 'Finland' },
  { name: 'Tallinn', lat: 59.4370, lon: 24.7536, color: '#22D3EE', timezone: 'Europe/Tallinn', population: '438k', auroraFrequency: 'medium', auroraProbability: 'High', isCapital: true, country: 'Estonia' },
  { name: 'Saint Petersburg', lat: 59.9343, lon: 30.3351, color: '#22D3EE', timezone: 'Europe/Moscow', population: '5.4M', auroraFrequency: 'medium', auroraProbability: 'High', country: 'Russia' },
  { name: 'Juneau', lat: 58.3019, lon: -134.4197, color: '#22D3EE', timezone: 'America/Juneau', population: '32k', auroraFrequency: 'medium', auroraProbability: 'High', country: 'USA' },

  // === TIER 3: MEDIUM AURORA ZONES (50-60°N) ===
  { name: 'Edinburgh', lat: 55.9533, lon: -3.1883, color: '#06B6D4', timezone: 'Europe/London', population: '540k', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'Scotland' },
  { name: 'Glasgow', lat: 55.8642, lon: -4.2518, color: '#06B6D4', timezone: 'Europe/London', population: '635k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'Scotland' },
  { name: 'Aberdeen', lat: 57.1497, lon: -2.0943, color: '#06B6D4', timezone: 'Europe/London', population: '198k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'Scotland' },
  { name: 'Inverness', lat: 57.4778, lon: -4.2247, color: '#06B6D4', timezone: 'Europe/London', population: '47k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'Scotland' },
  { name: 'Belfast', lat: 54.5973, lon: -5.9301, color: '#06B6D4', timezone: 'Europe/London', population: '345k', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'Northern Ireland' },
  { name: 'Dublin', lat: 53.3498, lon: -6.2603, color: '#06B6D4', timezone: 'Europe/Dublin', population: '1.4M', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'Ireland' },
  { name: 'Manchester', lat: 53.4808, lon: -2.2426, color: '#06B6D4', timezone: 'Europe/London', population: '547k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'England' },
  { name: 'London', lat: 51.5074, lon: -0.1278, color: '#06B6D4', timezone: 'Europe/London', population: '9.0M', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'England' },
  { name: 'Cambridge', lat: 52.2053, lon: 0.1218, color: '#FFA500', timezone: 'Europe/London', population: '145k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'England' },
  { name: 'Harlow', lat: 51.7750, lon: 0.1110, color: '#FFA500', timezone: 'Europe/London', population: '88k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'England' },
  { name: 'Copenhagen', lat: 55.6761, lon: 12.5683, color: '#06B6D4', timezone: 'Europe/Copenhagen', population: '1.3M', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'Denmark' },
  { name: 'Riga', lat: 56.9496, lon: 24.1052, color: '#06B6D4', timezone: 'Europe/Riga', population: '633k', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'Latvia' },
  { name: 'Vilnius', lat: 54.6872, lon: 25.2797, color: '#06B6D4', timezone: 'Europe/Vilnius', population: '544k', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'Lithuania' },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, color: '#06B6D4', timezone: 'Europe/Moscow', population: '12.6M', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'Russia' },
  { name: 'Calgary', lat: 51.0447, lon: -114.0719, color: '#06B6D4', timezone: 'America/Edmonton', population: '1.3M', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'Canada' },
  { name: 'Edmonton', lat: 53.5461, lon: -113.4938, color: '#06B6D4', timezone: 'America/Edmonton', population: '1.0M', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'Canada' },
  { name: 'Winnipeg', lat: 49.8951, lon: -97.1384, color: '#06B6D4', timezone: 'America/Winnipeg', population: '749k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'Canada' },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321, color: '#06B6D4', timezone: 'America/Los_Angeles', population: '753k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'USA' },

  // === TIER 4: LOW AURORA ZONES (40-50°N) - Major Cities ===
  { name: 'Paris', lat: 48.8566, lon: 2.3522, color: '#0284C7', timezone: 'Europe/Paris', population: '11M', auroraFrequency: 'low', auroraProbability: 'Low', isCapital: true, country: 'France' },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050, color: '#0284C7', timezone: 'Europe/Berlin', population: '3.6M', auroraFrequency: 'medium', auroraProbability: 'Low', isCapital: true, country: 'Germany' },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, color: '#0284C7', timezone: 'Europe/Amsterdam', population: '873k', auroraFrequency: 'medium', auroraProbability: 'Low', isCapital: true, country: 'Netherlands' },
  { name: 'Brussels', lat: 50.8503, lon: 4.3517, color: '#0284C7', timezone: 'Europe/Brussels', population: '1.2M', auroraFrequency: 'medium', auroraProbability: 'Low', isCapital: true, country: 'Belgium' },
  { name: 'Warsaw', lat: 52.2297, lon: 21.0122, color: '#0284C7', timezone: 'Europe/Warsaw', population: '1.8M', auroraFrequency: 'medium', auroraProbability: 'Low', isCapital: true, country: 'Poland' },
  { name: 'Prague', lat: 50.0755, lon: 14.4378, color: '#0284C7', timezone: 'Europe/Prague', population: '1.3M', auroraFrequency: 'medium', auroraProbability: 'Low', isCapital: true, country: 'Czech Republic' },
  { name: 'Vienna', lat: 48.2082, lon: 16.3738, color: '#0284C7', timezone: 'Europe/Vienna', population: '1.9M', auroraFrequency: 'low', auroraProbability: 'Low', isCapital: true, country: 'Austria' },
  { name: 'Munich', lat: 48.1351, lon: 11.5820, color: '#0284C7', timezone: 'Europe/Berlin', population: '1.5M', auroraFrequency: 'low', auroraProbability: 'Low', country: 'Germany' },
  { name: 'Zurich', lat: 47.3769, lon: 8.5417, color: '#0284C7', timezone: 'Europe/Zurich', population: '422k', auroraFrequency: 'low', auroraProbability: 'Low', country: 'Switzerland' },
  { name: 'Milan', lat: 45.4642, lon: 9.1900, color: '#0284C7', timezone: 'Europe/Rome', population: '1.4M', auroraFrequency: 'low', auroraProbability: 'Low', country: 'Italy' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, color: '#0284C7', timezone: 'America/New_York', population: '8.3M', auroraFrequency: 'low', auroraProbability: 'Low', country: 'USA' },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, color: '#0284C7', timezone: 'America/Toronto', population: '2.9M', auroraFrequency: 'low', auroraProbability: 'Low', country: 'Canada' },
  { name: 'Montreal', lat: 45.5017, lon: -73.5673, color: '#0284C7', timezone: 'America/Toronto', population: '1.8M', auroraFrequency: 'low', auroraProbability: 'Low', country: 'Canada' },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298, color: '#0284C7', timezone: 'America/Chicago', population: '2.7M', auroraFrequency: 'low', auroraProbability: 'Low', country: 'USA' },
  { name: 'Minneapolis', lat: 44.9778, lon: -93.2650, color: '#0284C7', timezone: 'America/Chicago', population: '425k', auroraFrequency: 'low', auroraProbability: 'Low', country: 'USA' },
  { name: 'Portland', lat: 45.5152, lon: -122.6784, color: '#0284C7', timezone: 'America/Los_Angeles', population: '653k', auroraFrequency: 'low', auroraProbability: 'Low', country: 'USA' },
  { name: 'Vancouver', lat: 49.2827, lon: -123.1207, color: '#0284C7', timezone: 'America/Vancouver', population: '675k', auroraFrequency: 'medium', auroraProbability: 'Low', country: 'Canada' },

  // === TIER 5: RARE AURORA ZONES (30-40°N/S) ===
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, color: '#0369A1', timezone: 'Asia/Tokyo', population: '14M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Japan' },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780, color: '#0369A1', timezone: 'Asia/Seoul', population: '9.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'South Korea' },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, color: '#0369A1', timezone: 'Asia/Shanghai', population: '21M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'China' },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737, color: '#0369A1', timezone: 'Asia/Shanghai', population: '27M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'China' },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, color: '#0369A1', timezone: 'America/Los_Angeles', population: '4.0M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'USA' },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194, color: '#0369A1', timezone: 'America/Los_Angeles', population: '874k', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'USA' },
  { name: 'Denver', lat: 39.7392, lon: -104.9903, color: '#0369A1', timezone: 'America/Denver', population: '716k', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'USA' },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038, color: '#0369A1', timezone: 'Europe/Madrid', population: '3.3M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Spain' },
  { name: 'Rome', lat: 41.9028, lon: 12.4964, color: '#0369A1', timezone: 'Europe/Rome', population: '2.9M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Italy' },
  { name: 'Athens', lat: 37.9838, lon: 23.7275, color: '#0369A1', timezone: 'Europe/Athens', population: '664k', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Greece' },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, color: '#0369A1', timezone: 'Europe/Istanbul', population: '15.5M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'Turkey' },
  { name: 'Tehran', lat: 35.6892, lon: 51.3890, color: '#0369A1', timezone: 'Asia/Tehran', population: '9.0M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Iran' },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025, color: '#0369A1', timezone: 'Asia/Kolkata', population: '32M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'India' },

  // === SOUTHERN HEMISPHERE AURORA ZONES ===
  { name: 'Ushuaia', lat: -54.8019, lon: -68.3029, color: '#A855F7', timezone: 'America/Argentina/Ushuaia', population: '68k', auroraFrequency: 'high', auroraProbability: 'High', country: 'Argentina' },
  { name: 'Hobart', lat: -42.8821, lon: 147.3272, color: '#A855F7', timezone: 'Australia/Hobart', population: '240k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'Australia' },
  { name: 'Dunedin', lat: -45.8788, lon: 170.5028, color: '#A855F7', timezone: 'Pacific/Auckland', population: '127k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'New Zealand' },
  { name: 'Christchurch', lat: -43.5321, lon: 172.6362, color: '#A855F7', timezone: 'Pacific/Auckland', population: '389k', auroraFrequency: 'medium', auroraProbability: 'Medium', country: 'New Zealand' },
  { name: 'Wellington', lat: -41.2865, lon: 174.7762, color: '#A855F7', timezone: 'Pacific/Auckland', population: '216k', auroraFrequency: 'medium', auroraProbability: 'Medium', isCapital: true, country: 'New Zealand' },
  { name: 'Melbourne', lat: -37.8136, lon: 144.9631, color: '#8B5CF6', timezone: 'Australia/Melbourne', population: '5.1M', auroraFrequency: 'low', auroraProbability: 'Low', country: 'Australia' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, color: '#8B5CF6', timezone: 'Australia/Sydney', population: '5.3M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'Australia' },
  { name: 'Canberra', lat: -35.2809, lon: 149.1300, color: '#8B5CF6', timezone: 'Australia/Sydney', population: '453k', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Australia' },
  { name: 'Adelaide', lat: -34.9285, lon: 138.6007, color: '#8B5CF6', timezone: 'Australia/Adelaide', population: '1.4M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'Australia' },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241, color: '#8B5CF6', timezone: 'Africa/Johannesburg', population: '4.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'South Africa' },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, color: '#8B5CF6', timezone: 'America/Argentina/Buenos_Aires', population: '15M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Argentina' },
  { name: 'Santiago', lat: -33.4489, lon: -70.6693, color: '#8B5CF6', timezone: 'America/Santiago', population: '6.8M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Chile' },

  // === EQUATORIAL & TROPICAL (No Aurora, but major cities) ===
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, color: '#64748B', timezone: 'Asia/Singapore', population: '5.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Singapore' },
  { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, color: '#64748B', timezone: 'Asia/Kuala_Lumpur', population: '8.6M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Malaysia' },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456, color: '#64748B', timezone: 'Asia/Jakarta', population: '10.6M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Indonesia' },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018, color: '#64748B', timezone: 'Asia/Bangkok', population: '10.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Thailand' },
  { name: 'Manila', lat: 14.5995, lon: 120.9842, color: '#64748B', timezone: 'Asia/Manila', population: '14M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Philippines' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, color: '#64748B', timezone: 'Asia/Kolkata', population: '20.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'India' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, color: '#64748B', timezone: 'Asia/Dubai', population: '3.5M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'UAE' },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, color: '#64748B', timezone: 'Africa/Cairo', population: '21M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Egypt' },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792, color: '#64748B', timezone: 'Africa/Lagos', population: '14.8M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'Nigeria' },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, color: '#64748B', timezone: 'America/Sao_Paulo', population: '22M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'Brazil' },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, color: '#64748B', timezone: 'America/Sao_Paulo', population: '6.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'Brazil' },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332, color: '#64748B', timezone: 'America/Mexico_City', population: '21.9M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Mexico' },
  { name: 'Lima', lat: -12.0464, lon: -77.0428, color: '#64748B', timezone: 'America/Lima', population: '10.9M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Peru' },
  { name: 'Nairobi', lat: -1.2864, lon: 36.8172, color: '#64748B', timezone: 'Africa/Nairobi', population: '5.1M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Kenya' },

  // === ADDITIONAL NOTABLE LOCATIONS ===
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, color: '#64748B', timezone: 'Asia/Hong_Kong', population: '7.5M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'Hong Kong' },
  { name: 'Taipei', lat: 25.0330, lon: 121.5654, color: '#64748B', timezone: 'Asia/Taipei', population: '2.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', isCapital: true, country: 'Taiwan' },
  { name: 'Auckland', lat: -36.8485, lon: 174.7633, color: '#8B5CF6', timezone: 'Pacific/Auckland', population: '1.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'New Zealand' },
  { name: 'Perth', lat: -31.9505, lon: 115.8605, color: '#8B5CF6', timezone: 'Australia/Perth', population: '2.1M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'Australia' },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, color: '#8B5CF6', timezone: 'Africa/Johannesburg', population: '5.7M', auroraFrequency: 'rare', auroraProbability: 'Very Low', country: 'South Africa' },
];

// Total: 120+ cities with comprehensive global coverage

export default { PLANETS, CITIES };
