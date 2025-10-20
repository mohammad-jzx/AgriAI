# 🌿 Disease Analysis Module - تحليل الأمراض الذكي

A futuristic, accessible, and animated disease analysis module for the AgriAI React application.

## 🎨 Design Features

### Visual Design
- **Dark-first glassmorphism** with light mode support
- **Animated background** with grid particles and parallax effects
- **Neon-lime glow accents** (#22C55E primary green)
- **Glass cards** with backdrop-blur and gradient borders
- **Smooth animations** with micro-interactions
- **RTL/LTR support** for Arabic and English

### UI Components
- **BackgroundFX**: GPU-optimized animated grid with interactive particles
- **StatusPill**: Real-time connection status with color-coded indicators
- **GlowButton**: Interactive buttons with glow effects and keyboard shortcuts
- **SkeletonPanel**: Beautiful loading state with shimmer animation
- **ErrorPanel**: Elegant error state with retry functionality
- **FrameShell**: Smart iframe container with state management
- **AnalysisToolbar**: Comprehensive control panel with all actions
- **A11yBar**: Floating accessibility controls panel

## ♿ Accessibility (WCAG AA+)

- **Keyboard navigation** with visible focus rings (4px glow)
- **Screen reader support** with proper ARIA labels
- **High contrast mode** with 7:1 contrast ratio
- **Font size controls** (small/medium/large)
- **Keyboard shortcuts** (Alt+R, Alt+F, Alt+O, Alt+C)
- **Tab order** optimized for logical navigation
- **Reduced motion** support for animations

### Keyboard Shortcuts
- `Alt + R` - Refresh analyzer
- `Alt + F` - Toggle fullscreen
- `Alt + O` - Open in external window
- `Alt + C` - Copy link to clipboard
- `Alt + 1/2/3` - Switch between sources
- `ESC` - Exit fullscreen

## 🧩 Module Structure

```
src/modules/disease-analysis/
├── components/
│   ├── AnalysisToolbar.tsx      # Control panel with all actions
│   ├── BackgroundFX.tsx         # Animated grid/particles
│   ├── StatusPill.tsx           # Connection status indicator
│   ├── GlowButton.tsx           # Interactive button component
│   ├── SkeletonPanel.tsx        # Loading state UI
│   ├── ErrorPanel.tsx           # Error state with recovery
│   ├── A11yBar.tsx              # Accessibility controls
│   └── FrameShell.tsx           # Iframe container with states
├── pages/
│   └── DiseaseAnalysisPage.tsx  # Main page component
├── hooks/
│   ├── useIframeStatus.ts       # Health check & status management
│   └── useHotkeys.ts            # Keyboard shortcuts handler
├── assets/lottie/
│   ├── voiceWave.json           # Voice animation (placeholder)
│   └── particles.json           # Particle animation (placeholder)
├── styles/
│   └── analysis.css             # Module-specific styles
├── config.ts                    # Configuration & sources
└── index.ts                     # Module exports
```

## 🔧 Configuration

### Analysis Sources

Edit `src/modules/disease-analysis/config.ts`:

```typescript
export const ANALYSIS_SOURCES: AnalysisSource[] = [
  {
    id: 'main',
    name: 'المحلل الأساسي',
    src: '/cnn/index.html',           // ⚠️ UPDATE THIS
    healthUrl: undefined               // Optional health check endpoint
  },
  {
    id: 'backup',
    name: 'المحلل الاحتياطي',
    src: '/cnn/index.html'            // ⚠️ UPDATE THIS
  }
];
```

## 🚀 Features

### Smart Iframe Management
- **Automatic health checks** with configurable timeout (3.5s default)
- **State machine**: checking → loading → online/offline/error
- **Graceful fallbacks** with skeleton and error panels
- **Loading indicators** with spinner overlay
- **Fullscreen API** integration with ESC key support

### Toolbar Actions
- **Refresh** - Reload the analyzer iframe
- **Fullscreen** - Toggle fullscreen mode
- **Open External** - Open in new browser tab
- **Copy Link** - Copy URL to clipboard
- **Source Selector** - Switch between multiple analysis sources
- **Contrast Toggle** - High contrast mode

### Responsive Design
- Mobile-first approach (≥320px)
- Tablet optimized (≥768px)
- Desktop enhanced (≥1440px)
- Toolbar collapses to icon-only on small screens
- Touch-friendly targets (min 44x44px)

## 🎯 Usage

### Integration in App.tsx

The module is already integrated into the main application:

```tsx
// 1. Import lazy loaded
const DiseaseAnalysisPage = React.lazy(() =>
  import('./modules/disease-analysis').then(m => ({ default: m.DiseaseAnalysisPage }))
);

// 2. Add to navigation
{ id: 'disease-analysis', label: 'تحليل الأمراض الذكي', icon: <TestTube /> }

// 3. Render in tab content
{activeTab === 'disease-analysis' && (
  <div className="w-full -m-6">
    <React.Suspense fallback={<div>جارٍ التحميل...</div>}>
      <DiseaseAnalysisPage />
    </React.Suspense>
  </div>
)}
```

## 🎨 Theming

### Color Palette
- **Primary**: #22C55E (green-500) - Success, online status
- **Secondary**: #2563EB (blue-600) - Loading, info
- **Accent**: Neon-lime glow effects
- **Surface**: Glass with backdrop-blur
- **Text**: Dark #0B1220 / Light #F8FAFC

### Dark Mode
Automatically switches based on system preference or user toggle. All components support dark mode with proper contrast ratios.

## 🧪 Testing Checklist

- ✅ Pixel-perfect glassmorphism design
- ✅ Loading → Online transition < 600ms
- ✅ All keyboard shortcuts functional
- ✅ High contrast mode ≥7:1 ratio
- ✅ Responsive 320px to 1440px+
- ✅ No console errors
- ✅ Reduced motion support
- ✅ Screen reader compatible
- ✅ Touch-friendly on mobile
- ✅ Fullscreen mode works correctly

## 📝 Bilingual Copy

### Arabic (Default)
```
Title: تحليل أمراض النباتات
Subtitle: شغّل محرّك الذكاء الاصطناعي لفحص الأوراق والصور الحقلية
Error: الخدمة غير متصلة حاليًا. تأكد من تشغيل الخادم
```

### English
```
Title: Plant Disease Analysis
Subtitle: Run AI engine to analyze leaves and field images
Error: Service is currently offline. Please check the server
```

## 🔒 Security & Privacy

- All data processed locally (no external servers by default)
- Configurable sandbox for iframe isolation
- No tracking or analytics
- User privacy respected

## 🚧 Backend Integration

To connect to your disease analysis backend:

1. Update `ANALYSIS_SOURCES` in `config.ts`
2. Set proper iframe `src` URL
3. Optional: Add `healthUrl` for status checks
4. Configure CORS if needed
5. Update `allow` and `sandbox` attributes in FrameShell

## 📦 Dependencies

All dependencies are from the existing project:
- React 18.2+
- TypeScript 5.0+
- Tailwind CSS 3.3+
- Lucide React (icons)
- No additional packages required

## 🎓 Development Notes

- Component isolation: Each component is self-contained
- Performance: GPU-optimized animations
- Code splitting: Lazy loaded module
- Type safety: Full TypeScript coverage
- Clean code: No magic numbers, proper naming
- Comments: Where logic is complex

## 📄 License

Part of AgriAI project - All rights reserved

---

**Built with ❤️ for AgriAI - Smart Agricultural Intelligence**
