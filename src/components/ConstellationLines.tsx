import { useMemo } from 'react';
import { Vector3, BufferGeometry } from 'three';

/**
 * Constellation Lines - Recognizable star patterns
 * Orion, Ursa Major (Big Dipper), Cassiopeia
 */
export default function ConstellationLines() {
  // Constellation data (simplified positions) - memoized for performance
  const constellations = useMemo(() => {
    return [
      {
        name: 'Orion',
        lines: [
          // Orion's Belt + shoulders + legs (simplified)
          [
            new Vector3(100, 20, 80),
            new Vector3(105, 20, 75),
            new Vector3(110, 20, 80),
          ],
          [
            new Vector3(105, 20, 75),
            new Vector3(105, 10, 75),
          ],
          [
            new Vector3(105, 10, 75),
            new Vector3(95, 0, 75),
          ],
          [
            new Vector3(105, 10, 75),
            new Vector3(115, 0, 75),
          ],
        ],
        color: '#4A90E2',
      },
      {
        name: 'Ursa Major',
        lines: [
          // Big Dipper (ladle shape)
          [
            new Vector3(-80, 60, 50),
            new Vector3(-85, 55, 55),
            new Vector3(-90, 50, 50),
            new Vector3(-95, 45, 55),
          ],
          [
            new Vector3(-95, 45, 55),
            new Vector3(-90, 40, 60),
            new Vector3(-85, 38, 58),
            new Vector3(-80, 40, 55),
          ],
        ],
        color: '#F5A623',
      },
      {
        name: 'Cassiopeia',
        lines: [
          // W-shape
          [
            new Vector3(70, 80, -60),
            new Vector3(75, 85, -65),
            new Vector3(80, 80, -60),
            new Vector3(85, 85, -65),
            new Vector3(90, 80, -60),
          ],
        ],
        color: '#9B59B6',
      },
    ];
  }, []);

  return (
    <group>
      {constellations.map((constellation, idx) => (
        <group key={idx}>
          {constellation.lines.map((points, lineIdx) => {
            const geometry = new BufferGeometry().setFromPoints(points);
            return (
              <line key={lineIdx}>
                <bufferGeometry attach="geometry" {...geometry} />
                <lineBasicMaterial
                  attach="material"
                  color={constellation.color}
                  transparent
                  opacity={0.3}
                />
              </line>
            );
          })}
        </group>
      ))}
    </group>
  );
}
