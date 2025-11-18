// src/eventBinder/rebalancingRulesEvents.ts
import { debounce, isInputElement } from '../utils';
import type { PortfolioView } from '../view';

/**
 * @description 리밸런싱 규칙 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param signal - AbortController signal
 */
export function setupRebalancingRulesEvents(view: PortfolioView, signal: AbortSignal): void {
    const dom = view.dom;

    // 리밸런싱 규칙 활성화 토글
    dom.rebalancingRulesEnabled?.addEventListener('change', (e) => {
        const enabled = (e.target as HTMLInputElement).checked;
        view.emit('rebalancingRulesEnabledChanged', { enabled });
    });

    // 밴드 퍼센티지 변경 (디바운스)
    const debouncedBandChange = debounce((value: number) => {
        view.emit('bandPercentageChanged', { value });
    }, 500);

    dom.bandPercentage?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = parseFloat(target.value);
        const isValid = !isNaN(value) && value >= 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) {
            debouncedBandChange(value);
        }
    });

    // 최소 거래 금액 변경 (디바운스)
    const debouncedMinTradeChange = debounce((value: number) => {
        view.emit('minTradeAmountChanged', { value });
    }, 500);

    dom.minTradeAmount?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = parseFloat(target.value);
        const isValid = !isNaN(value) && value >= 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) {
            debouncedMinTradeChange(value);
        }
    });

    // 종목 제한 추가 버튼
    dom.addStockLimitBtn?.addEventListener('click', () => {
        view.emit('addStockLimitClicked');
    });

    // 섹터 제한 추가 버튼
    dom.addSectorLimitBtn?.addEventListener('click', () => {
        view.emit('addSectorLimitClicked');
    });

    // 프리셋 불러오기 버튼
    dom.loadPresetBtn?.addEventListener('click', () => {
        const selector = dom.presetSelector as HTMLSelectElement;
        const presetId = selector?.value;
        if (presetId) {
            view.emit('loadPresetClicked', { presetId });
        }
    });

    // 프리셋 저장 버튼
    dom.savePresetBtn?.addEventListener('click', () => {
        view.emit('savePresetClicked');
    });

    // 프리셋 삭제 버튼
    dom.deletePresetBtn?.addEventListener('click', () => {
        const selector = dom.presetSelector as HTMLSelectElement;
        const presetId = selector?.value;
        if (presetId) {
            view.emit('deletePresetClicked', { presetId });
        }
    });

    // 종목 제한 및 섹터 제한 컨테이너의 삭제 버튼 처리 (이벤트 위임)
    dom.stockLimitsContainer?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('remove-stock-limit-btn')) {
            const index = parseInt(target.dataset.index || '-1', 10);
            if (index >= 0) {
                view.emit('removeStockLimitClicked', { index });
            }
        }
    });

    dom.sectorLimitsContainer?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('remove-sector-limit-btn')) {
            const index = parseInt(target.dataset.index || '-1', 10);
            if (index >= 0) {
                view.emit('removeSectorLimitClicked', { index });
            }
        }
    });

    // 종목/섹터 제한 값 변경 처리 (이벤트 위임)
    const debouncedStockLimitChange = debounce(() => {
        view.emit('stockLimitsChanged');
    }, 500);

    const debouncedSectorLimitChange = debounce(() => {
        view.emit('sectorLimitsChanged');
    }, 500);

    dom.stockLimitsContainer?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('stock-limit-input')) {
            debouncedStockLimitChange();
        }
    });

    dom.sectorLimitsContainer?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('sector-limit-input')) {
            debouncedSectorLimitChange();
        }
    });
}
