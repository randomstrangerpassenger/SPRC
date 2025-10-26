// js/controller.js
// @ts-check
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Calculator } from './calculator.js';
import { Validator } from './validator.js';
import { debounce, formatCurrency } from './utils.js';
import { CONFIG } from './constants.js';
import { ErrorService, ValidationError } from './errorService.js';
import { t } from './i18n.js';
import { generateSectorAnalysisHTML, generateAddModeResultsHTML, generateSellModeResultsHTML } from './templates.js';
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

        // --- ⬇️ [수정됨] 초기화 로직을 async 함수로 분리 ⬇️ ---
        this.initialize();
        // --- ⬆️ [수정됨] ⬆️ ---
    }

    // --- ⬇️ [수정됨] 비동기 초기화 함수 추가 ⬇️ ---
    /**
     * @description 컨트롤러 비동기 초기화 (State 초기화 대기)
     */
    async initialize() {
        await this.state.ensureInitialized(); // State 초기화 완료 대기
        this.view.cacheDomElements(); // DOM 캐싱
        this.setupInitialUI();        // 초기 UI 설정
        this.bindAppEventListeners(); // 이벤트 바인딩
    }
    // --- ⬆️ [수정됨] ⬆️ ---


    // --- 초기 설정 ---

    setupInitialUI() {
        // 다크 모드 초기 반영 (UX 세부 개선 반영)
        if (localStorage.getItem(CONFIG.DARK_MODE_KEY) === 'true') {
            document.body.classList.add('dark-mode');
        }

        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio) {
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id); // initializePortfolioSelector -> renderPortfolioSelector
            this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency); // setCurrencyMode -> updateCurrencyModeUI
            this.view.updateMainModeUI(activePortfolio.settings.mainMode); // setMainMode -> updateMainModeUI
            // @ts-ignore
            this.view.dom.exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString(); // updateExchangeRate -> 직접 값 설정
            // updateAdditionalAmount 호출 제거 (getInvestmentAmountInKRW에서 처리)

            this.fullRender();
        }
    }

    // --- ⬇️ [수정됨] 이벤트 바인딩 함수 분리 (initialize에서 호출) ⬇️ ---
    bindAppEventListeners() {
        // 여기에 eventBinder.js의 bindEventListeners 함수 내용을 가져오거나,
        // eventBinder.js를 import하여 호출합니다.
        // 예시 (import 사용 시):
        // import { bindEventListeners } from './eventBinder.js';
        // bindEventListeners(this, this.view.dom);

        // 직접 구현 예시 (일부만):
        // @ts-ignore
        this.view.dom.calculateBtn?.addEventListener('click', () => this.handleCalculate());
        // ... 나머지 이벤트 리스너 바인딩 ...
        console.log("Event listeners bound (Placeholder in controller.js)"); // 실제 구현 필요
    }
    // --- ⬆️ [수정됨] ⬆️ ---


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
        this.view.renderTable( // renderTable 인자 구조 수정
            calculatedState.portfolioData,
            activePortfolio.settings.currentCurrency,
            activePortfolio.settings.mainMode
        );

        // 3. 비율 합계 업데이트 (비동기 처리 제거)
        const ratioSum = this.calculateRatioSumSync(activePortfolio.portfolioData); // 동기 함수 사용
        this.view.updateRatioSum(ratioSum.toNumber());

        // 4. 섹터 분석 업데이트
        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency)); // displaySectorAnalysis 인자 수정

        // 5. 활성 모드에 따라 추가 투자금 입력 필드 상태 업데이트
        this.view.updateMainModeUI(activePortfolio.settings.mainMode); // toggleAdditionalAmountInputs -> updateMainModeUI

        // 6. 계산된 상태 저장 (결과 뷰에 사용하기 위해)
        // calculatedState.portfolioData는 이미 Decimal 객체를 포함하므로 직접 할당
        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }
     // --- ⬇️ [추가됨] 동기 비율 합계 계산 함수 ⬇️ ---
    /**
     * @description 포트폴리오 데이터에서 목표 비율 합계를 동기적으로 계산합니다.
     * @param {Stock[]} portfolioData
     * @returns {Decimal}
     */
    calculateRatioSumSync(portfolioData) {
        let sum = new Decimal(0);
        if (!Array.isArray(portfolioData)) return sum;
        for (const s of portfolioData) {
            const ratio = new Decimal(s.targetRatio || 0);
            sum = sum.plus(ratio);
        }
        return sum;
    }
    // --- ⬆️ [추가됨] ⬆️ ---


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
        calculatedState.portfolioData.forEach(stock => { // updateTableOutputs 대신 반복문 사용
            this.view.updateStockRowOutputs(stock.id, stock, activePortfolio.settings.currentCurrency, activePortfolio.settings.mainMode);
        });

        // 3. 비율 합계 업데이트 (동기)
        const ratioSum = this.calculateRatioSumSync(activePortfolio.portfolioData);
        this.view.updateRatioSum(ratioSum.toNumber());

        // 4. 섹터 분석 업데이트
        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency)); // displaySectorAnalysis 인자 수정

        // 5. 계산된 상태 저장
        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    // --- 포트폴리오 관리 핸들러 --- (이하 핸들러 함수 내용은 대부분 동일, 비동기 처리 제거 위주)

    /**
     * @description 새 포트폴리오 생성 버튼 클릭을 처리합니다.
     */
    async handleNewPortfolio() { // async 추가 (showPrompt)
        const name = await this.view.showPrompt(t('modal.promptNewPortfolioNameTitle'), t('modal.promptNewPortfolioNameMsg')); // prompt -> showPrompt
        if (name) {
            this.state.createNewPortfolio(name);
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || ''); // initializePortfolioSelector -> renderPortfolioSelector
            this.fullRender();
            this.view.showToast(t('toast.portfolioCreated', { name }), "success");
        }
    }

    /**
     * @description 포트폴리오 이름 변경을 처리합니다.
     */
    async handleRenamePortfolio() { // async 추가 (showPrompt)
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const newName = await this.view.showPrompt(t('modal.promptRenamePortfolioTitle'), t('modal.promptRenamePortfolioMsg'), activePortfolio.name); // prompt -> showPrompt
        if (newName && newName.trim()) {
            this.state.renamePortfolio(activePortfolio.id, newName.trim()); // updatePortfolioSettings -> renamePortfolio
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id); // initializePortfolioSelector -> renderPortfolioSelector
            this.view.showToast(t('toast.portfolioRenamed'), "success"); // { newName: ... } 제거
        }
    }

    /**
     * @description 포트폴리오 삭제를 처리합니다.
     */
    async handleDeletePortfolio() { // async 추가 (showConfirm)
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.state.getAllPortfolios()).length <= 1) {
            this.view.showToast(t('toast.lastPortfolioDeleteError'), "error"); // cannotDeleteLastPortfolio -> lastPortfolioDeleteError
            return;
        }

        const confirmDelete = await this.view.showConfirm(t('modal.confirmDeletePortfolioTitle'), t('modal.confirmDeletePortfolioMsg', { name: activePortfolio.name })); // confirm -> showConfirm
        if (confirmDelete) {
            const deletedPortfolioName = activePortfolio.name; // 이름 저장
            const deletedId = activePortfolio.id;
            if (this.state.deletePortfolio(deletedId)) {
                const newActivePortfolio = this.state.getActivePortfolio();
                if (newActivePortfolio) {
                    this.view.renderPortfolioSelector(this.state.getAllPortfolios(), newActivePortfolio.id); // initializePortfolioSelector -> renderPortfolioSelector
                    this.fullRender();
                    this.view.showToast(t('toast.portfolioDeleted'), "success"); // { name: ... } 제거 (메시지에 이미 포함 가정)
                }
            }
        }
    }

    /**
     * @description 포트폴리오 전환을 처리합니다.
     */
    handleSwitchPortfolio() {
        const selector = this.view.dom.portfolioSelector; // getDOMElement -> dom
        // @ts-ignore
        const newId = selector?.value;
        if (newId) {
            this.state.setActivePortfolioId(newId);
            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                // UI 설정값 업데이트
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency); // setCurrencyMode -> updateCurrencyModeUI
                this.view.updateMainModeUI(activePortfolio.settings.mainMode); // setMainMode -> updateMainModeUI
                // @ts-ignore
                this.view.dom.exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString(); // updateExchangeRate -> 직접 값 설정
                // updateAdditionalAmount 호출 제거
            }
            this.fullRender();
        }
    }


    // --- 주식/데이터 관리 핸들러 ---

    /**
     * @description 새 주식 추가를 처리합니다.
     */
    handleAddNewStock() {
        const newStock = this.state.addNewStock(); // 반환값 받기
        this.fullRender();
        if (newStock) { // 새 주식이 성공적으로 추가되었으면 포커스
             this.view.focusOnNewStock(newStock.id);
        }
    }

    /**
     * @description 주식 삭제를 처리합니다.
     * @param {string} stockId - 삭제할 주식 ID
     */
    async handleDeleteStock(stockId) { // async 추가 (showConfirm)
        const stockName = this.state.getStockById(stockId)?.name || '해당 종목';
        const confirmDelete = await this.view.showConfirm('종목 삭제', `'${stockName}' 종목을 삭제하시겠습니까?`); // confirm -> showConfirm, 메시지 수정
        if (confirmDelete) {
            if(this.state.deleteStock(stockId)){ // deleteStock 성공 여부 확인
                Calculator.clearPortfolioStateCache();
                this.fullRender();
                this.view.showToast(t('toast.transactionDeleted'), "success"); // stockDeleted -> transactionDeleted (i18n.js에 맞춰)
            } else {
                 this.view.showToast('마지막 남은 주식은 삭제할 수 없습니다.', "error");
            }
        }
    }

    /**
     * @description 데이터 전체 초기화를 처리합니다.
     */
    async handleResetData() { // async 추가 (showConfirm)
        const confirmReset = await this.view.showConfirm(t('modal.confirmResetTitle'), t('modal.confirmResetMsg')); // confirm -> showConfirm
        if (confirmReset) {
            this.state.resetData();
            Calculator.clearPortfolioStateCache();
            // --- ⬇️ [수정됨] setupInitialUI 대신 필요한 로직만 수행 ⬇️ ---
            const activePortfolio = this.state.getActivePortfolio();
             if (activePortfolio) {
                this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);
                // @ts-ignore
                this.view.dom.exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
             }
            this.fullRender();
            // --- ⬆️ [수정됨] ⬆️ ---
            this.view.showToast(t('toast.dataReset'), "success");
        }
    }

    /**
     * @description 목표 비율 정규화를 처리합니다.
     */
    async handleNormalizeRatios() { // async 추가 (state.normalizeRatios)
        try {
            const success = await this.state.normalizeRatios(); // await 추가
            if (!success) {
                this.view.showToast(t('toast.noRatiosToNormalize'), "info"); // error -> info
                return;
            }

            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;

            // 업데이트된 비율을 UI에 반영
            this.view.updateAllTargetRatioInputs(activePortfolio.portfolioData);

            // 비율 합계 업데이트 (동기)
            const sum = this.calculateRatioSumSync(activePortfolio.portfolioData);
            this.view.updateRatioSum(sum.toNumber());

            this.debouncedSave();
            this.view.showToast(t('toast.ratiosNormalized'), "success");

        } catch (error) {
             ErrorService.handle(/** @type {Error} */ (error), 'handleNormalizeRatios');
             this.view.showToast('비율 정규화 중 오류 발생', "error"); // i18n 키 대신 직접 메시지
        }
    }

    /**
     * @description 테이블 본문의 변경(input, checkbox)을 처리합니다.
     * @param {Event} e - Change Event
     * @param {Function} debouncedUpdate - 디바운싱된 UI 업데이트 함수
     */
    handlePortfolioBodyChange(e, debouncedUpdate) {
        // ... (내용 동일) ...
         const target = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);
        const row = target.closest('tr[data-id]');
        if (!row) return;

        const stockId = row.dataset.id;
        const field = target.dataset.field;
        if (!stockId || !field) return;

        let value = target.value;
        let isValid = true;
        let numericValue = 0; // 숫자 변환 값 저장

        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
                const validationResult = Validator.validateNumericInput(value);
                isValid = validationResult.isValid;
                numericValue = validationResult.value ?? 0; // 변환된 숫자 저장
                value = numericValue; // value도 숫자로 업데이트
                break;
            case 'isFixedBuyEnabled':
                value = (target instanceof HTMLInputElement) ? target.checked : false;
                break;
            case 'sector': // 섹터는 빈 문자열 허용 가능
            case 'name':
            case 'ticker':
            default:
                value = value.trim(); // 문자열 공백 제거
                break;
        }

        this.view.toggleInputValidation(target, isValid);

        if (isValid) {
            this.state.updateStockProperty(stockId, field, value);
            Calculator.clearPortfolioStateCache(); // 데이터 변경 시 캐시 무효화

            // currentPrice, targetRatio, fixedBuyAmount, isFixedBuyEnabled 변경 시만 debouncedUpdate 호출
            if (['targetRatio', 'currentPrice', 'fixedBuyAmount', 'isFixedBuyEnabled'].includes(field)) {
                 debouncedUpdate();
            } else {
                 this.debouncedSave(); // 즉시 저장 (이름, 티커, 섹터)
            }
             // isFixedBuyEnabled 상태에 따라 fixedBuyAmount 입력 필드 활성화/비활성화
             if (field === 'isFixedBuyEnabled') {
                const amountInput = row.querySelector('input[data-field="fixedBuyAmount"]');
                if (amountInput instanceof HTMLInputElement) {
                    amountInput.disabled = !value;
                    if (!value) { // 비활성화 시 값 0으로 초기화 및 상태 업데이트
                        amountInput.value = '0';
                        this.state.updateStockProperty(stockId, 'fixedBuyAmount', 0);
                        debouncedUpdate(); // UI 업데이트 트리거
                    }
                }
            }
        }
    }


    /**
     * @description 테이블 본문의 클릭 이벤트(버튼 등)를 처리합니다.
     * @param {Event} e - Click Event
     */
    handlePortfolioBodyClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        // data-action 속성을 가진 가장 가까운 버튼 찾기
        const actionButton = target.closest('button[data-action]');
        if (!actionButton) return;

        const row = actionButton.closest('tr[data-id]');
        if (!row?.dataset.id) return;

        const stockId = row.dataset.id;
        const action = actionButton.dataset.action;

        if (action === 'manage') { // data-action 이름 변경 (open-tx -> manage)
            const stock = this.state.getStockById(stockId);
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (stock && currency) {
                // state.getTransactions는 동기 함수
                this.view.openTransactionModal(stock, currency, this.state.getTransactions(stockId));
            }
        } else if (action === 'delete') { // data-action 이름 변경 (delete-stock -> delete)
            this.handleDeleteStock(stockId);
        }
    }


    // --- 계산 및 통화 핸들러 ---

    /**
     * @description 계산 버튼 클릭을 처리합니다.
     */
    async handleCalculate() { // async 추가 (confirmRatioSumWarn)
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // --- ⬇️ [수정됨] this.view.dom 사용 ⬇️ ---
        // 1. 계산에 필요한 모든 입력값을 모읍니다.
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;
        if (!additionalAmountInput || !additionalAmountUSDInput || !exchangeRateInput) {
             console.error("DOM elements for calculation not found.");
             return; // 필요한 DOM 요소 없으면 중단
        }
        // --- ⬆️ [수정됨] ⬆️ ---

        const additionalInvestment = this.getInvestmentAmountInKRW(
             activePortfolio.settings.currentCurrency,
             // @ts-ignore
             additionalAmountInput, // dom 객체에서 직접 전달
             // @ts-ignore
             exchangeRateInput     // dom 객체에서 직접 전달
        );

        const inputs = {
            mainMode: activePortfolio.settings.mainMode,
            portfolioData: activePortfolio.portfolioData, // state에서 직접 가져옴
            additionalInvestment: additionalInvestment // Decimal 타입
        };

        // 2. 유효성 검사 (동기 호출)
        const validationErrors = Validator.validateForCalculation(inputs);

        if (validationErrors.length > 0) {
            // this.view.showValidationErrors(validationErrors); // 이 함수가 없으므로 주석 처리 또는 구현 필요
            // 오류 메시지를 토스트로 표시
            const errorMessages = validationErrors.map(err => err.message).join('\n');
            ErrorService.handle(new ValidationError(errorMessages), 'handleCalculate - Validation'); // ErrorService 사용
            this.view.hideResults();
            return;
        }

        // this.view.clearValidationErrors(); // 이 함수가 없으므로 주석 처리

        // 목표 비율 합계 확인 (100% 아니면 경고)
        const totalRatio = this.calculateRatioSumSync(inputs.portfolioData);
        if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE) {
            const proceed = await this.view.showConfirm(
                t('modal.confirmRatioSumWarnTitle'),
                t('modal.confirmRatioSumWarnMsg', { totalRatio: totalRatio.toFixed(1) })
            );
            if (!proceed) {
                this.view.hideResults();
                return; // 사용자가 취소하면 계산 중단
            }
        }


        // 3. 계산 실행 (calculatePortfolioState 호출로 이미 계산된 상태 가정)
        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: inputs.portfolioData, // inputs에서 사용
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

        // 5. 결과 렌더링 (템플릿 함수 사용)
        const resultsHTML = activePortfolio.settings.mainMode === 'add'
             ? generateAddModeResultsHTML(rebalancingResults.results, {
                   currentTotal: calculatedState.currentTotal,
                   additionalInvestment: additionalInvestment,
                   finalTotal: calculatedState.currentTotal.plus(additionalInvestment)
               }, activePortfolio.settings.currentCurrency)
             : generateSellModeResultsHTML(rebalancingResults.results, activePortfolio.settings.currentCurrency);

        this.view.displayResults(resultsHTML); // renderResults -> displayResults

        // 6. 계산된 상태 저장 (portfolioData 업데이트는 fullRender 또는 updateUIState에서 이미 처리됨)
        // activePortfolio.portfolioData = calculatedState.portfolioData; // 중복 제거
        this.debouncedSave();

        // 7. 토스트 메시지
        this.view.showToast('계산 완료!', "success"); // i18n 키 대신 직접 메시지
    }


    // --- (이하 코드는 이전 답변과 거의 동일, getDOMElements 대신 dom 사용 부분만 확인) ---

     /**
     * @description 주식 현재가를 API를 통해 가져옵니다.
     */
    async handleFetchAllPrices() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast(t('api.noUpdates'), "info"); // i18n 키 변경
            return;
        }

        const tickersToFetch = activePortfolio.portfolioData
            .filter(s => s.ticker && s.ticker.trim() !== '')
            .map(s => ({ id: s.id, ticker: s.ticker.trim() })); // ID와 함께 매핑

        if (tickersToFetch.length === 0) {
            this.view.showToast('가져올 티커가 없습니다.', "info"); // 직접 메시지
            return;
        }

        // @ts-ignore
        this.view.toggleFetchButton(true); // 로딩 시작 (view에 이 함수가 있다고 가정)

        let successCount = 0;
        let failureCount = 0;
        const failedTickers = [];

        // Promise.allSettled를 사용하여 모든 요청이 완료될 때까지 기다림
        const results = await Promise.allSettled(
            tickersToFetch.map(item => this._fetchPrice(item.ticker))
        );

        results.forEach((result, index) => {
            const { id, ticker } = tickersToFetch[index];
            if (result.status === 'fulfilled') {
                const price = result.value;
                if (typeof price === 'number' && price > 0) {
                    this.state.updateStockProperty(id, 'currentPrice', price);
                    this.view.updateCurrentPriceInput(id, price.toFixed(2)); // UI 즉시 업데이트 (소수점 2자리)
                    successCount++;
                } else {
                    failureCount++;
                    failedTickers.push(ticker);
                    console.warn(`[API] Invalid price for ${ticker}:`, price);
                }
            } else {
                failureCount++;
                failedTickers.push(ticker);
                console.error(`[API] Failed to fetch price for ${ticker}:`, result.reason);
            }
        });

        Calculator.clearPortfolioStateCache(); // 가격 변경 시 캐시 무효화
        this.updateUIState(); // 최종적으로 UI 출력값 갱신 및 저장

        // 결과 토스트 메시지
        if (successCount === tickersToFetch.length) {
            this.view.showToast(t('api.fetchSuccessAll', { count: successCount }), "success");
        } else if (successCount > 0) {
            this.view.showToast(t('api.fetchSuccessPartial', { count: successCount, failed: failureCount }), "warning");
        } else {
             this.view.showToast(t('api.fetchFailedAll', { failed: failureCount }), "error");
        }
         // 실패한 티커 목록 로깅 (필요시)
         if (failedTickers.length > 0) {
             console.log("Failed tickers:", failedTickers.join(', '));
         }

        // @ts-ignore
        this.view.toggleFetchButton(false); // 로딩 종료 (view에 이 함수가 있다고 가정)
    }


    /**
     * @description 단일 주식의 현재 가격을 API에서 가져옵니다.
     * @param {string} ticker - 주식 티커
     * @returns {Promise<number>} 현재 가격
     */
    async _fetchPrice(ticker) {
        // ... (내용 동일) ...
         if (!ticker || ticker.trim() === '') {
            throw new Error('Ticker is empty.');
        }

        // Vite 프록시 설정에 의해 /finnhub 요청은 Finnhub API로 라우팅됨
        const url = `/finnhub/quote?symbol=${encodeURIComponent(ticker)}`; // 엔드포인트 수정 quote
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) }); // 8초 타임아웃

        if (!response.ok) {
            // API 오류 메시지 포함 시도
            let errorBody = '';
            try { errorBody = await response.text(); } catch (_) {}
            throw new Error(`API returned status ${response.status}. ${errorBody}`);
        }

        const data = await response.json();

        // Finnhub API 구조: { c: current_price }
        const price = data.c;

        // API가 0을 반환하는 경우도 유효하지 않다고 처리 (주식 가격이 0인 경우는 거의 없음)
        if (typeof price !== 'number' || price <= 0) {
             console.warn(`[API] Received invalid price for ${ticker}: ${price}`);
            throw new Error(`Invalid or zero price received for ${ticker}: ${price}`);
        }

        return price;
    }

    /**
     * @description 현재 모드를 업데이트하고 UI를 갱신합니다.
     * @param {'add' | 'sell'} newMode
     */
    handleMainModeChange(newMode) {
        this.state.updatePortfolioSettings('mainMode', newMode);
        this.view.updateMainModeUI(newMode); // setMainMode -> updateMainModeUI
        // this.view.toggleAdditionalAmountInputs(newMode === 'add'); // updateMainModeUI에 포함됨
        this.fullRender(); // 테이블 헤더 등 변경 위해 fullRender 호출
        this.view.showToast(`모드가 ${newMode === 'add' ? '추가 매수' : '매도 리밸런싱'} 모드로 변경되었습니다.`, "info"); // i18n 키 대신 직접 메시지
    }

    /**
     * @description 통화 모드를 업데이트하고 UI를 갱신합니다.
     * @param {'krw' | 'usd'} newCurrency // KRW/USD -> krw/usd
     */
    handleCurrencyModeChange(newCurrency) {
        this.state.updatePortfolioSettings('currentCurrency', newCurrency);
        this.view.updateCurrencyModeUI(newCurrency); // setCurrencyMode -> updateCurrencyModeUI
        this.fullRender(); // 통화 변경 시 테이블 헤더 등 업데이트 위해 fullRender
        this.view.showToast(`통화 기준이 ${newCurrency.toUpperCase()}로 변경되었습니다.`, "info"); // i18n 키 대신 직접 메시지
    }

    /**
     * @description 통화 및 환율 변경을 처리합니다. (Debounce 됨)
     * @param {'krw' | 'usd'} source - 입력이 발생한 필드
     */
    handleCurrencyConversion(source) {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // --- ⬇️ [수정됨] this.view.dom 사용 ⬇️ ---
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;
         if (!additionalAmountInput || !additionalAmountUSDInput || !exchangeRateInput) return;
        // --- ⬆️ [수정됨] ⬆️ ---


        // 1. 환율 업데이트 및 검증
        // @ts-ignore
        const exchangeRate = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
        const isValidRate = exchangeRate > 0;

        if (isValidRate) {
            this.state.updatePortfolioSettings('exchangeRate', exchangeRate);
        } else {
             this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
             // @ts-ignore
             exchangeRateInput.value = CONFIG.DEFAULT_EXCHANGE_RATE.toString(); // 입력 필드 값도 되돌림
             this.view.showToast('유효하지 않은 환율입니다. 기본값으로 복원됩니다.', "error"); // i18n 키 대신 직접 메시지
             // 변환 로직 중단 없이 기본 환율로 계속 진행
        }
        const currentExchangeRate = this.state.getActivePortfolio()?.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;


        // 2. 추가 투자금액 업데이트 및 변환
        let krwAmountDec = new Decimal(0);
        let usdAmountDec = new Decimal(0);

        try {
            if (source === 'krw') {
                // @ts-ignore
                krwAmountDec = new Decimal(additionalAmountInput.value || 0);
                 if (krwAmountDec.isNegative()) throw new Error('Negative KRW input');
                usdAmountDec = krwAmountDec.div(currentExchangeRate);
            } else { // source === 'usd'
                // @ts-ignore
                usdAmountDec = new Decimal(additionalAmountUSDInput.value || 0);
                if (usdAmountDec.isNegative()) throw new Error('Negative USD input');
                krwAmountDec = usdAmountDec.times(currentExchangeRate);
            }
        } catch(e) {
             console.error("Error during currency conversion:", e);
             this.view.showToast("금액 입력 오류.", "error");
             // 오류 발생 시 입력값 초기화 또는 다른 처리 가능
             // @ts-ignore
             if (source === 'krw') additionalAmountUSDInput.value = ''; else additionalAmountInput.value = '';
             return; // 추가 처리 중단
        }

        // 3. 상태 및 UI 업데이트
        const currentCurrency = activePortfolio.settings.currentCurrency;
        // 상태에는 현재 선택된 통화 기준의 금액을 저장하지 않음 (항상 KRW 기준?) -> 저장 로직 제거

        // 상호 보완적인 입력 필드만 업데이트 (소수점 2자리 반올림)
        if (source === 'krw') {
             // @ts-ignore
             additionalAmountUSDInput.value = usdAmountDec.toFixed(2);
        } else {
            // @ts-ignore
            additionalAmountInput.value = krwAmountDec.toFixed(0); // 원화는 소수점 없음
        }

        this.debouncedSave(); // 설정(환율) 변경 저장
    }


    // --- 거래 내역 모달 핸들러 ---

    /**
     * @description 새 거래 추가 폼 제출을 처리합니다.
     * @param {Event} e - Form Submit Event
     */
    async handleAddNewTransaction(e) { // async 추가 (addTransaction)
        e.preventDefault();
        const form = /** @type {HTMLFormElement} */ (e.target);
        // --- ⬇️ [수정됨] 모달에서 stockId 가져오기 ⬇️ ---
        const modal = form.closest('#transactionModal');
        const stockId = modal?.dataset.stockId;
        // --- ⬆️ [수정됨] ⬆️ ---
        if (!stockId) return;

        // FormData 대신 직접 DOM 요소에서 값 가져오기 (더 명확함)
        const typeInput = form.querySelector('input[name="txType"]:checked');
        const dateInput = /** @type {HTMLInputElement} */ (form.querySelector('#txDate'));
        const quantityInput = /** @type {HTMLInputElement} */ (form.querySelector('#txQuantity'));
        const priceInput = /** @type {HTMLInputElement} */ (form.querySelector('#txPrice'));

        if (!typeInput || !dateInput || !quantityInput || !priceInput) return;

        const type = typeInput.value === 'sell' ? 'sell' : 'buy';
        const date = dateInput.value;
        const quantity = Number(quantityInput.value); // Number로 변환
        const price = Number(priceInput.value);       // Number로 변환

        const txData = { type, date, quantity, price };
        const validationResult = Validator.validateTransaction(txData);

        if (!validationResult.isValid) {
            this.view.showToast(validationResult.message || '거래 정보가 유효하지 않습니다.', "error"); // i18n 키 대신 직접 메시지
            return;
        }

        const success = await this.state.addTransaction(stockId, { type, date, quantity, price }); // await 추가

        if (success) {
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (currency) {
                 this.view.renderTransactionList(this.state.getTransactions(stockId), currency); // updateTransactionList -> renderTransactionList
            }
            form.reset();
             // 날짜 오늘로 리셋
            dateInput.valueAsDate = new Date();
            this.view.showToast(t('toast.transactionAdded'), "success");

            // 상태 변경 후 UI 업데이트
            Calculator.clearPortfolioStateCache();
            this.updateUIState();
        } else {
             this.view.showToast('거래 추가 실패.', "error");
        }
    }


    /**
     * @description 거래 목록 내 삭제 버튼 클릭을 처리합니다.
     * @param {Event} e - Click Event
     */
    async handleTransactionListClick(e) { // async 추가 (showConfirm)
        const target = /** @type {HTMLElement} */ (e.target);
        const deleteButton = target.closest('button[data-action="delete-tx"]');
        if (!deleteButton) return;

        const row = deleteButton.closest('tr[data-tx-id]');
        const modal = deleteButton.closest('#transactionModal');
        const stockId = modal?.dataset.stockId;
        const txId = row?.dataset.txId;

        if (stockId && txId) {
             const confirmDelete = await this.view.showConfirm(t('modal.confirmDeleteTransactionTitle'), t('modal.confirmDeleteTransactionMsg')); // confirm -> showConfirm
             if(confirmDelete) {
                 const success = this.state.deleteTransaction(stockId, txId);
                 if (success) {
                    const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
                    if (currency) {
                         this.view.renderTransactionList(this.state.getTransactions(stockId), currency); // updateTransactionList -> renderTransactionList
                    }
                    this.view.showToast(t('toast.transactionDeleted'), "success");

                    // 상태 변경 후 UI 업데이트
                    Calculator.clearPortfolioStateCache();
                    this.updateUIState();
                 } else {
                     this.view.showToast('거래 삭제 실패.', "error");
                 }
            }
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
        // --- ⬇️ [추가됨] 차트 다시 그리기 ⬇️ ---
        this.view.destroyChart(); // 기존 차트 파괴
        this.updateUIState();     // UI 업데이트 시 차트 다시 생성됨 (배경색 등 적용 위해)
        // --- ⬆️ [추가됨] ⬆️ ---
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
        const fileInput = this.view.dom.importFileInput; // getDOMElement -> dom
        // @ts-ignore
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
                this.view.showToast('JSON 파일만 가져올 수 있습니다.', "error"); // i18n 키 대신 직접 메시지
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => { // async 추가 (state.importData)
                try {
                    const jsonString = event.target?.result;
                    if (typeof jsonString === 'string') {
                        const loadedData = JSON.parse(jsonString);

                        // 기본 구조 검증 (세부 검증은 State 내부에서 진행)
                        if (Validator.isDataStructureValid(loadedData)) {
                             await this.state.importData(loadedData); // await 추가
                             this.view.renderPortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || ''); // initializePortfolioSelector -> renderPortfolioSelector
                             this.fullRender();
                             this.view.showToast(t('toast.importSuccess'), "success"); // dataImportSuccess -> importSuccess
                        } else {
                            throw new Error('Data structure validation failed.');
                        }
                    }
                } catch (error) {
                    ErrorService.handle(/** @type {Error} */ (error), 'handleFileSelected - Parsing');
                    this.view.showToast(t('toast.importError'), "error"); // dataImportFailed -> importError
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
            const filename = `portfolio_data_${activePortfolio?.name || 'export'}_${Date.now()}.json`; // settings.portfolioName -> name

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_'); // 공백 제거
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.view.showToast('데이터를 성공적으로 내보냈습니다.', "success"); // i18n 키 대신 직접 메시지

        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'handleExportData');
            this.view.showToast('데이터 내보내기 중 오류 발생.', "error"); // i18n 키 대신 직접 메시지
        }
    }

    /**
     * @description 입력된 금액을 현재 통화 설정 및 환율을 고려하여 KRW 기준으로 변환합니다.
     * @param {'krw' | 'usd'} currentCurrency - 현재 설정된 통화
     * @param {HTMLInputElement} krwInput - 원화 입력 필드
     * @param {HTMLInputElement} exchangeRateInput - 환율 입력 필드
     * @returns {Decimal} KRW로 변환된 금액
     */
    getInvestmentAmountInKRW(currentCurrency, krwInput, exchangeRateInput) {
        // --- ⬇️ [수정됨] this.view.dom.additionalAmountUSDInput 사용 ⬇️ ---
        const usdInput = this.view.dom.additionalAmountUSDInput;
        if (!usdInput) return new Decimal(0); // USD 입력 필드 없으면 0 반환

        const amountKRW = new Decimal(krwInput.value || 0);
        // @ts-ignore
        const amountUSD = new Decimal(usdInput.value || 0);
        const exchangeRate = new Decimal(exchangeRateInput.value || CONFIG.DEFAULT_EXCHANGE_RATE);
        // --- ⬆️ [수정됨] ⬆️ ---


        if (currentCurrency === 'krw') {
            return amountKRW.isNegative() ? new Decimal(0) : amountKRW; // 음수 방지
        } else { // usd
            const calculatedKRW = amountUSD.times(exchangeRate);
            return calculatedKRW.isNegative() ? new Decimal(0) : calculatedKRW; // 음수 방지
        }
    }
}