// @ts-check
import { CONFIG } from './constants.js';
// import { getRatioSum } from './utils.js'; // utils.js 제거
import { ErrorService } from './errorService.js';
import { Validator } from './validator.js';
import { createDecimal, getDecimal } from './decimalLoader.js';
import Decimal from 'decimal.js'; // 직접 임포트 유지

/** @typedef {import('./types.js').Stock} Stock */
// ... (다른 타입 정의 동일) ...

// 상태 관리를 위한 싱글톤 객체
export class PortfolioState {
    /** @type {PortfolioDataStructure} */
    #data;
    /** @type {string | null} */
    #activePortfolioId;

    /** @type {Map<string, CalculatedStock['transactions']>} */
    #transactionCache = new Map();

    /** @type {Promise<void> | null} */
    #initializationPromise = null; // 초기화 Promise 추가

    constructor() {
        this.#data = { portfolios: {}, activePortfolioId: '' };
        this.#activePortfolioId = null;
        // --- ⬇️ [수정됨] 생성자에서는 초기화 시작만 ⬇️ ---
        // 생성자에서는 초기화 시작만 하고, 완료는 #initializationPromise로 추적
        this.#initializationPromise = this.loadInitialState();
        // --- ⬆️ [수정됨] ⬆️ ---
    }

    // --- ⬇️ [추가됨] 초기화 완료 대기 메서드 ⬇️ ---
    /**
     * @description 초기화가 완료될 때까지 기다리는 메서드
     * @returns {Promise<void>}
     */
    async ensureInitialized() {
        if (!this.#initializationPromise) {
             // 만약 초기화 Promise가 없다면 즉시 loadInitialState 호출 (안전 장치)
             console.warn("Initialization promise was null, re-initializing.");
             this.#initializationPromise = this.loadInitialState();
        }
        try {
            await this.#initializationPromise;
        } catch (error) {
             console.error("Initialization failed:", error);
             // 초기화 실패 시 복구 로직 (예: 기본 포트폴리오 강제 생성)
             if (Object.keys(this.#data.portfolios).length === 0) {
                 this.createNewPortfolio('기본 포트폴리오');
             }
             // 에러를 다시 던져서 호출 측에서 알 수 있게 할 수도 있음
             // throw error;
        }
    }
    // --- ⬆️ [추가됨] ⬆️ ---


    // --- [수정됨] loadInitialState를 async로 변경하고 Promise.all 사용 ---
    async loadInitialState() {
        try {
            // Decimal 라이브러리 로드를 먼저 기다림 (필수!)
            await getDecimal();
            console.log("Decimal library loaded for state initialization."); // 로드 확인 로그

            const metaJson = localStorage.getItem(CONFIG.META_KEY);
            if (metaJson) {
                const meta = JSON.parse(metaJson);
                this.#activePortfolioId = meta.activePortfolioId;
            }

            const portfolioIds = this.getAllPortfolioIdsFromLocalStorage();
            const loadedPortfolios = {};

            console.log(`Found ${portfolioIds.length} portfolio IDs in localStorage.`); // 로그 추가

            if (portfolioIds.length > 0) {
                // Promise.all을 사용하여 모든 역직렬화를 병렬로 실행하고 기다림
                const portfolioPromises = portfolioIds.map(async (id) => {
                    const dataJson = localStorage.getItem(CONFIG.DATA_PREFIX + id);
                    if (dataJson) {
                        try {
                            const loadedData = JSON.parse(dataJson);
                            // _deserializePortfolioData는 이제 async 함수
                            const deserializedPortfolio = await this._deserializePortfolioData(loadedData);
                            console.log(`Successfully deserialized portfolio: ${id}`); // 로그 추가
                            return { id, portfolio: deserializedPortfolio };
                        } catch (parseError) {
                            console.warn(`[State] Invalid JSON or deserialization error for portfolio ID: ${id}. Skipping.`, parseError);
                            return null; // 실패 시 null 반환
                        }
                    }
                     console.log(`No data found for portfolio ID: ${id}`); // 로그 추가
                    return null; // 데이터 없을 시 null 반환
                });

                // 모든 Promise가 완료될 때까지 기다림
                const results = await Promise.all(portfolioPromises);
                console.log("Deserialization promises completed."); // 로그 추가

                // 성공적으로 로드된 포트폴리오만 객체에 추가
                results.forEach(result => {
                    if (result) {
                        loadedPortfolios[result.id] = result.portfolio;
                    }
                });
            }

            // this.#data.portfolios 업데이트
            this.#data.portfolios = loadedPortfolios;
            console.log(`Loaded ${Object.keys(this.#data.portfolios).length} portfolios into state.`); // 로그 추가

            const loadedPortfolioIds = Object.keys(this.#data.portfolios);

            if (loadedPortfolioIds.length > 0) {
                if (!this.#activePortfolioId || !this.#data.portfolios[this.#activePortfolioId]) {
                    console.log(`Invalid or missing activePortfolioId (${this.#activePortfolioId}). Setting to first loaded: ${loadedPortfolioIds[0]}`); // 로그 추가
                    this.#activePortfolioId = loadedPortfolioIds[0];
                }
                 console.log(`Active portfolio ID set to: ${this.#activePortfolioId}`); // 로그 추가
            } else {
                 console.log("No portfolios loaded. Creating default portfolio."); // 로그 추가
                // 새 포트폴리오 생성 시에도 Decimal 로드가 완료된 후여야 함
                this.createNewPortfolio('기본 포트폴리오');
                 console.log(`Default portfolio created. Active ID: ${this.#activePortfolioId}`); // 로그 추가
            }

            this.saveMeta();
             console.log("Initial state loaded and meta saved."); // 최종 로그
        } catch (e) {
            console.error("Critical error during loadInitialState:", e); // 에러 로그 강화
            ErrorService.handle(/** @type {Error} */(e), 'loadInitialState');
            if (Object.keys(this.#data.portfolios).length === 0) {
                 console.log("Creating default portfolio after critical error."); // 로그 추가
                 // 새 포트폴리오 생성 시에도 Decimal 로드가 완료된 후여야 함
                this.createNewPortfolio('기본 포트폴리오');
            }
        }
    }
    // --- [수정 완료] ---


    /**
     * @description LocalStorage에서 포트폴리오 ID 목록을 가져옵니다.
     * @returns {string[]}
     */
    getAllPortfolioIdsFromLocalStorage() {
        const ids = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CONFIG.DATA_PREFIX)) {
                ids.push(key.substring(CONFIG.DATA_PREFIX.length));
            }
        }
        return ids;
    }

    saveMeta() {
        if (!this.#activePortfolioId) return;
        try {
            const meta = { activePortfolioId: this.#activePortfolioId };
            localStorage.setItem(CONFIG.META_KEY, JSON.stringify(meta));
        } catch (e) {
            ErrorService.handle(/** @type {Error} */(e), 'saveMeta');
        }
    }

    /**
     * @description 현재 활성 포트폴리오 데이터를 LocalStorage에 저장합니다.
     * 주의: 이 함수는 debounce 되어 호출됩니다.
     */
    saveActivePortfolio() {
        if (!this.#activePortfolioId) return;
        try {
            const activePortfolio = this.#data.portfolios[this.#activePortfolioId];
            if (activePortfolio) {
                // 저장 전에 직렬화
                const serializedData = this._serializePortfolioData(activePortfolio);
                localStorage.setItem(CONFIG.DATA_PREFIX + this.#activePortfolioId, JSON.stringify(serializedData));
            }
        } catch (e) {
            ErrorService.handle(/** @type {Error} */(e), 'saveActivePortfolio');
            // 저장 실패 시 사용자에게 알림 (예: 토스트 메시지)
            console.error("Failed to save portfolio to localStorage. Data might be lost.", e);
            // view?.showToast(...) // view가 있다면 알림 표시
        }
    }

    // --- 데이터 직렬화/역직렬화 ---

    /**
     * @description 저장 전 데이터를 Decimal 객체에서 일반 숫자로 변환합니다.
     * @param {Portfolio} portfolio - 포트폴리오 데이터
     * @returns {any}
     */
    _serializePortfolioData(portfolio) {
         // portfolioData가 없을 경우 빈 배열로 처리
        const portfolioData = portfolio.portfolioData || [];
        return {
            ...portfolio,
            portfolioData: portfolioData.map(stock => {
                 // transactions가 없을 경우 빈 배열로 처리
                const transactions = stock.transactions || [];
                return {
                    ...stock,
                    transactions: transactions.map(tx => ({
                        ...tx,
                        // Decimal 객체 확인 후 toNumber() 호출 (안전하게)
                        quantity: (tx.quantity && typeof tx.quantity === 'object' && 'toNumber' in tx.quantity) ? tx.quantity.toNumber() : Number(tx.quantity || 0),
                        price: (tx.price && typeof tx.price === 'object' && 'toNumber' in tx.price) ? tx.price.toNumber() : Number(tx.price || 0),
                    })),
                    // _sortedTransactions는 저장하지 않음 (임시 캐시)
                    _sortedTransactions: undefined
                };
            }),
        };
    }


    /**
     * @description 로드 후 데이터를 일반 숫자에서 Decimal 객체로 변환합니다. (비동기)
     * @param {any} loadedData - 로드된 데이터 (숫자 형태)
     * @returns {Promise<Portfolio>}
     */
    async _deserializePortfolioData(loadedData) {
        // --- ⬇️ [추가됨] Decimal 로드 확인 ⬇️ ---
        // 이 함수가 호출되기 전에 Decimal 라이브러리가 로드되었는지 확인
        const DecimalConstructor = await getDecimal(); // 로드를 기다리거나 캐시된 생성자 가져옴
        if (!DecimalConstructor) {
             throw new Error("Decimal library is not loaded, cannot deserialize data.");
        }
        // --- ⬆️ [추가됨] ⬆️ ---

        // loadedData.portfolioData가 없거나 배열이 아니면 빈 배열 사용
        const portfolioDataArray = Array.isArray(loadedData.portfolioData) ? loadedData.portfolioData : [];

        const portfolioData = await Promise.all(
            portfolioDataArray.map(async (stock) => {
                // Ensure required fields are present with default values if necessary
                const name = stock.name || 'Untitled Stock';
                const ticker = stock.ticker || 'TICKER';
                const sector = stock.sector || '미분류';
                const currentPrice = Number(stock.currentPrice) || 0;
                const targetRatio = Number(stock.targetRatio) || 0;
                const fixedBuyAmount = Number(stock.fixedBuyAmount) || 0;

                // stock.transactions가 없거나 배열이 아니면 빈 배열 사용
                const transactionsArray = Array.isArray(stock.transactions) ? stock.transactions : [];

                const transactions = await Promise.all(
                    transactionsArray.map(async (tx) => {
                        // 기본값 강화 및 타입 확인
                        const quantityValue = tx.quantity ?? 0;
                        const priceValue = tx.price ?? 0;
                        return {
                            id: tx.id || `tx-fallback-${Date.now()}-${Math.random()}`, // ID 없으면 생성
                            type: (tx.type === 'buy' || tx.type === 'sell') ? tx.type : 'buy', // 기본값 buy
                            date: typeof tx.date === 'string' ? tx.date : new Date().toISOString().split('T')[0], // 기본값 오늘 날짜
                            quantity: await createDecimal(quantityValue), // createDecimal은 0 처리함
                            price: await createDecimal(priceValue),       // createDecimal은 0 처리함
                        };
                    })
                );

                return {
                    id: stock.id || `s-fallback-${Date.now()}-${Math.random()}`, // ID 없으면 생성
                    name: name,
                    ticker: ticker,
                    sector: sector,
                    currentPrice: currentPrice,
                    targetRatio: targetRatio,
                    isFixedBuyEnabled: stock.isFixedBuyEnabled || false,
                    fixedBuyAmount: fixedBuyAmount,
                    transactions: transactions,
                    _sortedTransactions: this._sortTransactions(transactions) // 정렬 캐시 생성
                };
            })
        );

        // 기본 설정값 보장
        const defaultSettings = {
            mainMode: 'add',
            currentCurrency: 'krw',
            exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE,
        };
        const settings = { ...defaultSettings, ...(loadedData.settings || {}) };
        // mainMode, currentCurrency 유효성 검사 추가
        if (settings.mainMode !== 'add' && settings.mainMode !== 'sell') settings.mainMode = 'add';
        if (settings.currentCurrency !== 'krw' && settings.currentCurrency !== 'usd') settings.currentCurrency = 'krw';


        return {
            id: loadedData.id || `p-fallback-${Date.now()}-${Math.random()}`, // ID 없으면 생성
            name: loadedData.name || 'Unnamed Portfolio',
            settings: settings,
            portfolioData: portfolioData,
        };
    }


    /**
     * @description 트랜잭션을 정렬하고 캐시합니다. (state 내부 유틸리티)
     * @param {Stock['transactions']} transactions
     * @returns {Stock['transactions']}
     */
    _sortTransactions(transactions) {
         // transactions가 배열이 아니면 빈 배열 반환
         if (!Array.isArray(transactions)) return [];
         return [...transactions].sort((a, b) => {
            const dateA = a?.date || ''; // null 방지
            const dateB = b?.date || ''; // null 방지
            const idA = a?.id || '';   // null 방지
            const idB = b?.id || '';   // null 방지
            const dateCompare = dateA.localeCompare(dateB);
            if (dateCompare !== 0) return dateCompare;
            return idA.localeCompare(idB); // 날짜 같으면 ID로 안정 정렬
        });
    }


    // --- 포트폴리오 관리 ---

    /**
     * @description 새로운 포트폴리오를 생성하고 활성화합니다.
     * @param {string} name - 포트폴리오 이름
     * @returns {string} 새로 생성된 포트폴리오 ID
     */
    createNewPortfolio(name) {
        // Decimal 라이브러리가 로드되었는지 확인 (방어 코드)
        if (!Decimal) {
            console.error("Decimal library not loaded. Cannot create new portfolio properly.");
             // 여기서 에러를 던지거나, 로드를 기다리는 로직 추가 가능
             // throw new Error("Decimal not ready");
             return ''; // 임시 반환
        }

        // 고유 ID 생성 (crypto.randomUUID 또는 Date.now() + random suffix 사용)
        let newId;
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            newId = `p-${crypto.randomUUID()}`;
        } else {
            newId = `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        /** @type {PortfolioSettings} */
        const defaultSettings = {
            mainMode: 'add',
            currentCurrency: 'krw',
            exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE,
        };

        /** @type {Stock} */
        const defaultStock = {
            id: `s-${Date.now() + 1}`,
            name: '새 종목',
            ticker: 'TICKER',
            sector: '미분류',
            currentPrice: 0,
            targetRatio: 100, // 기본 100%
            isFixedBuyEnabled: false,
            fixedBuyAmount: 0,
            transactions: [],
            _sortedTransactions: []
        };

        /** @type {Portfolio} */
        const newPortfolio = {
            id: newId,
            name: name,
            settings: defaultSettings,
            portfolioData: [defaultStock],
        };

        this.#data.portfolios[newId] = newPortfolio;
        this.setActivePortfolioId(newId);
        this.saveActivePortfolio(); // 새 포트폴리오 즉시 저장
        console.log(`Portfolio '${name}' (ID: ${newId}) created and saved.`); // 로그 추가
        return newId;
    }


    /**
     * @description 포트폴리오를 삭제합니다.
     * @param {string} id - 삭제할 포트폴리오 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deletePortfolio(id) {
        if (Object.keys(this.#data.portfolios).length <= 1) {
            console.warn("Cannot delete the last remaining portfolio.");
            return false;
        }
        if (!this.#data.portfolios[id]) {
             console.warn(`Portfolio with ID ${id} not found for deletion.`);
             return false;
        }

        delete this.#data.portfolios[id];
        localStorage.removeItem(CONFIG.DATA_PREFIX + id);
        this.#transactionCache.clear(); // 전체 캐시 클리어 (간단하게)

        // 활성 포트폴리오 ID 재설정
        if (this.#activePortfolioId === id) { // 삭제된 것이 활성 포트폴리오였다면
             const remainingIds = Object.keys(this.#data.portfolios);
             // 남아있는 첫 번째 포트폴리오를 활성화, 없으면 null
             this.setActivePortfolioId(remainingIds.length > 0 ? remainingIds[0] : null);
        } else {
             this.saveMeta(); // 활성 ID는 그대로 두고 메타만 저장 (필요 없을 수 있음)
        }

        return true;
    }

    /**
     * @description 포트폴리오 이름을 변경합니다.
     * @param {string} id - 변경할 포트폴리오 ID
     * @param {string} newName - 새 이름
     * @returns {boolean} 변경 성공 여부
     */
    renamePortfolio(id, newName) {
        const portfolio = this.#data.portfolios[id];
        if (portfolio && newName && newName.trim()) { // 이름 유효성 검사 추가
            portfolio.name = newName.trim();
            this.saveActivePortfolio(); // 현재 활성 포트폴리오면 바로 저장
            return true;
        }
        return false;
    }


    /**
     * @description 활성 포트폴리오 ID를 설정합니다.
     * @param {string | null} id - 새로운 활성 포트폴리오 ID (null 가능)
     */
    setActivePortfolioId(id) {
         // ID가 null이거나, 존재하지 않는 포트폴리오 ID인 경우 처리
         if (id === null || this.#data.portfolios[id]) {
            this.#activePortfolioId = id;
            this.saveMeta();
            this.#transactionCache.clear(); // 포트폴리오 변경 시 캐시 클리어
            console.log(`Active portfolio ID changed to: ${id}`); // 로그 추가
         } else {
             console.warn(`Attempted to set active portfolio to non-existent ID: ${id}`);
         }
    }


    // --- 주식 데이터 관리 ---

    /**
     * @description 활성 포트폴리오 데이터를 가져옵니다.
     * @returns {Portfolio | undefined}
     */
    getActivePortfolio() {
        if (this.#activePortfolioId) {
            return this.#data.portfolios[this.#activePortfolioId];
        }
        return undefined;
    }

    /**
     * @description 모든 포트폴리오 목록을 (ID: Portfolio) 객체로 가져옵니다.
     * @returns {Record<string, Portfolio>}
     */
    getAllPortfolios() {
        return this.#data.portfolios;
    }

    /**
     * @description 특정 주식의 데이터를 가져옵니다.
     * @param {string} stockId - 주식 ID
     * @returns {Stock | undefined}
     */
    getStockById(stockId) {
        const portfolio = this.getActivePortfolio();
        return portfolio?.portfolioData?.find(s => s.id === stockId); // portfolioData null 체크 추가
    }


    /**
     * @description 새 주식을 포트폴리오에 추가합니다.
     * @returns {Stock | null}
     */
    addNewStock() {
        const portfolio = this.getActivePortfolio();
        if (portfolio) {
             // portfolioData가 배열이 아니거나 없으면 초기화
            if (!Array.isArray(portfolio.portfolioData)) {
                portfolio.portfolioData = [];
            }

            /** @type {Stock} */
            const newStock = {
                id: `s-${Date.now()}`,
                name: '새 종목',
                ticker: '',
                sector: '미분류',
                currentPrice: 0,
                targetRatio: 0,
                isFixedBuyEnabled: false,
                fixedBuyAmount: 0,
                transactions: [],
                _sortedTransactions: []
            };
            portfolio.portfolioData.push(newStock);
            this.saveActivePortfolio();
            return newStock;
        }
        return null;
    }


    /**
     * @description 포트폴리오에서 주식을 제거합니다.
     * @param {string} stockId - 제거할 주식 ID
     * @returns {boolean}
     */
    deleteStock(stockId) {
        const portfolio = this.getActivePortfolio();
        if (portfolio && Array.isArray(portfolio.portfolioData)) { // portfolioData 배열 확인
            if (portfolio.portfolioData.length <= 1) {
                console.warn("Cannot delete the last stock.");
                return false;
            }
            const initialLength = portfolio.portfolioData.length;
            portfolio.portfolioData = portfolio.portfolioData.filter(s => s.id !== stockId);
            // 삭제가 실제로 일어났는지 확인
            if (portfolio.portfolioData.length < initialLength) {
                this.#transactionCache.delete(stockId);
                this.saveActivePortfolio();
                return true;
            }
        }
        return false;
    }


    /**
     * @description 주식 속성 (이름, 티커, 목표 비율 등)을 업데이트합니다.
     * @param {string} stockId - 주식 ID
     * @param {string} field - 업데이트할 속성 이름
     * @param {string | number | boolean} value - 새로운 값
     */
    updateStockProperty(stockId, field, value) {
        const stock = this.getStockById(stockId);
        if (stock) {
            // @ts-ignore - 동적 속성 할당 허용
            // 필드별 유효성 검사 또는 타입 변환 추가 가능
            if (field === 'targetRatio' || field === 'currentPrice' || field === 'fixedBuyAmount') {
                 // 숫자로 변환 시도, 실패하면 0으로
                 const numValue = Number(value);
                 // @ts-ignore
                 stock[field] = isNaN(numValue) ? 0 : numValue;
            } else if (field === 'isFixedBuyEnabled') {
                 // @ts-ignore
                 stock[field] = Boolean(value);
            } else {
                 // @ts-ignore
                 stock[field] = String(value); // 기본적으로 문자열로 저장
            }
            this.saveActivePortfolio();
        } else {
            console.warn(`Stock with ID ${stockId} not found for update.`);
        }
    }


    // --- 거래 내역 관리 ---

    /**
     * @description 특정 주식의 거래 내역을 가져옵니다 (캐싱 적용).
     * @param {string} stockId - 주식 ID
     * @returns {Stock['transactions']} 정렬된 거래 내역
     */
    getTransactions(stockId) {
        const stock = this.getStockById(stockId);
        // _sortedTransactions가 없으면 transactions를 정렬해서 반환 (방어 코드)
        return stock?._sortedTransactions || this._sortTransactions(stock?.transactions || []);
    }


    /**
     * @description 새 거래를 추가합니다.
     * @param {string} stockId - 주식 ID
     * @param {{type: 'buy'|'sell', date: string, quantity: number | Decimal, price: number | Decimal}} txData - 거래 데이터
     * @returns {Promise<boolean>}
     */
    async addTransaction(stockId, txData) {
        const stock = this.getStockById(stockId);
        if (stock) {
             // transactions 배열이 없으면 초기화
            if (!Array.isArray(stock.transactions)) {
                stock.transactions = [];
            }
            /** @type {Stock['transactions'][number]} */
            const newTx = {
                id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // 고유성 강화
                type: txData.type,
                date: txData.date,
                quantity: await createDecimal(txData.quantity), // createDecimal 사용
                price: await createDecimal(txData.price),       // createDecimal 사용
            };
            stock.transactions.push(newTx);
            stock._sortedTransactions = this._sortTransactions(stock.transactions);
            this.saveActivePortfolio();
            return true;
        }
        console.warn(`Stock with ID ${stockId} not found for adding transaction.`);
        return false;
    }


    /**
     * @description 거래 내역을 삭제합니다.
     * @param {string} stockId - 주식 ID
     * @param {string} transactionId - 거래 ID
     * @returns {boolean}
     */
    deleteTransaction(stockId, transactionId) {
        const stock = this.getStockById(stockId);
        if (stock && Array.isArray(stock.transactions)) { // transactions 배열 확인
            const initialLength = stock.transactions.length;
            stock.transactions = stock.transactions.filter(tx => tx.id !== transactionId);
            // 삭제가 일어났는지 확인
            if (stock.transactions.length < initialLength) {
                stock._sortedTransactions = this._sortTransactions(stock.transactions);
                this.saveActivePortfolio();
                return true;
            }
        }
        return false;
    }


    // --- 유틸리티 ---
    // --- ⬇️ [수정됨] getRatioSum을 동기 방식으로 변경 (utils.js 내용 가져옴) ⬇️ ---
    /**
     * @description 현재 활성 포트폴리오의 목표 비율 합계를 동기적으로 계산합니다.
     * @returns {Decimal} 목표 비율 합계 (Decimal 객체)
     */
    getRatioSum() {
        const portfolio = this.getActivePortfolio();
        let sum = new Decimal(0);
        if (!portfolio || !Array.isArray(portfolio.portfolioData)) return sum; // 방어 코드

        for (const s of portfolio.portfolioData) {
            const ratio = new Decimal(s.targetRatio || 0);
            sum = sum.plus(ratio);
        }
        return sum;
    }
    // --- ⬆️ [수정됨] ⬆️ ---

    /**
     * @description 목표 비율의 합계를 100%로 정규화합니다. (비동기 유지 - createDecimal 사용)
     * @returns {Promise<boolean>} 정규화 성공 여부 Promise
     */
    async normalizeRatios() {
        const portfolio = this.getActivePortfolio();
        if (!portfolio || !Array.isArray(portfolio.portfolioData) || portfolio.portfolioData.length === 0) return false;

        const portfolioData = portfolio.portfolioData;
        const currentSum = this.getRatioSum(); // 동기 함수 호출

        if (currentSum.isZero() || currentSum.isNaN()) { // NaN 체크 추가
             console.warn("Cannot normalize ratios with zero or NaN sum.");
             return false;
        }

        const hundred = await createDecimal(100); // 비동기
        const multiplier = hundred.div(currentSum);

        let needsSave = false; // 변경 사항 확인 플래그
        for (const stock of portfolioData) {
            const currentRatio = stock.targetRatio || 0;
            // Decimal 생성 후 계산하고 다시 숫자로 변환
            const ratioDec = await createDecimal(currentRatio); // 비동기
            const newRatioNum = ratioDec.times(multiplier).toDecimalPlaces(2).toNumber(); // 소수점 2자리 반올림

            // 값이 변경되었을 때만 업데이트하고 플래그 설정
            if (stock.targetRatio !== newRatioNum) {
                stock.targetRatio = newRatioNum;
                needsSave = true;
            }
        }

        if (needsSave) {
            this.saveActivePortfolio(); // 변경 사항이 있을 때만 저장
        }
        return true;
    }


    /**
     * @description 포트폴리오의 설정(통화, 환율, 모드 등)을 업데이트합니다.
     * @param {string} field - 업데이트할 설정 속성
     * @param {string | number} value - 새로운 값
     */
    updatePortfolioSettings(field, value) {
        const portfolio = this.getActivePortfolio();
        if (portfolio?.settings) { // settings 객체 존재 확인
            // @ts-ignore - 동적 할당
            let newValue = value;
            // 타입 검사/변환 강화
            if (field === 'exchangeRate') {
                 const numValue = Number(value);
                 newValue = isNaN(numValue) || numValue <= 0 ? CONFIG.DEFAULT_EXCHANGE_RATE : numValue;
            } else if (field === 'mainMode' && value !== 'add' && value !== 'sell') {
                 newValue = 'add'; // 기본값
            } else if (field === 'currentCurrency' && value !== 'krw' && value !== 'usd') {
                 newValue = 'krw'; // 기본값
            }
            // @ts-ignore
            if (portfolio.settings[field] !== newValue) { // 값이 변경되었을 때만 저장
                 // @ts-ignore
                 portfolio.settings[field] = newValue;
                 this.saveActivePortfolio();
            }
        } else {
             console.warn("Cannot update settings: Active portfolio or settings not found.");
        }
    }


    /**
     * @description 외부에서 JSON 데이터를 로드합니다. (비동기)
     * @param {PortfolioDataStructure} loadedData - 로드된 전체 포트폴리오 데이터
     * @returns {Promise<void>}
     */
    async importData(loadedData) {
        if (!loadedData || typeof loadedData.portfolios !== 'object' || !loadedData.activePortfolioId) {
            throw new Error('Invalid data structure for import.');
        }

        // 기존 로컬 스토리지 데이터 삭제 (덮어쓰기)
        this.getAllPortfolioIdsFromLocalStorage().forEach(id => {
             localStorage.removeItem(CONFIG.DATA_PREFIX + id);
        });

        const newPortfolios = {};
        // Promise.all로 병렬 처리 및 에러 핸들링 강화
        try {
            await Promise.all(Object.keys(loadedData.portfolios).map(async (id) => {
                 const portfolioData = loadedData.portfolios[id];
                 if (!portfolioData) return; // 데이터 없으면 건너뛰기

                 // Deserialize each portfolio
                 newPortfolios[id] = await this._deserializePortfolioData(portfolioData);
                 // Save immediately to local storage to ensure persistence
                 const serializedData = this._serializePortfolioData(newPortfolios[id]);
                 localStorage.setItem(CONFIG.DATA_PREFIX + id, JSON.stringify(serializedData));
            }));
        } catch (deserializeError) {
             console.error("Error during data import deserialization:", deserializeError);
             // 임포트 실패 시 롤백 또는 사용자 알림 필요
             // 예: 이전 상태로 복구 시도 또는 오류 메시지 표시
             throw new Error("Failed to deserialize imported data."); // 에러 다시 던지기
        }


        this.#data.portfolios = newPortfolios;

        // activePortfolioId 유효성 검사 후 설정
        if (newPortfolios[loadedData.activePortfolioId]) {
             this.setActivePortfolioId(loadedData.activePortfolioId);
        } else {
             // 유효하지 않으면 로드된 첫 번째 포트폴리오를 활성화
             const firstLoadedId = Object.keys(newPortfolios)[0];
             this.setActivePortfolioId(firstLoadedId || null); // 포트폴리오가 없을 수도 있음
        }
        // this.saveMeta(); // setActivePortfolioId에 포함됨
        this.#transactionCache.clear();
         console.log("Data imported successfully."); // 성공 로그
    }


    /**
     * @description 모든 포트폴리오 데이터를 JSON으로 내보냅니다.
     * @returns {PortfolioDataStructure}
     */
    exportData() {
        const exportedPortfolios = {};
        for (const id in this.#data.portfolios) {
            // hasOwnProperty 체크 추가 (안전성)
            if (Object.prototype.hasOwnProperty.call(this.#data.portfolios, id)) {
                // 직렬화하여 일반 숫자 형태로 내보내기
                exportedPortfolios[id] = this._serializePortfolioData(this.#data.portfolios[id]);
            }
        }
        return {
            portfolios: exportedPortfolios,
            activePortfolioId: this.#activePortfolioId || '' // null 대신 빈 문자열
        };
    }

    /**
     * @description 모든 데이터를 초기화하고 기본 포트폴리오를 생성합니다.
     */
    resetData() {
        // 모든 포트폴리오 데이터 삭제
        const portfolioIds = this.getAllPortfolioIdsFromLocalStorage();
        portfolioIds.forEach(id => localStorage.removeItem(CONFIG.DATA_PREFIX + id));
        localStorage.removeItem(CONFIG.META_KEY);

        this.#data = { portfolios: {}, activePortfolioId: '' };
        this.#activePortfolioId = null;
        this.#transactionCache.clear();
        this.createNewPortfolio('기본 포트폴리오'); // 기본 포트폴리오 생성
         console.log("All data reset. Default portfolio created."); // 로그 추가
    }

} // End of PortfolioState class