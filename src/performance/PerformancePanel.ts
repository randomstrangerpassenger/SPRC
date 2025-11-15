// src/performance/PerformancePanel.ts
/**
 * @description 성능 모니터링 시각화 패널
 * - 개발자 도구처럼 성능 메트릭 표시
 * - 토글 가능한 플로팅 패널
 */

import { perfMonitor, type PerformanceMetric } from './PerformanceMonitor';
import { logger } from '../services/Logger';

export class PerformancePanel {
    #panelElement: HTMLDivElement | null = null;
    #isVisible: boolean = false;
    #refreshInterval: number | null = null;

    constructor() {
        this.createPanel();
        this.bindKeyboardShortcut();
    }

    /**
     * @description 패널 DOM 생성
     */
    private createPanel(): void {
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.className = 'performance-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 600px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.95);
            color: #0f0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border: 2px solid #0f0;
            border-radius: 8px;
            padding: 16px;
            z-index: 10000;
            display: none;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #0f0; padding-bottom: 8px;">
                <h3 style="margin: 0; color: #0ff;">⚡ Performance Monitor</h3>
                <button id="perf-panel-close" style="background: #f00; color: #fff; border: none; border-radius: 4px; padding: 4px 12px; cursor: pointer; font-size: 12px;">×</button>
            </div>

            <div style="margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                <button id="perf-refresh" class="perf-btn">🔄 Refresh</button>
                <button id="perf-clear" class="perf-btn">🗑️ Clear</button>
                <button id="perf-export" class="perf-btn">💾 Export</button>
                <select id="perf-category" style="background: #222; color: #0f0; border: 1px solid #0f0; border-radius: 4px; padding: 4px 8px; font-size: 12px;">
                    <option value="">All Categories</option>
                    <option value="calculation">Calculation</option>
                    <option value="rendering">Rendering</option>
                    <option value="api">API</option>
                    <option value="storage">Storage</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div id="perf-stats-container"></div>
            <div id="perf-slow-ops" style="margin-top: 16px;"></div>
        `;

        // 버튼 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .perf-btn {
                background: #0f0;
                color: #000;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: background 0.2s;
            }
            .perf-btn:hover {
                background: #0ff;
            }
            .perf-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 8px;
            }
            .perf-table th {
                background: #1a1a1a;
                color: #0ff;
                padding: 8px;
                text-align: left;
                border: 1px solid #0f0;
            }
            .perf-table td {
                padding: 6px 8px;
                border: 1px solid #333;
            }
            .perf-table tr:hover {
                background: #1a1a1a;
            }
            .perf-slow {
                color: #ff0;
                animation: blink 1s infinite;
            }
            @keyframes blink {
                0%, 50%, 100% { opacity: 1; }
                25%, 75% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(panel);
        this.#panelElement = panel;

        this.bindPanelEvents();
    }

    /**
     * @description 패널 이벤트 바인딩
     */
    private bindPanelEvents(): void {
        if (!this.#panelElement) return;

        const closeBtn = this.#panelElement.querySelector('#perf-panel-close');
        const refreshBtn = this.#panelElement.querySelector('#perf-refresh');
        const clearBtn = this.#panelElement.querySelector('#perf-clear');
        const exportBtn = this.#panelElement.querySelector('#perf-export');
        const categorySelect = this.#panelElement.querySelector(
            '#perf-category'
        ) as HTMLSelectElement;

        closeBtn?.addEventListener('click', () => this.hide());
        refreshBtn?.addEventListener('click', () => this.refresh());
        clearBtn?.addEventListener('click', () => {
            perfMonitor.clear();
            this.refresh();
        });
        exportBtn?.addEventListener('click', () => this.exportData());
        categorySelect?.addEventListener('change', () => this.refresh());
    }

    /**
     * @description 키보드 단축키 바인딩 (Ctrl+Shift+P)
     */
    private bindKeyboardShortcut(): void {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * @description 패널 표시
     */
    show(): void {
        if (!this.#panelElement) return;

        this.#panelElement.style.display = 'block';
        this.#isVisible = true;
        this.refresh();

        // 자동 새로고침 (5초마다)
        this.#refreshInterval = window.setInterval(() => {
            this.refresh();
        }, 5000);
    }

    /**
     * @description 패널 숨기기
     */
    hide(): void {
        if (!this.#panelElement) return;

        this.#panelElement.style.display = 'none';
        this.#isVisible = false;

        if (this.#refreshInterval) {
            clearInterval(this.#refreshInterval);
            this.#refreshInterval = null;
        }
    }

    /**
     * @description 패널 토글
     */
    toggle(): void {
        if (this.#isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * @description 데이터 새로고침
     */
    private refresh(): void {
        if (!this.#panelElement) return;

        const categorySelect = this.#panelElement.querySelector(
            '#perf-category'
        ) as HTMLSelectElement;
        const category = categorySelect?.value as PerformanceMetric['category'] | '';

        const stats = perfMonitor.getStats(undefined, category || undefined);
        const slowOps = perfMonitor.getSlowOperations(100);

        this.renderStats(stats);
        this.renderSlowOps(slowOps);
    }

    /**
     * @description 통계 렌더링
     */
    private renderStats(stats: any[]): void {
        const container = this.#panelElement?.querySelector('#perf-stats-container');
        if (!container) return;

        if (stats.length === 0) {
            container.innerHTML =
                '<div style="color: #666; text-align: center; padding: 20px;">No performance data yet</div>';
            return;
        }

        const tableHTML = `
            <table class="perf-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Avg (ms)</th>
                        <th>Min (ms)</th>
                        <th>Max (ms)</th>
                        <th>P95 (ms)</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats
                        .map(
                            (s) => `
                        <tr>
                            <td>${s.name}</td>
                            <td><span style="color: ${this.getCategoryColor(s.category)}">${s.category}</span></td>
                            <td>${s.count}</td>
                            <td>${s.avgDuration.toFixed(2)}</td>
                            <td>${s.minDuration.toFixed(2)}</td>
                            <td>${s.maxDuration.toFixed(2)}</td>
                            <td class="${s.p95Duration > 100 ? 'perf-slow' : ''}">${s.p95Duration.toFixed(2)}</td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    }

    /**
     * @description 느린 작업 렌더링
     */
    private renderSlowOps(slowOps: PerformanceMetric[]): void {
        const container = this.#panelElement?.querySelector('#perf-slow-ops');
        if (!container) return;

        if (slowOps.length === 0) {
            container.innerHTML = '';
            return;
        }

        const html = `
            <div style="border-top: 1px solid #0f0; padding-top: 12px;">
                <h4 style="color: #ff0; margin: 0 0 8px 0;">⚠️ Slow Operations (>100ms)</h4>
                <ul style="margin: 0; padding-left: 20px; color: #ff0;">
                    ${slowOps
                        .slice(0, 5)
                        .map(
                            (op) =>
                                `<li>${op.name} (${op.category}): ${op.duration.toFixed(2)}ms</li>`
                        )
                        .join('')}
                </ul>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * @description 카테고리별 색상
     */
    private getCategoryColor(category: string): string {
        const colors: Record<string, string> = {
            calculation: '#ff0',
            rendering: '#f0f',
            api: '#0ff',
            storage: '#f80',
            other: '#0f0',
        };
        return colors[category] || '#0f0';
    }

    /**
     * @description 데이터 내보내기
     */
    private exportData(): void {
        const data = perfMonitor.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        logger.info('Data exported', 'PerformancePanel');
    }
}

// 전역 인스턴스 (개발 모드에서만)
let perfPanel: PerformancePanel | null = null;

export function initPerformancePanel(): void {
    if (!perfPanel) {
        perfPanel = new PerformancePanel();
        logger.info('Initialized. Press Ctrl+Shift+P to toggle', 'PerformancePanel');
    }
}

export function getPerformancePanel(): PerformancePanel | null {
    return perfPanel;
}
