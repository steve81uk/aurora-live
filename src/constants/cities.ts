export interface City {
  name: string;
  lat: number;
  lon: number;
  color: string;
  timezone: string;
  population: number;
  auroraFrequency: 'high' | 'medium' | 'low';
  auroraProbability: 'High' | 'Medium' | 'Low';
  isCapital?: boolean;
}

// Tier 2: Massive 50+ City Database - Global Aurora Hotspots & Capitals
export const CITIES: City[] = [
  // === TIER 1: EXTREME AURORA HOTSPOTS (Northern) ===
  {
    name: "Fairbanks",
    lat: 64.8378,
    lon: -147.7164,
    color: "#00FFFF",
    timezone: "America/Anchorage",
    population: 32255,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Tromsø",
    lat: 69.6492,
    lon: 18.9553,
    color: "#FFFF00",
    timezone: "Europe/Oslo",
    population: 76448,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Yellowknife",
    lat: 62.4540,
    lon: -114.3718,
    color: "#FF4500",
    timezone: "America/Yellowknife",
    population: 19569,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Whitehorse",
    lat: 60.7212,
    lon: -135.0568,
    color: "#4B0082",
    timezone: "America/Whitehorse",
    population: 25085,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Kiruna",
    lat: 67.8558,
    lon: 20.2253,
    color: "#FFD700",
    timezone: "Europe/Stockholm",
    population: 17002,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Abisko",
    lat: 68.3498,
    lon: 18.8288,
    color: "#228B22",
    timezone: "Europe/Stockholm",
    population: 85,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Reykjavik",
    lat: 64.1466,
    lon: -21.9426,
    color: "#FF00FF",
    timezone: "Atlantic/Reykjavik",
    population: 131136,
    auroraFrequency: "high",
    auroraProbability: "High",
    isCapital: true
  },
  {
    name: "Murmansk",
    lat: 68.9585,
    lon: 33.0827,
    color: "#8A2BE2",
    timezone: "Europe/Moscow",
    population: 295374,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Svalbard (Longyearbyen)",
    lat: 78.2232,
    lon: 15.6267,
    color: "#FF1493",
    timezone: "Arctic/Longyearbyen",
    population: 2060,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Nuuk",
    lat: 64.1814,
    lon: -51.6941,
    color: "#00CED1",
    timezone: "America/Godthab",
    population: 18800,
    auroraFrequency: "high",
    auroraProbability: "High",
    isCapital: true
  },
  {
    name: "Inuvik",
    lat: 68.3607,
    lon: -133.7230,
    color: "#FF6347",
    timezone: "America/Inuvik",
    population: 3243,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Rovaniemi",
    lat: 66.5039,
    lon: 25.7294,
    color: "#9370DB",
    timezone: "Europe/Helsinki",
    population: 63000,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  
  // === TIER 2: HIGH AURORA ZONES (50-65°N/S) ===
  {
    name: "Anchorage",
    lat: 61.2181,
    lon: -149.9003,
    color: "#1E90FF",
    timezone: "America/Anchorage",
    population: 291247,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  {
    name: "Oslo",
    lat: 59.9139,
    lon: 10.7522,
    color: "#FF8C00",
    timezone: "Europe/Oslo",
    population: 697010,
    auroraFrequency: "medium",
    auroraProbability: "Medium",
    isCapital: true
  },
  {
    name: "Stockholm",
    lat: 59.3293,
    lon: 18.0686,
    color: "#FFD700",
    timezone: "Europe/Stockholm",
    population: 975904,
    auroraFrequency: "medium",
    auroraProbability: "Medium",
    isCapital: true
  },
  {
    name: "Helsinki",
    lat: 60.1699,
    lon: 24.9384,
    color: "#00BFFF",
    timezone: "Europe/Helsinki",
    population: 656920,
    auroraFrequency: "medium",
    auroraProbability: "Medium",
    isCapital: true
  },
  {
    name: "Juneau",
    lat: 58.3019,
    lon: -134.4197,
    color: "#ADFF2F",
    timezone: "America/Juneau",
    population: 32255,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "Iqaluit",
    lat: 63.7467,
    lon: -68.5170,
    color: "#FF69B4",
    timezone: "America/Iqaluit",
    population: 7740,
    auroraFrequency: "high",
    auroraProbability: "High"
  },
  
  // === SOUTHERN HEMISPHERE AURORA HOTSPOTS ===
  {
    name: "Ushuaia",
    lat: -54.8019,
    lon: -68.3030,
    color: "#FF69B4",
    timezone: "America/Argentina/Ushuaia",
    population: 56956,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "Punta Arenas",
    lat: -53.1638,
    lon: -70.9171,
    color: "#20B2AA",
    timezone: "America/Punta_Arenas",
    population: 127454,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "Hobart",
    lat: -42.8821,
    lon: 147.3272,
    color: "#FF8C00",
    timezone: "Australia/Hobart",
    population: 240410,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "Dunedin",
    lat: -45.8788,
    lon: 170.5028,
    color: "#556B2F",
    timezone: "Pacific/Auckland",
    population: 130700,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "Stewart Island",
    lat: -47.0000,
    lon: 167.8333,
    color: "#9932CC",
    timezone: "Pacific/Auckland",
    population: 408,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "Wellington",
    lat: -41.2865,
    lon: 174.7762,
    color: "#32CD32",
    timezone: "Pacific/Auckland",
    population: 215100,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "Christchurch",
    lat: -43.5321,
    lon: 172.6362,
    color: "#FF4500",
    timezone: "Pacific/Auckland",
    population: 381500,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  
  // === MAJOR WORLD CAPITALS & CITIES ===
  {
    name: "Cambridge",
    lat: 52.2053,
    lon: 0.1218,
    color: "#FFA500",
    timezone: "Europe/London",
    population: 158434,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "London",
    lat: 51.5074,
    lon: -0.1278,
    color: "#0000FF",
    timezone: "Europe/London",
    population: 8982000,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "Edinburgh",
    lat: 55.9533,
    lon: -3.1883,
    color: "#800080",
    timezone: "Europe/London",
    population: 524930,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "Dublin",
    lat: 53.3498,
    lon: -6.2603,
    color: "#228B22",
    timezone: "Europe/Dublin",
    population: 1173179,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "New York",
    lat: 40.7128,
    lon: -74.0060,
    color: "#FF0000",
    timezone: "America/New_York",
    population: 8419600,
    auroraFrequency: "low",
    auroraProbability: "Low"
  },
  {
    name: "Ottawa",
    lat: 45.4215,
    lon: -75.6972,
    color: "#DC143C",
    timezone: "America/Toronto",
    population: 994837,
    auroraFrequency: "medium",
    auroraProbability: "Medium",
    isCapital: true
  },
  {
    name: "Montreal",
    lat: 45.5017,
    lon: -73.5673,
    color: "#4169E1",
    timezone: "America/Toronto",
    population: 1762949,
    auroraFrequency: "medium",
    auroraProbability: "Medium"
  },
  {
    name: "Seattle",
    lat: 47.6062,
    lon: -122.3321,
    color: "#2E8B57",
    timezone: "America/Los_Angeles",
    population: 753675,
    auroraFrequency: "low",
    auroraProbability: "Low"
  },
  {
    name: "Tokyo",
    lat: 35.6762,
    lon: 139.6503,
    color: "#00FF00",
    timezone: "Asia/Tokyo",
    population: 13960000,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "Moscow",
    lat: 55.7558,
    lon: 37.6173,
    color: "#8B0000",
    timezone: "Europe/Moscow",
    population: 12655050,
    auroraFrequency: "medium",
    auroraProbability: "Medium",
    isCapital: true
  },
  {
    name: "Beijing",
    lat: 39.9042,
    lon: 116.4074,
    color: "#FFD700",
    timezone: "Asia/Shanghai",
    population: 21540000,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "Berlin",
    lat: 52.5200,
    lon: 13.4050,
    color: "#FF8C00",
    timezone: "Europe/Berlin",
    population: 3769495,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "Paris",
    lat: 48.8566,
    lon: 2.3522,
    color: "#9370DB",
    timezone: "Europe/Paris",
    population: 2165423,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "Copenhagen",
    lat: 55.6761,
    lon: 12.5683,
    color: "#00CED1",
    timezone: "Europe/Copenhagen",
    population: 799033,
    auroraFrequency: "medium",
    auroraProbability: "Medium",
    isCapital: true
  },
  {
    name: "Tallinn",
    lat: 59.4370,
    lon: 24.7536,
    color: "#4682B4",
    timezone: "Europe/Tallinn",
    population: 438341,
    auroraFrequency: "medium",
    auroraProbability: "Medium",
    isCapital: true
  },
  {
    name: "Riga",
    lat: 56.9496,
    lon: 24.1052,
    color: "#DA70D6",
    timezone: "Europe/Riga",
    population: 632614,
    auroraFrequency: "medium",
    auroraProbability: "Medium",
    isCapital: true
  },
  {
    name: "Vilnius",
    lat: 54.6872,
    lon: 25.2797,
    color: "#FFB6C1",
    timezone: "Europe/Vilnius",
    population: 574221,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "Reykjavik",
    lat: 64.1466,
    lon: -21.9426,
    color: "#FF00FF",
    timezone: "Atlantic/Reykjavik",
    population: 131136,
    auroraFrequency: "high",
    auroraProbability: "High",
    isCapital: true
  },
  {
    name: "Sydney",
    lat: -33.8688,
    lon: 151.2093,
    color: "#FFD700",
    timezone: "Australia/Sydney",
    population: 5312163,
    auroraFrequency: "low",
    auroraProbability: "Low"
  },
  {
    name: "Melbourne",
    lat: -37.8136,
    lon: 144.9631,
    color: "#9370DB",
    timezone: "Australia/Melbourne",
    population: 5078193,
    auroraFrequency: "low",
    auroraProbability: "Low"
  },
  {
    name: "Auckland",
    lat: -36.8485,
    lon: 174.7633,
    color: "#20B2AA",
    timezone: "Pacific/Auckland",
    population: 1657200,
    auroraFrequency: "low",
    auroraProbability: "Low"
  },
  {
    name: "Singapore",
    lat: 1.3521,
    lon: 103.8198,
    color: "#FF4500",
    timezone: "Asia/Singapore",
    population: 5685807,
    auroraFrequency: "low",
    auroraProbability: "Low",
    isCapital: true
  },
  {
    name: "Hong Kong",
    lat: 22.3193,
    lon: 114.1694,
    color: "#DC143C",
    timezone: "Asia/Hong_Kong",
    population: 7482500,
    auroraFrequency: "low",
    auroraProbability: "Low"
  },
  {
    name: "Los Angeles",
    lat: 34.0522,
    lon: -118.2437,
    color: "#FFD700",
    timezone: "America/Los_Angeles",
    population: 3979576,
    auroraFrequency: "low",
    auroraProbability: "Low"
  },
  {
    name: "Chicago",
    lat: 41.8781,
    lon: -87.6298,
    color: "#0000CD",
    timezone: "America/Chicago",
    population: 2716000,
    auroraFrequency: "low",
    auroraProbability: "Low"
  }
];

// Utility function to convert lat/lon to 3D vector on sphere
export function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  };
}
