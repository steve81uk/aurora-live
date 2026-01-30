# Contributing to Solar Admiral

First off, thank you for considering contributing to Solar Admiral! This project combines cutting-edge space weather science with immersive 3D visualization, and we welcome contributions from developers, scientists, and space enthusiasts.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/aurora-live.git`
3. **Install dependencies**: `npm install`
4. **Start dev server**: `npm run dev`
5. **Make your changes** in a new branch
6. **Test**: `npm run build` to ensure no errors
7. **Submit a pull request**

## 📋 Development Setup

### Prerequisites
- Node.js 18+ (npm 9+)
- Git
- Code editor (VS Code recommended with TypeScript/React extensions)

### Tech Stack
- **Frontend**: React 19, TypeScript 5.7
- **3D**: Three.js r172 via @react-three/fiber 9.0
- **Styling**: TailwindCSS 4.1
- **Build**: Vite 7.3
- **Physics**: astronomy-engine for planetary calculations

### Project Structure
```
aurora-live/
├── src/
│   ├── components/     # React components
│   │   ├── SolarSystemScene.tsx   # Main 3D scene
│   │   ├── MissionControlView.tsx # Analyst dashboard
│   │   ├── CornerMetrics.tsx      # HUD metrics
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services (future)
│   ├── types/          # TypeScript definitions
│   └── data/           # Static data (locations, cities)
├── scripts/            # Python/PowerShell prototypes
├── docs/               # Documentation
└── public/             # Static assets
```

## 🎯 How to Contribute

### Reporting Bugs
- Use GitHub Issues
- Include: Browser/OS, steps to reproduce, expected vs actual behavior
- Screenshots/videos are helpful!

### Suggesting Features
- Check existing issues first
- Explain the use case and benefits
- Be specific about the implementation if possible

### Code Contributions

#### What We're Looking For
- **Novel Physics Formulas**: New space weather analysis methods
- **Data Visualizations**: Charts, graphs, heatmaps
- **Performance Optimizations**: Reduce bundle size, improve FPS
- **Mobile Improvements**: Better touch controls, responsive layouts
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Documentation**: Code comments, README improvements, tutorials

#### Code Style
- **TypeScript**: Strict mode, proper types (no `any`)
- **React**: Functional components with hooks
- **Formatting**: Prettier (auto-format on save)
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Comments**: Document complex logic, formulas, and non-obvious code

#### Example Contribution
```typescript
// Good: Clear, typed, documented
interface SolarWindMetrics {
  speed: number; // km/s
  density: number; // particles/cm³
}

function calculateMomentumIndex(metrics: SolarWindMetrics): number {
  // Novel formula: momentum index = (density × velocity²) / 1000
  // Higher values indicate stronger magnetosphere compression
  return (metrics.density * Math.pow(metrics.speed, 2)) / 1000;
}
```

### Pull Request Process

1. **Branch naming**: `feature/your-feature` or `fix/bug-description`
2. **Commit messages**: Clear, descriptive
   ```
   feat: Add solar wind momentum index calculation
   
   - Implements novel formula: (ρ × v²) / 1000
   - Adds real-time metric card to Mission Control
   - Includes unit tests and documentation
   ```
3. **Keep PRs focused**: One feature/fix per PR
4. **Test your changes**: Run `npm run build` successfully
5. **Update docs**: If adding features, update README or docs/
6. **Be responsive**: Address review feedback promptly

## 🔬 Scientific Accuracy

When adding space physics calculations:
- **Cite sources**: Link to papers, NASA docs, NOAA formulas
- **Explain units**: Always document units (km/s, nT, nPa, etc.)
- **Validate ranges**: Ensure realistic values (e.g., Kp 0-9, not -5 or 15)
- **Test edge cases**: What happens with zero density? Negative Bz?

## 🎨 Design Guidelines

- **Glass Morphism**: Use `bg-black/40 backdrop-blur-lg` for panels
- **Color Palette**:
  - Cyan (#06b6d4): Primary UI elements
  - Purple (#a855f7): Mission Control accent
  - Green (#22c55e): Good status
  - Red (#ef4444): Alerts
- **Typography**: Inter font, monospace for data
- **Animations**: Subtle, 200-300ms transitions

## 🧪 Testing

Currently no automated tests (contributions welcome!). Manual testing:
1. Run dev server: `npm run dev`
2. Test in Chrome, Firefox, Safari
3. Test mobile (Chrome DevTools device emulation)
4. Verify no console errors
5. Check bundle size: `npm run build` (should stay < 350 KB gzipped)

## 📚 Resources

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [NOAA Space Weather](https://www.swpc.noaa.gov/)
- [NASA DONKI](https://kauai.ccmc.gsfc.nasa.gov/DONKI/)
- [Astronomy Engine](https://github.com/cosinekitty/astronomy)

## 💬 Communication

- **GitHub Discussions**: For questions and ideas
- **Issues**: For bugs and feature requests
- **Pull Requests**: For code contributions

## 📜 License

By contributing, you agree your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, helps make Solar Admiral better. Whether you're fixing a typo, optimizing performance, or adding groundbreaking physics calculations, we appreciate your time and effort!

---

**Special thanks to all contributors who make this project possible!** 🌟
