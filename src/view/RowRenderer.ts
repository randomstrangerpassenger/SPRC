// src/view/RowRenderer.ts
/**
 * @description 가상 스크롤 행 렌더링 로직
 */

import { formatCurrency, escapeHTML } from '../utils';
import { t } from '../i18n';
import Decimal from 'decimal.js';
import { DECIMAL_ZERO } from '../constants';
import type { CalculatedStock } from '../types';
import {
    createInput,
    createCheckbox,
    createButton,
    createCell,
    getGridTemplate,
} from './DOMHelpers';

/**
 * @description 주식 행 Fragment를 생성합니다.
 * @param stock - 계산된 주식 데이터
 * @param currency - 통화 모드
 * @param mainMode - 메인 모드
 * @returns DocumentFragment
 */
export function createStockRowFragment(
    stock: CalculatedStock,
    currency: 'krw' | 'usd',
    mainMode: 'add' | 'sell' | 'simple'
): DocumentFragment {
    const fragment = document.createDocumentFragment();

    // 1. 입력 행 (Inputs Row)
    const divInputs = document.createElement('div');
    divInputs.className = 'virtual-row-inputs';
    divInputs.dataset.id = stock.id;
    divInputs.setAttribute('role', 'row');
    divInputs.style.gridTemplateColumns = getGridTemplate(mainMode);

    const isMobile = window.innerWidth <= 768;

    // 컬럼 구성
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

    // 2. 출력 행 (Outputs Row)
    const divOutputs = document.createElement('div');
    divOutputs.className = 'virtual-row-outputs';
    divOutputs.dataset.id = stock.id;
    divOutputs.setAttribute('role', 'row');
    divOutputs.style.gridTemplateColumns = getGridTemplate(mainMode);

    const metrics = stock.calculated ?? {
        quantity: DECIMAL_ZERO,
        avgBuyPrice: DECIMAL_ZERO,
        currentAmount: DECIMAL_ZERO,
        profitLoss: DECIMAL_ZERO,
        profitLossRate: DECIMAL_ZERO,
    };

    const quantity =
        metrics.quantity instanceof Decimal ? metrics.quantity : new Decimal(metrics.quantity ?? 0);
    const avgBuyPrice =
        metrics.avgBuyPrice instanceof Decimal
            ? metrics.avgBuyPrice
            : new Decimal(metrics.avgBuyPrice ?? 0);
    const currentAmount =
        metrics.currentAmount instanceof Decimal
            ? metrics.currentAmount
            : new Decimal(metrics.currentAmount ?? 0);
    const profitLoss =
        metrics.profitLoss instanceof Decimal
            ? metrics.profitLoss
            : new Decimal(metrics.profitLoss ?? 0);
    const profitLossRate =
        metrics.profitLossRate instanceof Decimal
            ? metrics.profitLossRate
            : new Decimal(metrics.profitLossRate ?? 0);

    const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
    const profitSign = profitLoss.isPositive() ? '+' : '';

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
