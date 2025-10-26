// @ts-check
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Calculator } from './calculator.js';
import { Validator } from './validator.js';
import { debounce, formatCurrency } from './utils.js';
import { CONFIG } from './constants.js';
import { ErrorService } from './errorService.js';
import { t } from './i18n.js';
import Decimal from 'decimal.js'; // 동기 임포트로 복구

/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */
/** @typedef {import('./types.js').Portfolio} Portfolio */
/** @typedef {import('./types.js').ValidationErrorDetail} ValidationErrorDetail */

export class PortfolioController {
    /** @type {PortfolioState} */
    state;
    /** @type {PortfolioView} */
    view;
    /** @type {Function} */
    debouncedSave;
    /** @type {string | null} */
    #lastCalculationKey = null;

    /**
     * @param {PortfolioState} state
     * @param {PortfolioView} view
     */
    constructor(state, view) {
        this.state = state;
        this.view = view;
        // Debounce state saving
        this.debouncedSave = debounce(() => this.state.saveActivePortfolio(), 500);
        
        // Initial setup
        this.setupInitialUI();
    }

    // --- 초기 설정 ---

    setupInitialUI() {
        // 다크 모드 초기 반영 (UX 세부 개선 반영)
        if (localStorage.getItem(CONFIG.DARK_MODE_KEY) === 'true') {
            document.body.classList.add('dark-mode');
        }

        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio) {
            this.view.initializePortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.setCurrencyMode(activePortfolio.settings.currentCurrency);
            this.view.setMainMode(activePortfolio.settings.mainMode);
            this.view.updateExchangeRate(activePortfolio.settings.exchangeRate);
            this.view.updateAdditionalAmount(activePortfolio.settings.additionalInvestment || 0, activePortfolio.settings.currentCurrency);

            this.fullRender();
        }
    }

    // --- UI 렌더링 ---

    /**
     * @description 전체 UI를 렌더링하고 상태를 갱신합니다.
     */
    fullRender() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // 1. 계산된 상태 가져오기 (캐시 활용)
        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        
        // 2. 테이블 렌더링
        this.view.renderTable({
            portfolioData: calculatedState.portfolioData,
            currentTotal: calculatedState.currentTotal,
            currentCurrency: activePortfolio.settings.currentCurrency,
            mainMode: activePortfolio.settings.mainMode
        });

        // 3. 비율 합계 업데이트
        const ratioSum = this.state.getRatioSum(); // 동기 호출
        this.view.updateRatioSum(ratioSum.toNumber());

        // 4. 섹터 분석 업데이트
        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.renderSectorAnalysis(sectorData, activePortfolio.settings.currentCurrency);

        // 5. 활성 모드에 따라 추가 투자금 입력 필드 상태 업데이트
        this.view.toggleAdditionalAmountInputs(activePortfolio.settings.mainMode === 'add');
        
        // 6. 계산된 상태 저장 (결과 뷰에 사용하기 위해)
        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    /**
     * @description 인풋 변경 시 UI 상태를 업데이트합니다. (debounce 됨)
     */
    updateUIState() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // 1. 계산된 상태 가져오기 (캐시 활용)
        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        
        // 2. 테이블 출력값만 업데이트
        this.view.updateTableOutputs(calculatedState.portfolioData, activePortfolio.settings.currentCurrency);

        // 3. 비율 합계 업데이트
        const ratioSum = this.state.getRatioSum(); // 동기 호출
        this.view.updateRatioSum(ratioSum.toNumber());

        // 4. 섹터 분석 업데이트
        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.renderSectorAnalysis(sectorData, activePortfolio.settings.currentCurrency);
        
        // 5. 계산된 상태 저장
        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }
    
    // --- 포트폴리오 관리 핸들러 ---

    /**
     * @description 새 포트폴리오 생성 버튼 클릭을 처리합니다.
     */
    handleNewPortfolio() {
        const name = prompt(t('prompt.newPortfolioName'));
        if (name) {
            this.state.createNewPortfolio(name);
            this.view.initializePortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || '');
            this.fullRender();
            this.view.showToast(t('toast.portfolioCreated', { name }), "success");
        }
    }

    /**
     * @description 포트폴리오 이름 변경을 처리합니다.
     */
    handleRenamePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const newName = prompt(t('prompt.renamePortfolio', { name: activePortfolio.settings.portfolioName }));
        if (newName && newName.trim()) {
            this.state.updatePortfolioSettings('portfolioName', newName.trim());
            this.view.initializePortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.showToast(t('toast.portfolioRenamed', { newName: newName.trim() }), "success");
        }
    }

    /**
     * @description 포트폴리오 삭제를 처리합니다.
     */
    handleDeletePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.state.getAllPortfolios()).length <= 1) {
            this.view.showToast(t('toast.cannotDeleteLastPortfolio'), "error");
            return;
        }

        const confirmDelete = confirm(t('confirm.deletePortfolio', { name: activePortfolio.settings.portfolioName }));
        if (confirmDelete) {
            const deletedId = activePortfolio.id;
            if (this.state.deletePortfolio(deletedId)) {
                const newActivePortfolio = this.state.getActivePortfolio();
                if (newActivePortfolio) {
                    this.view.initializePortfolioSelector(this.state.getAllPortfolios(), newActivePortfolio.id);
                    this.fullRender();
                    this.view.showToast(t('toast.portfolioDeleted', { name: activePortfolio.settings.portfolioName }), "success");
                }
            }
        }
    }

    /**
     * @description 포트폴리오 전환을 처리합니다.
     */
    handleSwitchPortfolio() {
        const selector = this.view.getDOMElement('portfolioSelector');
        // @ts-ignore
        const newId = selector?.value;
        if (newId) {
            this.state.setActivePortfolioId(newId);
            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                // UI 설정값 업데이트
                this.view.setCurrencyMode(activePortfolio.settings.currentCurrency);
                this.view.setMainMode(activePortfolio.settings.mainMode);
                this.view.updateExchangeRate(activePortfolio.settings.exchangeRate);
                this.view.updateAdditionalAmount(activePortfolio.settings.additionalInvestment || 0, activePortfolio.settings.currentCurrency);
            }
            this.fullRender();
        }
    }


    // --- 주식/데이터 관리 핸들러 ---

    /**
     * @description 새 주식 추가를 처리합니다.
     */
    handleAddNewStock() {
        this.state.addNewStock();
        this.fullRender(); // 전체 렌더링으로 새 행을 추가하고 포커스 설정
        const newStockId = this.state.getActivePortfolio()?.portfolioData.slice(-1)[0]?.id;
        if (newStockId) {
             this.view.focusOnNewStock(newStockId);
        }
    }

    /**
     * @description 주식 삭제를 처리합니다.
     * @param {string} stockId - 삭제할 주식 ID
     */
    handleDeleteStock(stockId) {
        if (confirm(t('confirm.deleteStock'))) {
            this.state.deleteStock(stockId);
            Calculator.clearPortfolioStateCache();
            this.fullRender();
            this.view.showToast(t('toast.stockDeleted'), "success");
        }
    }

    /**
     * @description 데이터 전체 초기화를 처리합니다.
     */
    handleResetData() {
        if (confirm(t('confirm.resetData'))) {
            this.state.resetData();
            Calculator.clearPortfolioStateCache();
            this.setupInitialUI(); // UI 초기화
            this.view.showToast(t('toast.dataReset'), "success");
        }
    }

    /**
     * @description 목표 비율 정규화를 처리합니다.
     */
    handleNormalizeRatios() {
        try {
            // normalizeRatios는 이제 동기 함수임
            const success = this.state.normalizeRatios();
            if (!success) {
                this.view.showToast(t('toast.noRatiosToNormalize'), "error");
                return;
            }
            
            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;

            // 업데이트된 비율을 UI에 반영
            this.view.updateAllTargetRatioInputs(activePortfolio.portfolioData);
            
            // 비율 합계 업데이트 (동기)
            const sum = this.state.getRatioSum();
            this.view.updateRatioSum(sum.toNumber());
            
            this.debouncedSave();
            this.view.showToast(t('toast.ratiosNormalized'), "success");

        } catch (error) {
             ErrorService.handle(/** @type {Error} */ (error), 'handleNormalizeRatios');
             this.view.showToast(t('error.normalizeFailed'), "error");
        }
    }

    /**
     * @description 테이블 본문의 변경(input, checkbox)을 처리합니다.
     * @param {Event} e - Change Event
     * @param {Function} debouncedUpdate - 디바운싱된 UI 업데이트 함수
     */
    handlePortfolioBodyChange(e, debouncedUpdate) {
        const target = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);
        const row = target.closest('tr[data-id]');
        if (!row) return;

        const stockId = row.dataset.id;
        const field = target.dataset.field;
        if (!stockId || !field) return;
        
        let value = target.value;
        let isValid = true;
        
        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
                const validationResult = Validator.validateNumericInput(value);
                isValid = validationResult.isValid;
                value = validationResult.value || 0;
                break;
            case 'isFixedBuyEnabled':
                value = (target instanceof HTMLInputElement) ? target.checked : false;
                break;
            case 'sector':
                value = value.trim() || null;
                break;
            case 'name':
            case 'ticker':
            default:
                value = value.trim();
                break;
        }

        this.view.toggleInputValidation(target, isValid);

        if (isValid) {
            this.state.updateStockProperty(stockId, field, value);
            Calculator.clearPortfolioStateCache(); // 데이터 변경 시 캐시 무효화

            // currentPrice, targetRatio, fixedBuyAmount 변경 시만 debouncedUpdate 호출
            if (['targetRatio', 'currentPrice', 'fixedBuyAmount', 'isFixedBuyEnabled', 'sector'].includes(field)) {
                 debouncedUpdate();
            } else {
                 this.debouncedSave(); // 즉시 저장 (이름, 티커)
            }
        }
    }

    /**
     * @description 테이블 본문의 클릭 이벤트(버튼 등)를 처리합니다.
     * @param {Event} e - Click Event
     */
    handlePortfolioBodyClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        const row = target.closest('tr[data-id]');
        if (!row) return;

        const stockId = row.dataset.id;
        if (!stockId) return;

        // 거래 내역 버튼
        if (target.closest('[data-action="open-tx"]')) {
            const stock = this.state.getStockById(stockId);
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (stock && currency) {
                this.view.openTransactionModal(stock, currency, this.state.getTransactions(stockId));
            }
            return;
        }

        // 삭제 버튼
        if (target.closest('[data-action="delete-stock"]')) {
            this.handleDeleteStock(stockId);
            return;
        }
    }


    // --- 계산 및 통화 핸들러 ---

    /**
     * @description 계산 버튼 클릭을 처리합니다.
     */
    handleCalculate() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // 1. 계산에 필요한 모든 입력값을 모읍니다.
        const { mainMode, additionalAmountInput, exchangeRateInput } = this.view.getDOMElements();
        
        const additionalInvestment = this.getInvestmentAmountInKRW(
             activePortfolio.settings.currentCurrency,
             additionalAmountInput,
             exchangeRateInput
        );
        
        const inputs = {
            mainMode: activePortfolio.settings.mainMode,
            portfolioData: activePortfolio.portfolioData,
            additionalInvestment: additionalInvestment // Decimal 타입
        };

        // 2. 유효성 검사 (동기 호출)
        const validationErrors = Validator.validateForCalculation(inputs);
        
        if (validationErrors.length > 0) {
            this.view.showValidationErrors(validationErrors);
            this.view.showToast(t('toast.validationFailed'), "error");
            this.view.hideResults();
            return;
        }
        
        this.view.clearValidationErrors(); // 에러 초기화

        // 3. 계산 실행 (calculatePortfolioState 호출로 이미 계산된 상태 가정)
        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        
        // 4. 리밸런싱 계산
        const rebalancingResults = (activePortfolio.settings.mainMode === 'add')
            ? Calculator.calculateAddRebalancing({
                portfolioData: calculatedState.portfolioData,
                additionalInvestment: additionalInvestment
            })
            : Calculator.calculateSellRebalancing({
                portfolioData: calculatedState.portfolioData
            });

        // 5. 결과 렌더링
        this.view.renderResults({
            mainMode: activePortfolio.settings.mainMode,
            results: rebalancingResults.results,
            currentTotal: calculatedState.currentTotal,
            additionalInvestment: additionalInvestment,
            finalTotal: calculatedState.currentTotal.plus(additionalInvestment),
            currency: activePortfolio.settings.currentCurrency
        });
        
        // 6. 계산된 상태 저장
        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();

        // 7. 토스트 메시지
        this.view.showToast(t('toast.calculationSuccess'), "success");
    }

    /**
     * @description 주식 현재가를 API를 통해 가져옵니다.
     */
    async handleFetchAllPrices() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast(t('toast.noStocksToFetch'), "info");
            return;
        }

        const tickers = activePortfolio.portfolioData.map(s => s.ticker).filter(t => t.trim() !== '');
        if (tickers.length === 0) {
            this.view.showToast(t('toast.noTickersToFetch'), "info");
            return;
        }

        this.view.toggleFetchButton(true); // 로딩 시작

        try {
            const fetchPromises = tickers.map(ticker => this._fetchPrice(ticker));
            const results = await Promise.allSettled(fetchPromises);

            let successCount = 0;
            let failureCount = 0;

            results.forEach((result, index) => {
                const stock = activePortfolio.portfolioData.find(s => s.ticker === tickers[index]);
                if (!stock) return;
                
                if (result.status === 'fulfilled') {
                    const price = result.value;
                    if (typeof price === 'number' && price > 0) {
                        stock.currentPrice = price;
                        this.view.updateCurrentPriceInput(stock.id, price); // UI 즉시 업데이트
                        successCount++;
                    } else {
                        failureCount++;
                    }
                } else {
                    failureCount++;
                }
            });
            
            Calculator.clearPortfolioStateCache(); // 가격 변경 시 캐시 무효화
            this.updateUIState(); // 최종적으로 UI 출력값 갱신 및 저장
            
            if (successCount > 0) {
                this.view.showToast(t('api.fetchSuccess', { count: successCount }), "success");
            }
            if (failureCount > 0) {
                this.view.showToast(t('api.fetchFailed', { count: failureCount }), "warning");
            }
        } catch (error) {
            // Promise.allSettled 자체는 에러를 던지지 않으므로, 이 catch 블록은 거의 사용되지 않음
            ErrorService.handle(/** @type {Error} */ (error), 'handleFetchAllPrices');
            this.view.showToast(t('api.fetchFailedAll'), "error");
        } finally {
            this.view.toggleFetchButton(false); // 로딩 종료
        }
    }

    /**
     * @description 단일 주식의 현재 가격을 API에서 가져옵니다.
     * @param {string} ticker - 주식 티커
     * @returns {Promise<number>} 현재 가격
     */
    async _fetchPrice(ticker) {
        if (!ticker || ticker.trim() === '') {
            throw new Error('Ticker is empty.');
        }

        // Vite 프록시 설정에 의해 /api/price 요청은 Finnhub API로 라우팅됨
        const url = `/api/price?symbol=${encodeURIComponent(ticker)}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) }); // 8초 타임아웃
        
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        // Finnhub API 구조: { c: current_price }
        const price = data.c;
        if (typeof price !== 'number' || price <= 0) {
            throw new Error('Invalid price received.');
        }

        return price;
    }

    /**
     * @description 현재 모드를 업데이트하고 UI를 갱신합니다.
     * @param {'add' | 'sell'} newMode
     */
    handleMainModeChange(newMode) {
        this.state.updatePortfolioSettings('mainMode', newMode);
        this.view.setMainMode(newMode);
        this.view.toggleAdditionalAmountInputs(newMode === 'add');
        this.fullRender();
        this.view.showToast(t('toast.modeChanged', { mode: newMode === 'add' ? t('mode.add') : t('mode.sell') }), "info");
    }

    /**
     * @description 통화 모드를 업데이트하고 UI를 갱신합니다.
     * @param {'KRW' | 'USD'} newCurrency
     */
    handleCurrencyModeChange(newCurrency) {
        this.state.updatePortfolioSettings('currentCurrency', newCurrency);
        this.view.setCurrencyMode(newCurrency);
        this.fullRender();
        this.view.showToast(t('toast.currencyChanged', { currency: newCurrency }), "info");
    }

    /**
     * @description 통화 및 환율 변경을 처리합니다. (Debounce 됨)
     * @param {'krw' | 'usd'} source - 입력이 발생한 필드
     */
    handleCurrencyConversion(source) {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;
        
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.getDOMElements();

        // 1. 환율 업데이트 및 검증
        const exchangeRate = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
        const isValidRate = exchangeRate > 0;
        
        if (isValidRate) {
            this.state.updatePortfolioSettings('exchangeRate', exchangeRate);
        } else {
            // 환율 입력이 유효하지 않으면 기본값 사용
             this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
             this.view.updateExchangeRate(CONFIG.DEFAULT_EXCHANGE_RATE);
             // 그리고 경고 표시
             this.view.showToast(t('error.invalidExchangeRate'), "error");
             return;
        }

        // 2. 추가 투자금액 업데이트 및 변환
        let krwAmount = 0;
        let usdAmount = 0;
        
        if (source === 'krw') {
            krwAmount = Number(additionalAmountInput.value) || 0;
            usdAmount = krwAmount / exchangeRate;
        } else { // source === 'usd'
            usdAmount = Number(additionalAmountUSDInput.value) || 0;
            krwAmount = usdAmount * exchangeRate;
        }
        
        // 3. 상태 및 UI 업데이트
        const currentCurrency = activePortfolio.settings.currentCurrency;
        const finalAmount = (currentCurrency === 'KRW' ? krwAmount : usdAmount) || 0;

        this.state.updatePortfolioSettings('additionalInvestment', finalAmount);

        // 상호 보완적인 입력 필드만 업데이트
        if (source === 'krw') {
            this.view.updateAdditionalAmount(usdAmount, 'USD');
        } else {
            this.view.updateAdditionalAmount(krwAmount, 'KRW');
        }

        this.debouncedSave();
    }


    // --- 거래 내역 모달 핸들러 ---

    /**
     * @description 새 거래 추가 폼 제출을 처리합니다.
     * @param {Event} e - Form Submit Event
     */
    handleAddNewTransaction(e) {
        e.preventDefault();
        const form = /** @type {HTMLFormElement} */ (e.target);
        const stockId = form.dataset.stockId;
        if (!stockId) return;

        const formData = new FormData(form);
        const type = formData.get('type') === 'sell' ? 'sell' : 'buy';
        const date = String(formData.get('date'));
        const quantity = Number(formData.get('quantity'));
        const price = Number(formData.get('price'));

        const txData = { type, date, quantity, price };
        const validationResult = Validator.validateTransaction(txData);

        if (!validationResult.isValid) {
            this.view.showToast(validationResult.message || t('toast.transactionValidationFailed'), "error");
            return;
        }

        this.state.addTransaction(stockId, { type, date, quantity, price });
        const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
        if (currency) {
             this.view.updateTransactionList(stockId, this.state.getTransactions(stockId), currency);
        }
        form.reset();
        this.view.showToast(t('toast.transactionAdded'), "success");

        // 상태 변경 후 UI 업데이트
        Calculator.clearPortfolioStateCache();
        this.updateUIState();
    }

    /**
     * @description 거래 목록 내 삭제 버튼 클릭을 처리합니다.
     * @param {Event} e - Click Event
     */
    handleTransactionListClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        const deleteButton = target.closest('[data-action="delete-tx"]');
        if (!deleteButton) return;

        const stockId = deleteButton.dataset.stockId;
        const txId = deleteButton.dataset.txId;

        if (stockId && txId && confirm(t('confirm.deleteTransaction'))) {
            this.state.deleteTransaction(stockId, txId);
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (currency) {
                 this.view.updateTransactionList(stockId, this.state.getTransactions(stockId), currency);
            }
            this.view.showToast(t('toast.transactionDeleted'), "success");

            // 상태 변경 후 UI 업데이트
            Calculator.clearPortfolioStateCache();
            this.updateUIState();
        }
    }


    // --- 기타 핸들러 ---

    /**
     * @description 다크 모드 토글을 처리합니다.
     */
    handleToggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
    }

    /**
     * @description 페이지 닫기 전 데이터를 저장합니다.
     */
    handleSaveDataOnExit() {
        // 비동기 디바운스 함수가 완료될 시간이 없을 수 있으므로 동기적으로 저장
        this.state.saveActivePortfolio();
        this.state.saveMeta();
    }
    
    /**
     * @description 파일 임포트 버튼 클릭을 처리합니다. (파일 선택창을 엽니다)
     */
    handleImportData() {
        const fileInput = this.view.getDOMElement('importFileInput');
        fileInput?.click();
    }
    
    /**
     * @description 파일 선택 후 변경 이벤트를 처리합니다.
     * @param {Event} e - Change Event (on file input)
     */
    handleFileSelected(e) {
        const fileInput = /** @type {HTMLInputElement} */ (e.target);
        const file = fileInput.files?.[0];
        
        if (file) {
            if (file.type !== 'application/json') {
                this.view.showToast(t('error.invalidFileType'), "error");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonString = event.target?.result;
                    if (typeof jsonString === 'string') {
                        const loadedData = JSON.parse(jsonString);
                        
                        // 기본 구조 검증 (세부 검증은 State 내부에서 진행)
                        if (Validator.isDataStructureValid(loadedData)) {
                             this.state.importData(loadedData);
                             this.view.initializePortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || '');
                             this.fullRender();
                             this.view.showToast(t('toast.dataImportSuccess'), "success");
                        } else {
                            throw new Error('Data structure validation failed.');
                        }
                    }
                } catch (error) {
                    ErrorService.handle(/** @type {Error} */ (error), 'handleFileSelected - Parsing');
                    this.view.showToast(t('error.dataImportFailed'), "error");
                } finally {
                    // Reset the input value to allow the same file to be loaded again
                    fileInput.value = '';
                }
            };
            reader.readAsText(file);
        }
    }
    
    /**
     * @description 데이터 내보내기 버튼 클릭을 처리합니다.
     */
    handleExportData() {
        try {
            const dataToExport = this.state.exportData();
            const jsonString = JSON.stringify(dataToExport, null, 2);
            
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const activePortfolio = this.state.getActivePortfolio();
            const filename = `portfolio_data_${activePortfolio?.settings.portfolioName || 'export'}_${Date.now()}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_'); // 공백 제거
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.view.showToast(t('toast.dataExportSuccess'), "success");

        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'handleExportData');
            this.view.showToast(t('error.dataExportFailed'), "error");
        }
    }
    
    /**
     * @description 입력된 금액을 현재 통화 설정 및 환율을 고려하여 KRW 기준으로 변환합니다.
     * @param {'KRW' | 'USD'} currentCurrency - 현재 설정된 통화
     * @param {HTMLInputElement} krwInput - 원화 입력 필드
     * @param {HTMLInputElement} exchangeRateInput - 환율 입력 필드
     * @returns {Decimal} KRW로 변환된 금액
     */
    getInvestmentAmountInKRW(currentCurrency, krwInput, exchangeRateInput) {
        const amount = Number(krwInput.value) || 0;
        const exchangeRate = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;

        if (currentCurrency === 'KRW') {
            return new Decimal(amount);
        } else { // USD
            const amountUSD = Number(this.view.getDOMElement('additionalAmountUSDInput').value) || 0;
            return new Decimal(amountUSD).times(exchangeRate);
        }
    }
}