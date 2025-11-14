// src/eventBinder/tableEvents.ts
import type { PortfolioView } from '../view';
import { isInputElement } from '../utils';

/**
 * @description 포트폴리오 테이블 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param _signal - AbortController signal (reserved for future use)
 */
export function setupTableEvents(view: PortfolioView, _signal: AbortSignal): void {
    const dom = view.dom;

    // 포트폴리오 테이블 입력 처리
    dom.virtualScrollWrapper?.addEventListener('change', (e) =>
        view.emit('portfolioBodyChanged', e)
    );
    dom.virtualScrollWrapper?.addEventListener('click', (e) =>
        view.emit('portfolioBodyClicked', e)
    );

    // 포트폴리오 테이블 키보드 네비게이션
    const virtualScrollWrapper = dom.virtualScrollWrapper;
    virtualScrollWrapper?.addEventListener('keydown', (e) => {
        const target = e.target as HTMLElement;
        if (
            !target ||
            !target.matches('input[type="text"], input[type="number"], input[type="checkbox"]')
        )
            return;

        const currentRow = target.closest('div[data-id]');
        if (!currentRow?.dataset.id) return;
        const stockId = currentRow.dataset.id;
        const currentCell = target.closest('.virtual-cell');
        const currentCellIndex = currentCell
            ? Array.from(currentRow.children).indexOf(currentCell)
            : -1;
        const field = (target as HTMLInputElement).dataset.field;

        switch (e.key) {
            case 'Enter':
                if (field === 'ticker') {
                    e.preventDefault();
                    // 컨트롤러가 할 일(모달 열기)을 View에 이벤트로 알림
                    view.emit('manageStockClicked', { stockId });
                } else if (currentCellIndex !== -1 && currentRow instanceof HTMLDivElement) {
                    e.preventDefault();
                    const direction = e.shiftKey ? -1 : 1;
                    const nextCellIndex =
                        (currentCellIndex + direction + currentRow.children.length) %
                        currentRow.children.length;
                    const nextCell = currentRow.children[nextCellIndex];
                    const nextInput = nextCell?.querySelector('input') as HTMLElement | null;
                    nextInput?.focus();
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                const siblingRow =
                    e.key === 'ArrowUp'
                        ? currentRow.previousElementSibling?.previousElementSibling
                        : currentRow.nextElementSibling?.nextElementSibling;

                if (
                    siblingRow instanceof HTMLDivElement &&
                    siblingRow.matches('.virtual-row-inputs') &&
                    currentCellIndex !== -1
                ) {
                    const targetCell = siblingRow.children[currentCellIndex];
                    const targetInput = targetCell?.querySelector('input') as HTMLElement | null;
                    targetInput?.focus();
                }
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                if (
                    isInputElement(target) &&
                    (target.type !== 'text' ||
                        target.selectionStart ===
                            (e.key === 'ArrowLeft' ? 0 : target.value.length)) &&
                    currentRow instanceof HTMLDivElement
                ) {
                    e.preventDefault();
                    const direction = e.key === 'ArrowLeft' ? -1 : 1;
                    const nextCellIndex =
                        (currentCellIndex + direction + currentRow.children.length) %
                        currentRow.children.length;
                    const nextCell = currentRow.children[nextCellIndex];
                    const nextInput = nextCell?.querySelector('input') as HTMLElement | null;
                    nextInput?.focus();
                }
                break;
            case 'Delete':
                if (e.ctrlKey && field === 'name') {
                    e.preventDefault();
                    view.emit('deleteStockShortcut', { stockId });
                }
                break;
            case 'Escape':
                e.preventDefault();
                target.blur();
                break;
        }
    });

    // 숫자 입력 필드 포커스 시 전체 선택
    dom.virtualScrollWrapper?.addEventListener('focusin', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.tagName === 'INPUT' && target.type === 'number') {
            target.select();
        }
    });
}
