# Portfolio Rebalancer - Architecture Documentation

## Overview

Portfolio Rebalancer is a production-grade web application for calculating optimal portfolio rebalancing strategies. Built with TypeScript, Vite, and modern web technologies, it follows enterprise-level architectural patterns for scalability, performance, and maintainability.

## Architecture Patterns

### Model-View-Controller (MVC)

- **Model (State)**: `src/state/` - Portfolio data, snapshots, repositories
- **View**: `src/view.ts` - DOM manipulation, rendering
- **Controller**: `src/controller.ts` + `src/controller/` - Business logic

### Command Pattern (Phase 4.3)

Controller pipeline uses Command Pattern:

\`\`\`
src/controller/commands/
├── ICommand.ts              # Command interface
├── CommandPipeline.ts       # Orchestration
├── CalculationCommand.ts
├── WarningAnalysisCommand.ts
└── PersistenceCommand.ts
\`\`\`

### Singleton Pattern

Services use singleton pattern:
- CacheManager
- Logger, ErrorHandler
- CalculatorWorkerService
- RebalanceWorkerService

## Core Systems

### 1. Calculation System

**Flow:**
\`\`\`
User → Controller → CalculatorWorkerService
  ├─> Worker → calculator.worker.ts (50-100ms)
  └─> Fallback → Calculator.ts (150-300ms)
\`\`\`

### 2. Rebalancing System (Phase 5.3)

**Strategies:**
- AddRebalanceStrategy
- SimpleRatioStrategy
- SellRebalanceStrategy

**Worker Integration:**
- rebalance.worker.ts (100-200ms improvement)

### 3. Cache System (Phase 4.4)

\`\`\`
CacheManager (Singleton)
  ├─> Namespace isolation
  ├─> LRU eviction
  └─> Statistics tracking
\`\`\`

## Performance Optimizations

### Phase 5 Results

**5.1 - Bundle Optimization:**
- ExcelJS (938KB), jsPDF (387KB), html2canvas (202KB) → Dynamic chunks
- Total: 1.5MB separated from main bundle

**5.2 - Parallel Processing:**
- Chart + Snapshot: 150ms → 100ms (33% faster)

**5.3 - Web Workers:**
- Rebalancing: 100-200ms improvement
- Progress indicators for UX

### Production Build

**Vite Config:**
- Minify: terser
- Drop console/debugger in production
- Manual chunking for optimal caching
- Source maps: hidden

## Error Handling (Phase 6.1)

\`\`\`
Global Error Handler
  ├─> Error tracking (threshold: 10)
  ├─> Resource loading errors
  ├─> Promise rejections
  └─> Monitoring integration
\`\`\`

## Web Vitals Monitoring (Phase 6.2)

Tracked metrics: LCP, FID, CLS, FCP, TTFB
Integration: PerformanceObserver API

## CI/CD (Phase 6.3)

**Workflows:**
- ci.yml: Build, test, lint (Node 18.x, 20.x)
- deploy.yml: Production deployment

## Technology Stack

- TypeScript 5.x, Vite 7.x
- Decimal.js
- Web Workers API
- IndexedDB, LocalStorage
- GitHub Actions

## Performance Metrics

### Bundle Sizes
| Asset | Size (Gzipped) |
|-------|----------------|
| Main | 53KB |
| Workers | ~35KB each |

### Runtime
| Operation | Before | After |
|-----------|--------|-------|
| Portfolio calc | 150ms | 50ms |
| Rebalancing | 300ms | 100ms |
| 1000 rows render | 500ms | 16ms |

---

**Last Updated**: 2025-11-15 (Phase 6)
**Version**: 2.0.0
