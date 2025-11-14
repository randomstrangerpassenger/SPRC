// src/i18n.ts
import { logger } from './services/Logger.ts';

type Lang = 'en' | 'ko';
type Replacements = Record<string, string | number>;

// 모든 문자열을 계층 구조로 정의합니다.
const locales = {
    // --- English Messages (from en.json) ---
    en: {
        toast: {
            dataReset: 'Data has been reset.',
            ratiosNormalized: 'Target ratios have been adjusted to 100%.',
            noRatiosToNormalize: 'No target ratios available for auto-adjustment.',
            saveSuccess: 'Portfolio saved successfully.',
            saveNoData: 'No data to save.',
            loadSuccess: 'Loaded saved data.',
            importSuccess: 'Data imported successfully.',
            importError: 'Error occurred while importing file.',
            portfolioCreated: "Portfolio '{name}' created.",
            portfolioRenamed: 'Portfolio name changed.',
            portfolioDeleted: 'Portfolio deleted.',
            lastPortfolioDeleteError: 'Cannot delete the last portfolio.',
            transactionAdded: 'Transaction added.',
            transactionDeleted: 'Transaction deleted.',
            chartError: 'Failed to visualize chart.',
            lastStockDeleteError: 'Cannot delete the last remaining stock.',
            transactionAddFailed: 'Failed to add transaction.',
            transactionDeleteFailed: 'Failed to delete transaction.',
            normalizeRatiosError: 'Error normalizing ratios.',
            calculateSuccess: 'Calculation complete!',
            noTickersToFetch: 'No tickers to fetch.',
            modeChanged: 'Mode changed to {mode} mode.',
            currencyChanged: 'Currency changed to {currency}.',
            invalidExchangeRate: 'Invalid exchange rate. Restoring default.',
            amountInputError: 'Amount input error.',
            invalidTransactionInfo: 'Invalid transaction information.',
            invalidFileType: 'Only JSON files can be imported.',
            exportSuccess: 'Data exported successfully.',
            exportError: 'Error exporting data.',
        },
        modal: {
            confirmResetTitle: 'Reset Data',
            confirmResetMsg:
                'Reset the current portfolio to the initial template? This action cannot be undone.',
            confirmDeletePortfolioTitle: 'Delete Portfolio',
            confirmDeletePortfolioMsg:
                "Are you sure you want to delete the '{name}' portfolio? This action cannot be undone.",
            confirmDeleteTransactionTitle: 'Delete Transaction',
            confirmDeleteTransactionMsg: 'Are you sure you want to delete this transaction?',
            confirmRatioSumWarnTitle: 'Confirm Target Ratios',
            confirmRatioSumWarnMsg:
                "The sum of target ratios is {totalRatio}%. Proceed with calculation even if it's not 100%?",
            promptNewPortfolioNameTitle: 'Create New Portfolio',
            promptNewPortfolioNameMsg: 'Enter the name for the new portfolio:',
            promptRenamePortfolioTitle: 'Rename Portfolio',
            promptRenamePortfolioMsg: 'Enter the new portfolio name:',
            confirmDeleteStockTitle: 'Delete Stock',
            confirmDeleteStockMsg: "Are you sure you want to delete '{name}'?",
            transactionTitle: 'Manage Transactions',
        },
        ui: {
            stockName: 'Name',
            ticker: 'Ticker',
            sector: 'Sector',
            quantity: 'Quantity',
            avgBuyPrice: 'Avg. Buy Price',
            currentValue: 'Current Value',
            profitLoss: 'P/L',
            profitLossRate: 'P/L Rate',
            fixedBuy: 'Fixed Buy',
            manage: 'Manage',
            delete: 'Delete',
            fetchingPrices: 'Fetching...',
            updateAllPrices: 'Update All Prices',
            buy: 'Buy',
            sell: 'Sell',
            buyWithIcon: '🔵 Buy',
            sellWithIcon: '🔴 Sell',
            krw: 'KRW',
            usd: '$',
            addMode: 'Add Mode',
            sellMode: 'Sell Rebalance',
            action: 'Action',
            // --- Added missing keys ---
            targetRatio: 'Target Ratio',
            currentPrice: 'Current Price',
            // --- Added missing keys ---
        },
        defaults: {
            defaultPortfolioName: 'Default Portfolio',
            newStock: 'New Stock',
            stock: 'Stock {n}',
            uncategorized: 'Uncategorized',
            unknownStock: 'this stock',
        },
        validation: {
            calculationError: 'Calculation error. Please check your inputs.',
            validationErrorPrefix: 'Please check your inputs: ',
            saveErrorGeneral: 'Error occurred while saving.',
            saveErrorQuota: 'Storage space insufficient. Please delete unnecessary portfolios.',
            saveErrorSecurity:
                'Cannot save data due to browser settings. Check cookie and site data settings.',
            calcErrorDecimal: 'Input value is too large or has an invalid format.',
            calcErrorType: 'Data format error occurred.',
            invalidFileStructure: 'The file structure is invalid or corrupted.',
            investmentAmountZero: '- Additional investment amount must be greater than 0.',
            currentAmountZero: '- Current amount must be greater than 0 to calculate rebalancing.',
            ratioSumNot100: '- Sum of target ratios must be 100%. (Current: {totalRatio}%)',
            invalidTransactionData: '- Please enter valid transaction date, quantity, and price.',
            fixedBuyAmountTooSmall:
                "- Fixed buy amount for '{name}' is less than the current price, cannot buy even 1 share.",
            invalidNumber: 'Not a valid number.',
            negativeNumber: 'Negative numbers are not allowed.',
            invalidDate: 'Please enter a valid date.',
            futureDate: 'Future dates are not allowed.',
            quantityZero: 'Quantity must be greater than 0.',
            priceZero: 'Price must be greater than 0.',
            nameMissing: '- Please enter the name for the unnamed stock.',
            tickerMissing: "- Please enter the ticker for '{name}'.",
            currentPriceZero: "- Current price for '{name}' must be greater than 0.",
            fixedBuyAmountZero: "- Fixed buy amount for '{name}' must be greater than 0.",
            fixedBuyTotalExceeds: '- Sum of fixed buy amounts exceeds the total investment amount.',
        },
        aria: {
            tickerInput: '{name} ticker input',
            sectorInput: '{name} sector input',
            targetRatioInput: '{name} target ratio input',
            currentPriceInput: '{name} current price input',
            fixedBuyToggle: 'Enable fixed buy amount',
            fixedBuyAmount: 'Fixed buy amount',
            manageTransactions: 'Manage transactions for {name}',
            deleteStock: 'Delete {name}',
            deleteTransaction: 'Delete transaction from {date}',
            resultsLoaded: 'Calculation results loaded.',
            // --- Added region labels ---
            resultsRegion: 'Calculation Results',
            sectorAnalysisRegion: 'Sector Analysis Results',
            chartRegion: 'Portfolio Visualization Chart',
            // --- Added region labels ---
        },
        view: {
            noTransactions: 'No transactions found.',
        },
        template: {
            currentTotalAsset: 'Current Total Assets',
            additionalInvestment: 'Additional Investment',
            finalTotalAsset: 'Total Assets After Investment',
            addModeGuideTitle: '📈 Additional Investment Allocation Guide (Sorted by Buy Amount)',
            stock: 'Stock',
            currentRatio: 'Current Ratio',
            targetRatio: 'Target Ratio',
            profitRate: 'Profit Rate',
            buyRecommendation: 'Recommended Buy Amount',
            buyGuideTitle: '💡 Buy Execution Guide',
            noItemsToBuy: 'No items to buy.',
            rebalancingTotal: 'Total Rebalancing Amount',
            sellModeGuideTitle: '⚖️ Rebalancing Guide (Sorted by Adjustment Amount)',
            adjustmentAmount: 'Adjustment Amount',
            sellItemsTitle: '🔴 Items to Sell',
            noItemsToSell: 'No items to sell.',
            buyItemsTitle: '🔵 Items to Buy (with proceeds from selling)',
            sectorAnalysisTitle: '🗂️ Sector Analysis',
            sector: 'Sector',
            amount: 'Amount',
            ratio: 'Ratio (%)',
            // --- Added captions ---
            sectorAnalysisCaption: 'Asset distribution by sector',
            addModeCaption: 'Recommended buys for additional investment',
            sellModeSellCaption: 'Items recommended for selling',
            sellModeBuyCaption: 'Items recommended for buying with proceeds',
            // --- Added captions ---
        },
        state: {
            noActivePortfolio: 'No active portfolio.',
            noPortfolioData: 'No portfolio data available.',
        },
        error: {
            cannotGetInputs: 'Could not retrieve calculation inputs.',
        },
        api: {
            fetchSuccessAll: '{count} stock prices updated.',
            fetchSuccessPartial: '{count} succeeded ({failed} failed)',
            fetchFailedAll:
                'Failed to load prices for all stocks ({failed}). Check API key or tickers.',
            noUpdates: 'No stocks to update.',
            fetchErrorGlobal: 'API call error: {message}',
        },
    },
    // --- Korean Messages (from i18n.js and ko.json) ---
    ko: {
        toast: {
            dataReset: '데이터가 초기화되었습니다.',
            ratiosNormalized: '목표 비율이 100%에 맞춰 조정되었습니다.',
            noRatiosToNormalize: '자동 조정을 위한 목표 비율이 없습니다.',
            saveSuccess: '포트폴리오가 저장되었습니다.',
            saveNoData: '저장할 데이터가 없습니다.',
            loadSuccess: '저장된 데이터를 불러왔습니다.',
            importSuccess: '데이터를 성공적으로 불러왔습니다.',
            importError: '파일을 불러오는 중 오류가 발생했습니다.',
            portfolioCreated: "포트폴리오 '{name}'이(가) 생성되었습니다.",
            portfolioRenamed: '포트폴리오 이름이 변경되었습니다.',
            portfolioDeleted: '포트폴리오가 삭제되었습니다.',
            lastPortfolioDeleteError: '마지막 포트폴리오는 삭제할 수 없습니다.',
            lastStockDeleteError: '마지막 남은 주식은 삭제할 수 없습니다.',
            transactionAdded: '거래 내역이 추가되었습니다.',
            transactionDeleted: '거래 내역이 삭제되었습니다.',
            transactionAddFailed: '거래 추가 실패.',
            transactionDeleteFailed: '거래 삭제 실패.',
            chartError: '차트 시각화에 실패했습니다.',
            normalizeRatiosError: '비율 정규화 중 오류 발생',
            calculateSuccess: '계산 완료!',
            noTickersToFetch: '가져올 티커가 없습니다.',
            modeChanged: '모드가 {mode} 모드로 변경되었습니다.',
            currencyChanged: '통화 기준이 {currency}로 변경되었습니다.',
            invalidExchangeRate: '유효하지 않은 환율입니다. 기본값으로 복원됩니다.',
            amountInputError: '금액 입력 오류.',
            invalidTransactionInfo: '거래 정보가 유효하지 않습니다.',
            invalidFileType: 'JSON 파일만 가져올 수 있습니다.',
            exportSuccess: '데이터를 성공적으로 내보냈습니다.',
            exportError: '데이터 내보내기 중 오류 발생.',
        },
        modal: {
            confirmResetTitle: '데이터 초기화',
            confirmResetMsg:
                '현재 포트폴리오를 초기 템플릿으로 되돌리시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            confirmDeletePortfolioTitle: '포트폴리오 삭제',
            confirmDeletePortfolioMsg:
                "정말로 '{name}' 포트폴리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
            confirmDeleteStockTitle: '종목 삭제',
            confirmDeleteStockMsg: "'{name}' 종목을 삭제하시겠습니까?",
            confirmDeleteTransactionTitle: '거래 내역 삭제',
            confirmDeleteTransactionMsg: '이 거래 내역을 정말로 삭제하시겠습니까?',
            confirmRatioSumWarnTitle: '목표 비율 확인',
            confirmRatioSumWarnMsg:
                '목표비율 합이 {totalRatio}%입니다. 100%가 아니어도 계산을 진행하시겠습니까?',
            promptNewPortfolioNameTitle: '새 포트폴리오 생성',
            promptNewPortfolioNameMsg: '새 포트폴리오의 이름을 입력하세요:',
            promptRenamePortfolioTitle: '이름 변경',
            promptRenamePortfolioMsg: '새로운 포트폴리오 이름을 입력하세요:',
            transactionTitle: '거래 내역 관리',
        },
        ui: {
            stockName: '종목명',
            ticker: '티커',
            sector: '섹터',
            quantity: '수량',
            avgBuyPrice: '평단가',
            currentValue: '현재 평가액',
            profitLoss: '평가 손익',
            profitLossRate: '수익률',
            fixedBuy: '고정 매수',
            manage: '거래',
            delete: '삭제',
            fetchingPrices: '가져오는 중...',
            updateAllPrices: '현재가 일괄 업데이트',
            buy: '매수',
            sell: '매도',
            buyWithIcon: '🔵 매수',
            sellWithIcon: '🔴 매도',
            krw: '원',
            usd: '$',
            addMode: '추가 매수',
            sellMode: '매도 리밸런싱',
            action: '작업',
            // --- Added missing keys ---
            targetRatio: '목표 비율',
            currentPrice: '현재가',
            // --- Added missing keys ---
        },
        defaults: {
            defaultPortfolioName: '기본 포트폴리오',
            newStock: '새 종목',
            stock: '{n}번 종목',
            uncategorized: '미분류',
            unknownStock: '해당 종목',
        },
        validation: {
            calculationError: '계산 중 오류가 발생했습니다. 입력값을 확인해주세요.',
            validationErrorPrefix: '입력값을 확인해주세요: ',
            saveErrorGeneral: '저장 중 오류가 발생했습니다.',
            saveErrorQuota: '저장 공간이 부족합니다. 불필요한 포트폴리오를 삭제해 주세요.',
            saveErrorSecurity:
                '브라우저 설정으로 인해 데이터를 저장할 수 없습니다. 쿠키 및 사이트 데이터 설정을 확인해주세요.',
            calcErrorDecimal: '입력값이 너무 크거나 잘못된 형식입니다.',
            calcErrorType: '데이터 형식 오류가 발생했습니다.',
            invalidFileStructure: '파일의 구조가 올바르지 않거나 손상되었습니다.',
            investmentAmountZero: '- 추가 투자 금액을 0보다 크게 입력해주세요.',
            currentAmountZero: '- 현재 금액이 0보다 커야 리밸런싱을 계산할 수 있습니다.',
            ratioSumNot100: '- 목표 비율의 합이 100%가 되어야 합니다. (현재: {totalRatio}%)',
            invalidTransactionData: '- 거래 날짜, 수량, 단가를 올바르게 입력해주세요.',
            fixedBuyAmountTooSmall:
                "- '{name}'의 고정 매수 금액이 현재가보다 작아 1주도 매수할 수 없습니다.",
            invalidNumber: '유효한 숫자가 아닙니다.',
            negativeNumber: '음수는 입력할 수 없습니다.',
            invalidDate: '유효한 날짜를 입력해주세요.',
            futureDate: '미래 날짜는 입력할 수 없습니다.',
            quantityZero: '수량은 0보다 커야 합니다.',
            priceZero: '단가는 0보다 커야 합니다.',
            nameMissing: '- 이름 없는 종목의 종목명을 입력해주세요.',
            tickerMissing: "- '{name}'의 티커를 입력해주세요.",
            currentPriceZero: "- '{name}'의 현재가는 0보다 커야 합니다.",
            fixedBuyAmountZero: "- '{name}'의 고정 매수 금액은 0보다 커야 합니다.",
            fixedBuyTotalExceeds: '- 고정 매수 금액의 합이 총 투자금을 초과합니다.',
        },
        aria: {
            tickerInput: '{name} 티커 입력',
            sectorInput: '{name} 섹터 입력',
            targetRatioInput: '{name} 목표 비율 입력',
            currentPriceInput: '{name} 현재가 입력',
            fixedBuyToggle: '고정 매수 활성화',
            fixedBuyAmount: '고정 매수 금액',
            manageTransactions: '{name} 거래 관리',
            deleteStock: '{name} 삭제',
            deleteTransaction: '{date} 거래 삭제',
            resultsLoaded: '계산 결과가 로드되었습니다.',
            // --- Added region labels ---
            resultsRegion: '계산 결과',
            sectorAnalysisRegion: '섹터별 분석 결과',
            chartRegion: '포트폴리오 시각화 차트',
            // --- Added region labels ---
        },
        view: {
            noTransactions: '거래 내역이 없습니다.',
        },
        template: {
            currentTotalAsset: '현재 총 자산',
            additionalInvestment: '추가 투자금',
            finalTotalAsset: '투자 후 총 자산',
            addModeGuideTitle: '📈 추가 투자 배분 가이드 (매수 금액순 정렬)',
            stock: '종목',
            currentRatio: '현재 비율',
            targetRatio: '목표 비율',
            profitRate: '수익률',
            buyRecommendation: '매수 추천 금액',
            buyGuideTitle: '💡 매수 실행 가이드',
            noItemsToBuy: '매수할 종목이 없습니다.',
            rebalancingTotal: '총 리밸런싱 금액',
            sellModeGuideTitle: '⚖️ 리밸런싱 가이드 (조정 금액순 정렬)',
            adjustmentAmount: '조정 금액',
            sellItemsTitle: '🔴 매도 항목',
            noItemsToSell: '매도할 종목이 없습니다.',
            buyItemsTitle: '🔵 매수 항목 (매도 자금으로)',
            sectorAnalysisTitle: '🗂️ 섹터별 분석',
            sector: '섹터',
            amount: '금액',
            ratio: '비중',
            // --- Added captions ---
            sectorAnalysisCaption: '섹터별 자산 분포',
            addModeCaption: '추가 매수 추천 결과',
            sellModeSellCaption: '매도 추천 항목',
            sellModeBuyCaption: '매수 추천 항목 (매도 자금)',
            // --- Added captions ---
        },
        state: {
            noActivePortfolio: '활성화된 포트폴리오가 없습니다.',
            noPortfolioData: '포트폴리오 데이터가 없습니다.',
        },
        error: {
            cannotGetInputs: '계산 입력값을 가져올 수 없습니다.',
        },
        api: {
            fetchSuccessAll: '{count}개 종목 업데이트 완료.',
            fetchSuccessPartial: '{count}개 성공 ({failed} 실패)',
            fetchFailedAll: '모든 종목({failed}) 가격 로딩 실패. API 키나 티커를 확인하세요.',
            noUpdates: '업데이트할 종목이 없습니다.',
            fetchErrorGlobal: 'API 호출 중 오류 발생: {message}',
        },
    },
};

/**
 * @description 브라우저 언어 설정을 감지하여 'en' 또는 'ko'를 반환합니다.
 */
function getBrowserLanguage(): Lang {
    const nav = navigator as unknown;
    const lang =
        (nav && typeof nav === 'object' && 'language' in nav ? nav.language : null) ||
        (nav && typeof nav === 'object' && 'userLanguage' in nav
            ? (nav as { userLanguage: string }).userLanguage
            : null);
    if (typeof lang === 'string' && lang.toLowerCase().startsWith('ko')) {
        return 'ko';
    }
    return 'en'; // 기본값
}

/**
 * @description localStorage에서 저장된 언어를 로드하거나 브라우저 언어 감지
 */
function getStoredLanguage(): Lang {
    const storedLang = localStorage.getItem('sprc_language');
    if (storedLang === 'ko' || storedLang === 'en') {
        return storedLang;
    }
    return getBrowserLanguage();
}

// 현재 언어 설정 (localStorage 우선, 없으면 브라우저 언어)
let currentLang: Lang = getStoredLanguage();
let messages: typeof locales.en | typeof locales.ko = locales[currentLang] || locales.en;

/**
 * @description 언어 변경 및 localStorage 저장
 */
export function setLanguage(newLang: Lang): void {
    if (newLang !== 'en' && newLang !== 'ko') {
        logger.warn(`Unsupported language: ${newLang}`, 'i18n');
        return;
    }
    currentLang = newLang;
    messages = locales[currentLang] || locales.en;
    localStorage.setItem('sprc_language', newLang);
    logger.info(`Language changed to ${newLang}`, 'i18n');
}

/**
 * @description 현재 언어 코드 반환
 */
export function getCurrentLanguage(): Lang {
    return currentLang;
}

/**
 * 키와 대체값을 기반으로 메시지 문자열을 반환합니다.
 */
export function t(key: string, replacements: Replacements = {}): string {
    const keys = key.split('.');
    let message: unknown = keys.reduce(
        (obj: unknown, k: string) =>
            obj && typeof obj === 'object' && k in obj ? (obj as Record<string, unknown>)[k] : key,
        messages as unknown
    );

    if (typeof message !== 'string') {
        message = keys.reduce(
            (obj: unknown, k: string) =>
                obj && typeof obj === 'object' && k in obj
                    ? (obj as Record<string, unknown>)[k]
                    : key,
            locales.en as unknown
        ); // Fallback to English
        if (typeof message !== 'string') {
            logger.warn(`Missing key in all locales: ${key}`, 'i18n');
            return key;
        }
    }

    return message.replace(/{(\w+)}/g, (match: string, placeholder: string) => {
        return replacements[placeholder] !== undefined ? String(replacements[placeholder]) : match;
    });
}
