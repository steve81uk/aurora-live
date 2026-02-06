import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Canvas Resize Handler
 * Ensures the Three.js canvas properly resizes with the window
 */
export function CanvasResizeHandler() {
  const { gl, camera } = useThree();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Update renderer size
      gl.setSize(width, height);

      // Update camera aspect ratio
      if ('aspect' in camera) {
        (camera as any).aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    // Initial resize
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      // Delay to ensure proper dimensions
      setTimeout(handleResize, 100);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
    };
  }, [gl, camera]);

  return null;
}
