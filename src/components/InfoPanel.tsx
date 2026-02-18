import { Card } from '../design/Card';
import { Button } from '../design/Button';

interface InfoPanelProps {
  title?: string;
  description?: string;
  onStartClick?: () => void;
  onViewMissionsClick?: () => void;
}

export function InfoPanel({ 
  title = 'SKÖLL-TRACK Mission Control',
  description = 'Real-time space weather monitoring and solar system exploration.',
  onStartClick,
  onViewMissionsClick
}: InfoPanelProps) {
  return (
    <aside className="info-panel">
      <header className="info-header">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      
      <section className="info-cards">
        <Card title="Live view" isPrimary>
          Real-time position, velocity, and status with smooth camera presets.
        </Card>
        
        <Card title="Data layers">
          Toggle metric layers like orbits, ground tracks, and solar wind alerts.
        </Card>
        
        <Card title="Scenarios">
          Jump into predefined events, geomagnetic storms, or historical passes.
        </Card>
      </section>
      
      <footer className="info-footer">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={onStartClick}
          className="w-full"
        >
          Start exploring
        </Button>
        <Button 
          variant="ghost" 
          size="md" 
          onClick={onViewMissionsClick}
          className="w-full"
        >
          View all missions
        </Button>
      </footer>
    </aside>
  );
}
