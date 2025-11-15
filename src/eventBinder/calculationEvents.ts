// src/eventBinder/calculationEvents.ts
import { debounce, isInputElement } from '../utils';
import type { PortfolioView } from '../view';

/**
 * @description 계산 및 설정 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param signal - AbortController signal
 */
export function setupCalculationEvents(view: PortfolioView, signal: AbortSignal): void {
    const dom = view.dom;

    // 계산 버튼
    dom.calculateBtn?.addEventListener('click', () => view.emit('calculateClicked'));
    dom.calculateBtn?.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            view.emit('calculateClicked');
        }
    });

    // 성과 히스토리 버튼
    dom.showPerformanceHistoryBtn?.addEventListener('click', () =>
        view.emit('showPerformanceHistoryClicked')
    );
    dom.showSnapshotListBtn?.addEventListener('click', () => view.emit('showSnapshotListClicked'));

    // 계산/통화 모드 라디오 버튼
    dom.mainModeSelector?.forEach((r) =>
        r.addEventListener('change', (e) => {
            const mode = (e.target as HTMLInputElement).value as 'add' | 'sell' | 'simple';
            view.emit('mainModeChanged', { mode });
        })
    );
    dom.currencyModeSelector?.forEach((r) =>
        r.addEventListener('change', (e) => {
            const currency = (e.target as HTMLInputElement).value as 'krw' | 'usd';
            view.emit('currencyModeChanged', { currency });
        })
    );

    // 추가 투자금액 입력 및 환율 변환
    const debouncedConversion = debounce(
        (source: 'krw' | 'usd') => view.emit('currencyConversion', { source }),
        300
    );
    dom.additionalAmountInput?.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput?.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) debouncedConversion('krw');
    });

    // 추가 투자금액 관련 필드 Enter 키 처리
    const handleEnterKey = (e: KeyboardEvent): void => {
        const target = e.target;
        if (e.key === 'Enter' && !(isInputElement(target) && target.isComposing)) {
            e.preventDefault();
            view.emit('calculateClicked');
        }
    };
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // 포트폴리오 환율 설정
    dom.portfolioExchangeRateInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) {
            // 두 환율 입력란 동기화
            if (isInputElement(dom.exchangeRateInput)) {
                dom.exchangeRateInput.value = target.value;
            }
            // 포트폴리오 설정 업데이트
            view.emit('portfolioExchangeRateChanged', { rate });
            // 추가 투자금 재계산 (USD 모드인 경우)
            debouncedConversion('krw');
        }
    });

    // 리밸런싱 허용 오차 설정
    dom.rebalancingToleranceInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const tolerance = parseFloat(target.value);
        const isValid = !isNaN(tolerance) && tolerance >= 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) {
            view.emit('rebalancingToleranceChanged', { tolerance });
        }
    });

    // 추가 투자금 섹션의 환율 변경 시 포트폴리오 환율과 동기화
    const originalExchangeRateHandler = dom.exchangeRateInput;
    if (originalExchangeRateHandler) {
        originalExchangeRateHandler.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const rate = parseFloat(target.value);
            if (!isNaN(rate) && rate > 0) {
                // 포트폴리오 환율 입력란과 동기화
                if (isInputElement(dom.portfolioExchangeRateInput)) {
                    dom.portfolioExchangeRateInput.value = target.value;
                }
                // 포트폴리오 설정 업데이트
                view.emit('portfolioExchangeRateChanged', { rate });
            }
        });
    }

    // 다크 모드 토글
    dom.darkModeToggle?.addEventListener('click', () => view.emit('darkModeToggleClicked'));

    // 페이지 언로드 시 데이터 저장
    window.addEventListener(
        'beforeunload',
        () => {
            view.emit('pageUnloading');
        },
        { signal }
    );
}
