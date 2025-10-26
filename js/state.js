// @ts-check
import { CONFIG } from './constants.js';
import { getRatioSum } from './utils.js'; // [수정] 비동기 getRatioSum 임포트
import { ErrorService } from './errorService.js';
import { Validator } from './validator.js';
import { createDecimal } from './decimalLoader.js'; // [수정] createDecimal 헬퍼 임포트

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */
/** @typedef {import('./types.js').Portfolio} Portfolio */
/** @typedef {import('./types.js').PortfolioSettings} PortfolioSettings */
/** @typedef {import('./types.js').PortfolioDataStructure} PortfolioDataStructure */
/** @typedef {import('decimal.js').Decimal} Decimal */

// 상태 관리를 위한 싱글톤 객체
export class PortfolioState {
    /** @type {PortfolioDataStructure} */
    #data;
    /** @type {string | null} */
    #activePortfolioId;

    /** @type {Map<string, CalculatedStock['transactions']>} */
    #transactionCache = new Map();

    constructor() {
        this.#data = { portfolios: {}, activePortfolioId: '' };
        this.#activePortfolioId = null;
        this.loadInitialState();
    }

    // --- 초기 로딩 및 저장 ---

    // ⬇️ [수정] 'expected 2 to be 1' 오류 해결을 위한 로직 수정
    loadInitialState() {
        try {
            const metaJson = localStorage.getItem(CONFIG.META_KEY);
            if (metaJson) {
                const meta = JSON.parse(metaJson);
                this.#activePortfolioId = meta.activePortfolioId;
            }

            // 1. 모든 포트폴리오 ID 로드
            const portfolioIds = this.getAllPortfolioIdsFromLocalStorage();
            
            if (portfolioIds.length > 0) {
                // 2. 각 포트폴리오 데이터 로드 및 역직렬화
                portfolioIds.forEach(id => {
                    const dataJson = localStorage.getItem(CONFIG.DATA_PREFIX + id);
                    if (dataJson) {
                        try {
                            const loadedData = JSON.parse(dataJson);
                            // Validator 대신 _deserializePortfolioData를 사용하여
                            // 데이터를 변환하고 기본 구조를 보장합니다.
                            this.#data.portfolios[id] = this._deserializePortfolioData(loadedData);
                        } catch (parseError) {
                            console.warn(`[State] Invalid JSON for portfolio ID: ${id}. Skipping.`, parseError);
                        }
                    }
                });
            }
            
            // --- [수정된 핵심 로직] ---
            const loadedPortfolioIds = Object.keys(this.#data.portfolios);

            if (loadedPortfolioIds.length > 0) {
                // 3. 포트폴리오가 1개 이상 로드된 경우
                // 4. activePortfolioId가 유효한지(로드된 목록에 있는지) 확인
                if (!this.#activePortfolioId || !this.#data.portfolios[this.#activePortfolioId]) {
                    // 5. 유효하지 않으면, 로드된 포트폴리오 중 첫 번째 것을 활성 ID로 강제 지정
                    this.#activePortfolioId = loadedPortfolioIds[0];
                }
                // (중요) 이 경우 'Default Portfolio'를 생성하지 않습니다.
            } else {
                // 6. 로드된 포트폴리오가 *아무것도* 없을 때만 새로 생성
                // [수정] 테스트 케이스와 일치하도록 '기본 포트폴리오'로 변경
                this.createNewPortfolio('기본 포트폴리오');
            }
            // --- [로직 수정 끝] ---

            this.saveMeta(); // (수정됐을 수 있는) 활성 ID 설정 저장
        } catch (e) {
            ErrorService.handle(/** @type {Error} */(e), 'loadInitialState');
            // 치명적 로딩 실패 시에도 기본 포트폴리오 생성
            if (Object.keys(this.#data.portfolios).length === 0) {
                // [수정] 테스트 케이스와 일치하도록 '기본 포트폴리오'로 변경
                this.createNewPortfolio('기본 포트폴리오');
            }
        }
    }
    // ⬆️ [수정]

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
        }
    }

    // --- 데이터 직렬화/역직렬화 ---

    /**
     * @description 저장 전 데이터를 Decimal 객체에서 일반 숫자로 변환합니다.
     * @param {Portfolio} portfolio - 포트폴리오 데이터
     * @returns {any}
     */
    _serializePortfolioData(portfolio) {
        return {
            ...portfolio,
            portfolioData: portfolio.portfolioData.map(stock => ({
                ...stock,
                transactions: stock.transactions.map(tx => ({
                    ...tx,
                    // [수정] Decimal 객체 확인 후 toNumber() 호출
                    quantity: (tx.quantity && typeof tx.quantity === 'object' && 'toNumber' in tx.quantity) ? tx.quantity.toNumber() : Number(tx.quantity || 0),
                    price: (tx.price && typeof tx.price === 'object' && 'toNumber' in tx.price) ? tx.price.toNumber() : Number(tx.price || 0),
                })),
                // targetRatio, currentPrice, fixedBuyAmount는 이미 number 타입으로 관리됨
            })),
            // settings는 이미 number/string 타입으로 구성됨
        };
    }

    /**
     * @description 로드 후 데이터를 일반 숫자에서 Decimal 객체로 변환합니다. (비동기)
     * @param {any} loadedData - 로드된 데이터 (숫자 형태)
     * @returns {Promise<Portfolio>}
     */
    async _deserializePortfolioData(loadedData) {
        // [수정] createDecimal이 비동기이므로, map 내부에서 Promise.all을 사용해야 합니다.
        const portfolioData = await Promise.all(
            (loadedData.portfolioData || []).map(async (stock) => {
                // Ensure required fields are present with default values if necessary
                const name = stock.name || 'Untitled Stock';
                const ticker = stock.ticker || 'TICKER';
                const sector = stock.sector || '미분류'; // [수정] 섹터 기본값 추가
                const currentPrice = Number(stock.currentPrice) || 0;
                const targetRatio = Number(stock.targetRatio) || 0;
                const fixedBuyAmount = Number(stock.fixedBuyAmount) || 0;

                const transactions = await Promise.all(
                    (stock.transactions || []).map(async (tx) => ({
                        id: tx.id,
                        type: tx.type,
                        date: tx.date,
                        // 수량과 가격을 Decimal 객체로 변환
                        quantity: await createDecimal(tx.quantity || 0),
                        price: await createDecimal(tx.price || 0),
                    }))
                );

                return {
                    id: stock.id,
                    name: name,
                    ticker: ticker,
                    sector: sector, // [수정] 섹터 필드 추가
                    currentPrice: currentPrice,
                    targetRatio: targetRatio,
                    isFixedBuyEnabled: stock.isFixedBuyEnabled || false,
                    fixedBuyAmount: fixedBuyAmount,
                    transactions: transactions,
                    _sortedTransactions: this._sortTransactions(transactions) // [수정] 정렬 캐시 추가
                };
            })
        );
        
        return {
            ...loadedData,
            portfolioData: portfolioData,
        };
    }
    
    /**
     * @description 트랜잭션을 정렬하고 캐시합니다. (state 내부 유틸리티)
     * @param {Stock['transactions']} transactions
     * @returns {Stock['transactions']}
     */
    _sortTransactions(transactions) {
         return [...transactions].sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.id.localeCompare(b.id); // 날짜 같으면 ID로 안정 정렬
        });
    }


    // --- 포트폴리오 관리 ---

    /**
     * @description 새로운 포트폴리오를 생성하고 활성화합니다.
     * @param {string} name - 포트폴리오 이름
     * @returns {string} 새로 생성된 포트폴리오 ID
     */
    createNewPortfolio(name) {
        const newId = `p-${Date.now()}`;
        /** @type {PortfolioSettings} */
        const defaultSettings = {
            mainMode: 'add',
            currentCurrency: 'krw',
            // [수정] exchangeRate는 number 타입이어야 함
            exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE, 
        };

        /** @type {Portfolio} */
        const newPortfolio = {
            // [수정] id와 name은 Portfolio 타입의 최상위에 위치
            id: newId,
            name: name,
            settings: defaultSettings,
            portfolioData: [], // 기본 템플릿 대신 빈 배열로 시작
        };

        this.#data.portfolios[newId] = newPortfolio;
        this.setActivePortfolioId(newId);
        this.saveActivePortfolio(); // 이 시점에 빈 포트폴리오 저장
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
        if (!this.#data.portfolios[id]) return false;

        delete this.#data.portfolios[id];
        localStorage.removeItem(CONFIG.DATA_PREFIX + id);
        this.#transactionCache.clear(); // 캐시 클리어

        // 활성 포트폴리오 ID 재설정
        const remainingIds = Object.keys(this.#data.portfolios);
        this.setActivePortfolioId(remainingIds[0]); // saveMeta()는 setActivePortfolioId 내부에서 호출됨

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
        if (portfolio) {
            portfolio.name = newName;
            this.saveActivePortfolio(); // 현재 활성 포트폴리오면 바로 저장
            return true;
        }
        return false;
    }


    /**
     * @description 활성 포트폴리오 ID를 설정합니다.
     * @param {string} id - 새로운 활성 포트폴리오 ID
     */
    setActivePortfolioId(id) {
        if (this.#data.portfolios[id]) {
            this.#activePortfolioId = id;
            this.saveMeta();
            this.#transactionCache.clear(); // 포트폴리오 변경 시 캐시 클리어
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
        return portfolio?.portfolioData.find(s => s.id === stockId);
    }

    /**
     * @description 새 주식을 포트폴리오에 추가합니다.
     * @returns {Stock | null}
     */
    addNewStock() {
        const portfolio = this.getActivePortfolio();
        if (portfolio) {
            /** @type {Stock} */
            const newStock = {
                id: `s-${Date.now()}`,
                name: '새 종목', // [수정] 기본 이름 제공
                ticker: '',
                sector: '미분류', // [수정] 기본 섹터 제공
                currentPrice: 0,
                targetRatio: 0,
                isFixedBuyEnabled: false,
                fixedBuyAmount: 0,
                transactions: [],
                _sortedTransactions: [] // [수정] 정렬 캐시 초기화
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
        if (portfolio) {
             // [수정] 마지막 주식은 삭제하지 못하도록 방어 로직 추가
            if (portfolio.portfolioData.length <= 1) {
                console.warn("Cannot delete the last stock.");
                return false;
            }
            portfolio.portfolioData = portfolio.portfolioData.filter(s => s.id !== stockId);
            this.#transactionCache.delete(stockId); // [수정] 해당 주식 캐시만 삭제
            this.saveActivePortfolio();
            return true;
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
            // @ts-ignore
            stock[field] = value;
            this.saveActivePortfolio();
        }
    }

    // --- 거래 내역 관리 ---

    /**
     * @description 특정 주식의 거래 내역을 가져옵니다 (캐싱 적용).
     * @param {string} stockId - 주식 ID
     * @returns {Stock['transactions']} 정렬된 거래 내역
     */
    getTransactions(stockId) {
        // [수정] _sortedTransactions 캐시를 사용
        const stock = this.getStockById(stockId);
        return stock?._sortedTransactions || [];
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
            /** @type {Stock['transactions'][number]} */
            const newTx = {
                id: `tx-${Date.now()}`,
                type: txData.type,
                date: txData.date,
                // [수정] 입력값이 Decimal이 아닐 수 있으므로 createDecimal 사용
                quantity: await createDecimal(txData.quantity),
                price: await createDecimal(txData.price),
            };
            stock.transactions.push(newTx);
            // [수정] 정렬 캐시 업데이트
            stock._sortedTransactions = this._sortTransactions(stock.transactions);
            this.saveActivePortfolio();
            return true;
        }
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
        if (stock) {
            stock.transactions = stock.transactions.filter(tx => tx.id !== transactionId);
            // [수정] 정렬 캐시 업데이트
            stock._sortedTransactions = this._sortTransactions(stock.transactions);
            this.saveActivePortfolio();
            return true;
        }
        return false;
    }

    // --- 유틸리티 ---

    /**
     * @description 현재 활성 포트폴리오의 목표 비율 합계를 계산합니다.
     * @returns {Promise<Decimal>} 목표 비율 합계 Promise
     */
    async getRatioSum() {
        const portfolio = this.getActivePortfolio();
        if (!portfolio) return await createDecimal(0);

        // [수정] 비동기 getRatioSum 함수(구 utils.js)를 await로 호출
        return await getRatioSum(portfolio.portfolioData);
    }

    /**
     * @description 목표 비율의 합계를 100%로 정규화합니다.
     * @returns {Promise<boolean>} 정규화 성공 여부 Promise
     */
    async normalizeRatios() {
        const portfolio = this.getActivePortfolio();
        if (!portfolio || portfolio.portfolioData.length === 0) return false;

        const portfolioData = portfolio.portfolioData;
        const currentSum = await this.getRatioSum(); // [수정] await

        if (currentSum.isZero()) return false;

        const multiplier = (await createDecimal(100)).div(currentSum); // [수정] await

        for (const stock of portfolioData) {
            // targetRatio는 number 타입이므로, Decimal로 변환 후 계산
            const ratioDec = await createDecimal(stock.targetRatio); // [수정] await
            stock.targetRatio = ratioDec.times(multiplier).toNumber();
        }

        this.saveActivePortfolio();
        return true;
    }

    /**
     * @description 포트폴리오의 설정(통화, 환율, 모드 등)을 업데이트합니다.
     * @param {string} field - 업데이트할 설정 속성
     * @param {string | number} value - 새로운 값
     */
    updatePortfolioSettings(field, value) {
        const portfolio = this.getActivePortfolio();
        if (portfolio && portfolio.settings) { // [수정] settings 확인
            // @ts-ignore
            portfolio.settings[field] = value;
            this.saveActivePortfolio();
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

        const newPortfolios = {};
        // [수정] for...in 루프를 Promise.all로 변환
        await Promise.all(Object.keys(loadedData.portfolios).map(async (id) => {
             // Deserialize each portfolio
            newPortfolios[id] = await this._deserializePortfolioData(loadedData.portfolios[id]);
            // Save immediately to local storage to ensure persistence
            const serializedData = this._serializePortfolioData(newPortfolios[id]);
            localStorage.setItem(CONFIG.DATA_PREFIX + id, JSON.stringify(serializedData));
        }));


        this.#data.portfolios = newPortfolios;
        this.setActivePortfolioId(loadedData.activePortfolioId);
        // this.saveMeta(); // setActivePortfolioId에 포함됨
        this.#transactionCache.clear();
    }

    /**
     * @description 모든 포트폴리오 데이터를 JSON으로 내보냅니다.
     * @returns {PortfolioDataStructure}
     */
    exportData() {
        const exportedPortfolios = {};
        for (const id in this.#data.portfolios) {
            if (Object.prototype.hasOwnProperty.call(this.#data.portfolios, id)) {
                // 직렬화하여 일반 숫자 형태로 내보내기
                exportedPortfolios[id] = this._serializePortfolioData(this.#data.portfolios[id]);
            }
        }
        return {
            portfolios: exportedPortfolios,
            activePortfolioId: this.#activePortfolioId || ''
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
        // [수정] 테스트 케이스와 일치하도록 '기본 포트폴리오'로 변경
        this.createNewPortfolio('기본 포트폴리오');
    }
}