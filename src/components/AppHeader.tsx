import { Button } from '../design/Button';
import { WolfIcon } from './WolfIcon';

interface AppHeaderProps {
  onHelpClick?: () => void;
  onThemeToggle?: () => void;
}

export function AppHeader({ onHelpClick, onThemeToggle }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* Wolf head logo */}
        <WolfIcon variant="head" size={32} glowing className="mr-3" />
        <span className="app-title">SKÖLL-TRACK</span>
      </div>
      
      <nav className="header-nav">
        <button className="nav-link is-active">
          <WolfIcon variant="paw" size={14} className="inline mr-1" />
          BRIDGE
        </button>
        <button className="nav-link">
          <WolfIcon variant="eye" size={14} className="inline mr-1" />
          ORACLE
        </button>
        <button className="nav-link">
          <WolfIcon variant="minimal" size={14} className="inline mr-1" />
          OBSERVA
        </button>
      </nav>
      
      <div className="header-right">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onHelpClick}
          className="icon-btn"
        >
          <WolfIcon variant="rune" size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onThemeToggle}
          className="icon-btn"
        >
          <WolfIcon variant="howl" size={18} />
        </Button>
      </div>
    </header>
  );
}
