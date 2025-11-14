// src/eventBinder/portfolioEvents.ts
import type { PortfolioView } from '../view';

/**
 * @description 포트폴리오 관리 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param signal - AbortController signal
 */
export function setupPortfolioEvents(view: PortfolioView, signal: AbortSignal): void {
    const dom = view.dom;

    // 포트폴리오 관리 버튼
    dom.newPortfolioBtn?.addEventListener('click', () => view.emit('newPortfolioClicked'), {
        signal,
    });
    dom.renamePortfolioBtn?.addEventListener('click', () => view.emit('renamePortfolioClicked'), {
        signal,
    });
    dom.deletePortfolioBtn?.addEventListener('click', () => view.emit('deletePortfolioClicked'), {
        signal,
    });
    dom.portfolioSelector?.addEventListener('change', (e) =>
        view.emit('portfolioSwitched', { newId: (e.target as HTMLSelectElement).value })
    );

    // 포트폴리오 설정 버튼
    dom.addNewStockBtn?.addEventListener('click', () => view.emit('addNewStockClicked'));
    dom.resetDataBtn?.addEventListener('click', () => view.emit('resetDataClicked'));
    dom.normalizeRatiosBtn?.addEventListener('click', () => view.emit('normalizeRatiosClicked'));
    dom.fetchAllPricesBtn?.addEventListener('click', () => view.emit('fetchAllPricesClicked'));

    // 템플릿 적용 버튼
    dom.applyTemplateBtn?.addEventListener('click', () => {
        const select = dom.allocationTemplateSelect as HTMLSelectElement | null;
        if (select && select.value) {
            view.emit('applyTemplateClicked', { template: select.value });
        }
    });
}
