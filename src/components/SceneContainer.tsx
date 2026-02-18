import type { ReactNode } from 'react';

interface SceneContainerProps {
  children: ReactNode;
}

export function SceneContainer({ children }: SceneContainerProps) {
  return (
    <section className="scene-panel">
      <div className="scene-container">
        {children}
      </div>
    </section>
  );
}
