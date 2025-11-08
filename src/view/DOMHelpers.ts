// src/view/DOMHelpers.ts
/**
 * @description DOM 요소 생성을 위한 헬퍼 함수들
 */

import { t } from '../i18n';
import { escapeHTML } from '../utils';
import Decimal from 'decimal.js';
import { memoizeWithKey } from '../cache/memoization';

/**
 * @description Input 요소를 생성합니다.
 */
export function createInput(
    type: string,
    field: string,
    value: any,
    placeholder: string = '',
    disabled: boolean = false,
    ariaLabel: string = ''
): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type;
    input.dataset.field = field;

    let displayValue = '';
    if (value instanceof Decimal) {
        const decimalPlaces = field === 'fixedBuyAmount' ? 0 : 2;
        displayValue = value.toFixed(decimalPlaces);
    } else {
        const defaultValue =
            field === 'fixedBuyAmount'
                ? '0'
                : field === 'targetRatio' || field === 'currentPrice'
                  ? '0.00'
                  : '';
        displayValue = String(value ?? defaultValue);
    }

    input.value = displayValue;
    if (placeholder) input.placeholder = placeholder;
    input.disabled = disabled;
    if (ariaLabel) input.setAttribute('aria-label', ariaLabel);

    if (type === 'number') {
        input.min = '0';
        if (field === 'currentPrice' || field === 'fixedBuyAmount' || field === 'targetRatio')
            input.step = 'any';
    }
    if (type === 'text') {
        input.style.textAlign = 'center';
    }

    return input;
}

/**
 * @description Checkbox 요소를 생성합니다.
 */
export function createCheckbox(
    field: string,
    checked: boolean,
    ariaLabel: string = ''
): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.field = field;
    input.checked = checked;
    if (ariaLabel) input.setAttribute('aria-label', ariaLabel);
    return input;
}

/**
 * @description Button 요소를 생성합니다.
 */
export function createButton(
    action: string,
    text: string,
    ariaLabel: string = '',
    variant: string = 'grey'
): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'btn btn--small';
    button.dataset.action = action;
    button.dataset.variant = variant;
    button.textContent = text;
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
    return button;
}

/**
 * @description Cell 요소를 생성합니다.
 */
export function createCell(className: string = '', align: string = 'left'): HTMLDivElement {
    const cell = document.createElement('div');
    cell.className = `virtual-cell ${className} align-${align}`;
    return cell;
}

/**
 * @description Output Cell 요소를 생성합니다.
 */
export function createOutputCell(
    label: string,
    value: string,
    valueClass: string = ''
): HTMLDivElement {
    const cell = createCell('output-cell align-right');
    // XSS 방어: escapeHTML 적용
    cell.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
    return cell;
}

/**
 * @description 그리드 템플릿을 반환합니다 (반응형).
 * 메모이제이션 적용
 */
const _getGridTemplateImpl = (mainMode: 'add' | 'sell' | 'simple'): string => {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        if (mainMode === 'simple') {
            return '1.5fr 1fr 1fr 1fr 0.8fr';
        }
        return '1.5fr 1fr 1fr 1.2fr';
    } else {
        if (mainMode === 'add') {
            return '1.5fr 1fr 1fr 1fr 1fr 1.2fr 1.2fr';
        } else if (mainMode === 'simple') {
            return '2fr 1fr 1fr 1.5fr 1.2fr 0.8fr';
        } else {
            return '2fr 1fr 1fr 1fr 1fr 1.2fr';
        }
    }
};

// 메모이제이션 적용: 동일한 mainMode와 화면 크기에 대해 캐시된 결과 반환
export const getGridTemplate = memoizeWithKey(
    _getGridTemplateImpl,
    (mainMode) => `${mainMode}:${window.innerWidth <= 768}`,
    6 // 캐시 크기: add/sell/simple × mobile/desktop = 6가지 조합
);