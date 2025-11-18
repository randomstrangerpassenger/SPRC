// src/view/DOMHelpers.ts
/**
 * @description Helper functions for creating DOM elements
 */

import { t } from '../i18n';
import { escapeHTML } from '../utils';
import Decimal from 'decimal.js';
import { memoizeWithKey } from '../cache/memoization';

/**
 * @description Create an input element
 */
export function createInput(
    type: string,
    field: string,
    value: string | number | boolean | Decimal | undefined,
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
 * @description Create a checkbox element
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
 * @description Create a select dropdown element
 */
export function createSelect(
    field: string,
    options: Array<{ value: string; label: string }>,
    selectedValue: string | undefined,
    placeholder: string = '',
    ariaLabel: string = ''
): HTMLSelectElement {
    const select = document.createElement('select');
    select.dataset.field = field;
    if (ariaLabel) select.setAttribute('aria-label', ariaLabel);

    // Add placeholder option
    if (placeholder) {
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholder;
        placeholderOption.disabled = true;
        placeholderOption.selected = !selectedValue;
        select.appendChild(placeholderOption);
    }

    // Add options
    options.forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        option.selected = selectedValue === value;
        select.appendChild(option);
    });

    return select;
}

/**
 * @description Create a button element
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
 * @description Create a cell element
 */
export function createCell(className: string = '', align: string = 'left'): HTMLDivElement {
    const cell = document.createElement('div');
    cell.className = `virtual-cell ${className} align-${align}`;
    return cell;
}

/**
 * @description Create an output cell element
 */
export function createOutputCell(
    label: string,
    value: string,
    valueClass: string = ''
): HTMLDivElement {
    const cell = createCell('output-cell align-right');
    // XSS protection: apply escapeHTML
    cell.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
    return cell;
}

/**
 * @description Return grid template (responsive)
 * Memoization applied
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
            // 종목명, 티커, 섹터, 자산유형, 국가, 목표비율, 현재가, 고정매수, 액션
            return '1.5fr 0.9fr 0.9fr 0.8fr 0.8fr 0.9fr 0.9fr 1fr 1fr';
        } else if (mainMode === 'simple') {
            return '2fr 1fr 1fr 1.5fr 1.2fr 0.8fr';
        } else {
            // 종목명, 티커, 섹터, 자산유형, 국가, 목표비율, 현재가, 액션
            return '1.8fr 1fr 1fr 0.9fr 0.9fr 1fr 1fr 1fr';
        }
    }
};

// Memoization applied: return cached result for same mainMode and screen size
export const getGridTemplate = memoizeWithKey(
    _getGridTemplateImpl,
    (mainMode) => `${mainMode}:${window.innerWidth <= 768}`,
    6 // Cache size: add/sell/simple × mobile/desktop = 6 combinations
);
