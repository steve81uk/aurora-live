// Surface View Locations for Each Planet

export interface SurfaceLocation {
  name: string;
  description: string;
  lat: number;
  lon: number;
  altitude?: number; // km above surface (for gas giants)
  mythicName?: {
    norse?: string;
    sheikah?: string;
  };
}

export const SURFACE_LOCATIONS: Record<string, SurfaceLocation[]> = {
  Mercury: [
    {
      name: 'Caloris Basin',
      description: 'Massive impact crater',
      lat: 30.5,
      lon: -170.2,
      mythicName: { norse: 'Muspelheim Scar', sheikah: 'Fire Temple Ruins' },
    },
  ],
  Venus: [
    {
      name: 'Maxwell Montes',
      description: 'Highest mountain on Venus',
      lat: 65.2,
      lon: 3.3,
      mythicName: { norse: 'Mount Asgard', sheikah: 'Death Mountain Peak' },
    },
  ],
  Earth: [
    {
      name: 'Reykjavik, Iceland',
      description: 'Aurora capital of the world',
      lat: 64.1466,
      lon: -21.9426,
      mythicName: { norse: 'Heimdall\'s Watch', sheikah: 'North Shrine' },
    },
    {
      name: 'Tromsø, Norway',
      description: 'Gateway to the Arctic',
      lat: 69.6492,
      lon: 18.9553,
      mythicName: { norse: 'Bifröst Landing', sheikah: 'Ice Shrine' },
    },
    {
      name: 'Fairbanks, Alaska',
      description: 'Auroral oval sweet spot',
      lat: 64.8378,
      lon: -147.7164,
      mythicName: { norse: 'Yggdrasil Root', sheikah: 'Tundra Shrine' },
    },
    {
      name: 'Stonehenge, England',
      description: 'Ancient megalithic structure',
      lat: 51.1789,
      lon: -1.8262,
      mythicName: { norse: 'Stone Circle of the Aesir', sheikah: 'Ancient Observatory' },
    },
    {
      name: 'Mount Everest',
      description: 'Roof of the world',
      lat: 27.9881,
      lon: 86.9250,
      mythicName: { norse: 'Odin\'s Throne', sheikah: 'Sky Temple Summit' },
    },
  ],
  Mars: [
    {
      name: 'Olympus Mons',
      description: 'Largest volcano in solar system',
      lat: 18.65,
      lon: -133.8,
      altitude: 21,
      mythicName: { norse: 'Thor\'s Forge', sheikah: 'Fire Divine Beast' },
    },
    {
      name: 'Valles Marineris',
      description: 'Massive canyon system',
      lat: -13.9,
      lon: -59.2,
      mythicName: { norse: 'Fenrir\'s Claw Marks', sheikah: 'Great Chasm' },
    },
  ],
  Jupiter: [
    {
      name: 'Great Red Spot',
      description: 'Massive storm system',
      lat: -22.0,
      lon: -110.0,
      altitude: 100,
      mythicName: { norse: 'Eye of Odin', sheikah: 'Vah Ruta Core' },
    },
    {
      name: 'North Pole',
      description: 'Hexagonal storm pattern',
      lat: 89.0,
      lon: 0.0,
      altitude: 100,
      mythicName: { norse: 'Valhalla Gate', sheikah: 'Guardian Nexus' },
    },
  ],
  Saturn: [
    {
      name: 'North Polar Hexagon',
      description: 'Mysterious hexagonal storm',
      lat: 78.0,
      lon: 0.0,
      altitude: 100,
      mythicName: { norse: 'Rune of Ymir', sheikah: 'Sheikah Seal' },
    },
    {
      name: 'Rings Edge View',
      description: 'Looking along the rings',
      lat: 0.0,
      lon: 0.0,
      altitude: 140,
      mythicName: { norse: 'Bifröst Fragment', sheikah: 'Divine Barrier' },
    },
  ],
  Uranus: [
    {
      name: 'South Pole',
      description: 'Currently facing the Sun',
      lat: -89.0,
      lon: 0.0,
      altitude: 100,
      mythicName: { norse: 'Niflheim Gateway', sheikah: 'Frozen Shrine' },
    },
  ],
  Neptune: [
    {
      name: 'Great Dark Spot',
      description: 'Storm system',
      lat: -22.0,
      lon: 0.0,
      altitude: 100,
      mythicName: { norse: 'Jormungandr\'s Eye', sheikah: 'Water Divine Beast' },
    },
  ],
};

/**
 * Convert lat/lon to 3D position on planet surface
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): { x: number; y: number; z: number } {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}
