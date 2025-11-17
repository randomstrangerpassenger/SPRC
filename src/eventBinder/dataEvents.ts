// src/eventBinder/dataEvents.ts
import type { PortfolioView } from '../view';

/**
 * @description 데이터 관리 (export/import) 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param signal - AbortController signal
 */
export function setupDataEvents(view: PortfolioView, signal: AbortSignal): void {
    const dom = view.dom;

    // 데이터 관리 드롭다운
    const dataManagementBtn = dom.dataManagementBtn as HTMLButtonElement | null;
    const dataDropdownContent = dom.dataDropdownContent;
    const exportDataBtn = dom.exportDataBtn as HTMLAnchorElement | null;
    const importDataBtn = dom.importDataBtn as HTMLAnchorElement | null;
    const importFileInput = dom.importFileInput as HTMLInputElement | null;
    const importTransactionsBtn = dom.importTransactionsBtn as HTMLAnchorElement | null;
    const importTransactionFileInput = dom.importTransactionFileInput as HTMLInputElement | null;
    const dropdownItems = dataDropdownContent?.querySelectorAll('a[role="menuitem"]') ?? [];

    const toggleDropdown = (show: boolean): void => {
        if (dataDropdownContent && dataManagementBtn) {
            dataDropdownContent.classList.toggle('show', show);
            dataManagementBtn.setAttribute('aria-expanded', String(show));
        }
    };

    dataManagementBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = dataManagementBtn.getAttribute('aria-expanded') === 'true';
        toggleDropdown(!isExpanded);
        if (!isExpanded && dropdownItems.length > 0) {
            (dropdownItems[0] as HTMLElement).focus();
        }
    });

    dataDropdownContent?.addEventListener('keydown', (e) => {
        const target = e.target as HTMLElement;
        const currentIndex = Array.from(dropdownItems).indexOf(target);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % dropdownItems.length;
                (dropdownItems[nextIndex] as HTMLElement).focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + dropdownItems.length) % dropdownItems.length;
                (dropdownItems[prevIndex] as HTMLElement).focus();
                break;
            case 'Escape':
                toggleDropdown(false);
                dataManagementBtn?.focus();
                break;
            case 'Tab':
                toggleDropdown(false);
                break;
        }
    });

    exportDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        view.emit('exportDataClicked');
        toggleDropdown(false);
    });

    importDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        importFileInput?.click();
        toggleDropdown(false);
    });

    importFileInput?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            view.emit('importDataFileSelected', { file });
            target.value = '';
        }
        toggleDropdown(false);
    });

    importTransactionsBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        importTransactionFileInput?.click();
        toggleDropdown(false);
    });

    importTransactionFileInput?.addEventListener('change', (e) => {
        view.emit('importTransactionFileSelected', e);
        toggleDropdown(false);
    });

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener(
        'click',
        (e) => {
            if (!dataManagementBtn?.contains(e.target as Node)) {
                toggleDropdown(false);
            }
        },
        { signal }
    );
}
