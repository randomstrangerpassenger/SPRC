// src/view/RowRenderer.ts
/**
 * @description Virtual scroll row rendering logic
 */

import { formatCurrency, escapeHTML } from '../utils';
import { toNumber } from '../utils/converterUtil';
import { t } from '../i18n';
import Decimal from 'decimal.js';
import type { CalculatedStock } from '../types';
import {
    createInput,
    createCheckbox,
    createButton,
    createCell,
    createSelect,
    getGridTemplate,
} from './DOMHelpers';

/**
 * @description Create stock row fragment
 * @param stock - Calculated stock data
 * @param currency - Currency mode
 * @param mainMode - Main mode
 * @returns DocumentFragment
 */
export function createStockRowFragment(
    stock: CalculatedStock,
    currency: 'krw' | 'usd',
    mainMode: 'add' | 'sell' | 'simple'
): DocumentFragment {
    const fragment = document.createDocumentFragment();

    // 1. Inputs Row
    const divInputs = document.createElement('div');
    divInputs.className = 'virtual-row-inputs';
    divInputs.dataset.id = stock.id;
    divInputs.setAttribute('role', 'row');
    divInputs.style.gridTemplateColumns = getGridTemplate(mainMode);

    const isMobile = window.innerWidth <= 768;

    // Column configuration
    divInputs
        .appendChild(createCell())
        .appendChild(createInput('text', 'name', stock.name, t('ui.stockName')));
    divInputs
        .appendChild(createCell())
        .appendChild(
            createInput(
                'text',
                'ticker',
                stock.ticker,
                t('ui.ticker'),
                false,
                t('aria.tickerInput', { name: stock.name })
            )
        );

    if (mainMode !== 'simple' && !isMobile) {
        divInputs
            .appendChild(createCell())
            .appendChild(
                createInput(
                    'text',
                    'sector',
                    stock.sector || '',
                    t('ui.sector'),
                    false,
                    t('aria.sectorInput', { name: stock.name })
                )
            );

        // Asset Type dropdown
        const assetTypeOptions = [
            { value: 'stock', label: '주식' },
            { value: 'bond', label: '채권' },
            { value: 'cash', label: '현금' },
            { value: 'etf', label: 'ETF' },
            { value: 'other', label: '기타' },
        ];
        divInputs
            .appendChild(createCell())
            .appendChild(
                createSelect(
                    'assetType',
                    assetTypeOptions,
                    stock.assetType,
                    '자산 유형',
                    `${stock.name} 자산 유형`
                )
            );

        // Country input
        divInputs
            .appendChild(createCell())
            .appendChild(
                createInput(
                    'text',
                    'country',
                    stock.country || '',
                    '국가',
                    false,
                    `${stock.name} 국가`
                )
            );
    }

    divInputs
        .appendChild(createCell('align-right'))
        .appendChild(
            createInput(
                'number',
                'targetRatio',
                stock.targetRatio,
                '0.00',
                false,
                t('aria.targetRatioInput', { name: stock.name })
            )
        );

    if (!isMobile && mainMode !== 'simple') {
        divInputs
            .appendChild(createCell('align-right'))
            .appendChild(
                createInput(
                    'number',
                    'currentPrice',
                    stock.currentPrice,
                    '0.00',
                    false,
                    t('aria.currentPriceInput', { name: stock.name })
                )
            );
    }

    if (mainMode === 'simple') {
        const amountCell = createCell('align-right');
        const manualAmountInput = createInput(
            'number',
            'manualAmount',
            stock.manualAmount || 0,
            '현재 보유 금액 입력',
            false,
            `${stock.name} 보유 금액`
        );
        manualAmountInput.style.width = '100%';
        manualAmountInput.style.textAlign = 'right';
        amountCell.appendChild(manualAmountInput);
        divInputs.appendChild(amountCell);

        if (!isMobile) {
            const fixedBuyCell = createCell('align-center');
            const checkbox = createCheckbox(
                'isFixedBuyEnabled',
                stock.isFixedBuyEnabled,
                t('aria.fixedBuyToggle', { name: stock.name })
            );
            const amountInput = createInput(
                'number',
                'fixedBuyAmount',
                stock.fixedBuyAmount,
                '0',
                !stock.isFixedBuyEnabled,
                t('aria.fixedBuyAmount', { name: stock.name })
            );
            amountInput.style.width = '80px';
            fixedBuyCell.append(checkbox, ' ', amountInput);
            divInputs.appendChild(fixedBuyCell);
        }

        const deleteCell = createCell('align-center');
        deleteCell.appendChild(
            createButton(
                'delete',
                t('ui.delete'),
                t('aria.deleteStock', { name: stock.name }),
                'delete'
            )
        );
        divInputs.appendChild(deleteCell);
    } else {
        if (mainMode === 'add' && !isMobile) {
            const fixedBuyCell = createCell('align-center');
            const checkbox = createCheckbox(
                'isFixedBuyEnabled',
                stock.isFixedBuyEnabled,
                t('aria.fixedBuyToggle', { name: stock.name })
            );
            const amountInput = createInput(
                'number',
                'fixedBuyAmount',
                stock.fixedBuyAmount,
                '0',
                !stock.isFixedBuyEnabled,
                t('aria.fixedBuyAmount', { name: stock.name })
            );
            amountInput.style.width = '80px';
            fixedBuyCell.append(checkbox, ' ', amountInput);
            divInputs.appendChild(fixedBuyCell);
        }

        const actionCell = createCell('align-center');
        actionCell.append(
            createButton(
                'manage',
                t('ui.manage'),
                t('aria.manageTransactions', { name: stock.name }),
                'blue'
            ),
            ' ',
            createButton(
                'delete',
                t('ui.delete'),
                t('aria.deleteStock', { name: stock.name }),
                'delete'
            )
        );
        divInputs.appendChild(actionCell);
    }

    // 2. Outputs Row
    const divOutputs = document.createElement('div');
    divOutputs.className = 'virtual-row-outputs';
    divOutputs.dataset.id = stock.id;
    divOutputs.setAttribute('role', 'row');
    divOutputs.style.gridTemplateColumns = getGridTemplate(mainMode);

    const metrics = stock.calculated ?? {
        quantity: 0,
        avgBuyPrice: 0,
        currentAmount: 0,
        profitLoss: 0,
        profitLossRate: 0,
    };

    // Convert Decimal to native number
    const quantity = toNumber(metrics.quantity);
    const avgBuyPrice = toNumber(metrics.avgBuyPrice);
    const currentAmount = toNumber(metrics.currentAmount);
    const profitLoss = toNumber(metrics.profitLoss);
    const profitLossRate = toNumber(metrics.profitLossRate);

    const profitClass = profitLoss < 0 ? 'text-sell' : 'text-buy';
    const profitSign = profitLoss > 0 ? '+' : '';

    const createOutputCell = (
        label: string,
        value: string,
        valueClass: string = ''
    ): HTMLDivElement => {
        const cell = createCell('output-cell align-right');
        cell.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
        return cell;
    };

    const firstCell = createCell();
    firstCell.style.gridColumn = 'span 1';
    divOutputs.appendChild(firstCell);

    if (mainMode === 'simple') {
        divOutputs.style.display = 'none';
    } else {
        divOutputs.appendChild(createOutputCell(t('ui.quantity'), quantity.toFixed(0)));
        if (!isMobile) {
            divOutputs.appendChild(
                createOutputCell(t('ui.avgBuyPrice'), formatCurrency(avgBuyPrice, currency))
            );
        }
        divOutputs.appendChild(
            createOutputCell(t('ui.currentValue'), formatCurrency(currentAmount, currency))
        );
        if (!isMobile) {
            divOutputs.appendChild(
                createOutputCell(
                    t('ui.profitLoss'),
                    `${profitSign}${formatCurrency(profitLoss, currency)}`,
                    profitClass
                )
            );
        }
        divOutputs.appendChild(
            createOutputCell(
                t('ui.profitLossRate'),
                `${profitSign}${profitLossRate.toFixed(2)}%`,
                profitClass
            )
        );
    }

    const lastCell = createCell();
    divOutputs.appendChild(lastCell);

    fragment.append(divInputs, divOutputs);
    return fragment;
}
