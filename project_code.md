# 📊 포트폴리오 리밸런싱 계산기 전체 코드 (최종 수정본)

이 마크다운 파일은 디버깅, 리팩토링, 보안, 반응형 디자인 및 신규 기능(JSON 입출력, 섹터 분석, 다중 포트폴리오 관리, 차트 시각화)이 모두 적용된 프로젝트의 모든 코드 파일을 포함하고 있습니다.

---

## `package.json`

```json
{
  "name": "portfolio-rebalancer",
  "version": "1.0.0",
  "description": "",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "vite": "^7.1.10"
  },
  "dependencies": {
    "chart.js": "^4.5.1",
    "decimal.js": "^10.6.0"
  }
}
```

---

## `vite.config.js`

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
});
```

---
## `.gitignore`

```gitignore
# dependencies
node_modules

# build output
dist
```

---

## `index.html`

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>포트폴리오 리밸런싱 계산기 (플래티넘版)</title>
    <meta name="description" content="포트폴리오 리밸런싱 계산기를 통해 목표 비율에 맞춰 투자 전략을 최적화하세요.">
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --bg-color: #f5f5f5; --text-color: #333; --card-bg: white; --card-shadow: rgba(0,0,0,0.1);
            --border-color: #eee; --accent-color: #667eea; --input-border: #e9ecef; --input-bg: white;
            --header-grad: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --green-grad: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            --orange-grad: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            --blue-grad: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            --grey-grad: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
        }
        body.dark-mode {
            --bg-color: #1a1a1a; --text-color: #e0e0e0; --card-bg: #2d2d2d; --card-shadow: rgba(0,0,0,0.5);
            --border-color: #444; --input-border: #555; --input-bg: #3d3d3d;
        }
        body { 
            font-family: 'Segoe UI', sans-serif; 
            line-height: 1.6; 
            color: var(--text-color); 
            background-color: var(--bg-color); 
            transition: background-color 0.3s, color 0.3s; 
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: var(--header-grad); color: white; padding: 30px; border-radius: 15px; 
            margin-bottom: 30px; text-align: center; box-shadow: 0 10px 30px var(--card-shadow); 
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .card { 
            background: var(--card-bg); border-radius: 15px; padding: 25px; 
            margin-bottom: 25px; box-shadow: 0 5px 20px var(--card-shadow); 
            transition: background-color 0.3s, box-shadow 0.3s; 
        }
        .card h2 { color: var(--accent-color); margin-bottom: 20px; font-size: 1.5rem; }
        .btn { 
            background: var(--header-grad); color: white; border: none; padding: 12px 25px; border-radius: 8px; 
            cursor: pointer; font-size: 1rem; font-weight: 600;
        }
        .btn--green { background: var(--green-grad); }
        .btn--orange { background: var(--orange-grad); }
        .btn--blue { background: var(--blue-grad); }
        .btn--grey { background: var(--grey-grad); }
    </style>
    
    <link rel="stylesheet" href="/style.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="/style.css"></noscript>
</head>
<body>
    <button id="darkModeToggle" class="btn dark-mode-toggle" aria-label="다크 모드 전환">🌙</button>
    <div class="container">
        <header class="header">
            <h1>📊 포트폴리오 리밸런싱 계산기</h1>
            <p>목표 비율에 맞춰 포트폴리오를 조정하는 최적의 방법을 계산합니다.</p>
        </header>

        <main>
            <section class="card">
                <h2>📁 포트폴리오 관리</h2>
                <div class="input-group">
                    <label for="portfolioSelector">현재 포트폴리오:</label>
                    <select id="portfolioSelector" class="input-group__select"></select>
                </div>
                <div class="btn-controls">
                    <button id="newPortfolioBtn" class="btn btn--green">➕ 새로 만들기</button>
                    <button id="renamePortfolioBtn" class="btn btn--blue">✏️ 이름 변경</button>
                    <button id="deletePortfolioBtn" class="btn btn--orange">🗑️ 삭제</button>
                </div>
            </section>

            <section class="card">
                <h2>⚙️ 계산 모드 선택</h2>
                <div class="mode-selector">
                    <label for="modeAdd"><input type="radio" name="mainMode" value="add" id="modeAdd" checked> ➕ 추가 매수 모드</label>
                    <label for="modeSell"><input type="radio" name="mainMode" value="sell" id="modeSell"> ⚖️ 매도 리밸런싱 모드</label>
                </div>
            </section>

            <section class="card">
                <h2>💼 현재 포트폴리오 설정</h2>
                <div class="btn-controls">
                    <button id="addNewStockBtn" class="btn btn--green">➕ 새 종목 추가</button>
                    <button id="resetDataBtn" class="btn btn--orange">🔄 초기화</button>
                    <button id="normalizeRatiosBtn" class="btn btn--blue">⚖️ 비율 자동 맞춤(100%)</button>
                    <button id="saveDataBtn" class="btn btn--blue">💾 저장</button>
                    <button id="loadDataBtn" class="btn btn--grey">📂 불러오기</button>
                    <button id="exportDataBtn" class="btn btn--blue">📤 내보내기 (JSON)</button>
                    <button id="importDataBtn" class="btn btn--grey">📥 가져오기 (JSON)</button>
                    <input type="file" id="importFileInput" accept=".json" style="display: none;">
                </div>
                <div class="table-responsive">
                    <table id="portfolioTable">
                        <thead id="portfolioTableHead"></thead>
                        <tbody id="portfolioBody"></tbody>
                    </table>
                </div>
                <div id="ratioValidator" class="ratio-validator">
                    <strong>목표 비율 합계:</strong>
                    <span class="ratio-value" id="ratioSum">0%</span>
                </div>
            </section>

            <section id="addInvestmentCard" class="card">
                <h2>💰 추가 투자금 계산</h2>
                <div class="mode-selector">
                    <label for="currencyKRW"><input type="radio" name="currencyMode" value="krw" id="currencyKRW" checked> 원화(KRW) 기준</label>
                    <label for="currencyUSD"><input type="radio" name="currencyMode" value="usd" id="currencyUSD"> 달러(USD) 기준</label>
                </div>
                <div id="exchangeRateGroup" class="input-group hidden">
                    <label for="exchangeRate">환율 (1 USD):</label>
                    <input type="number" id="exchangeRate" placeholder="예: 1300" min="0.01" step="0.01" value="1300">
                </div>
                <div class="input-group">
                    <label for="additionalAmount">추가 투자 금액:</label>
                    <input type="number" id="additionalAmount" placeholder="예: 1000000" min="0">
                    <span id="usdInputGroup" class="hidden" style="display: contents;">
                        <span style="margin: 0 10px;">또는</span>
                        <label for="additionalAmountUSD" class="hidden">USD</label>
                        <input type="number" id="additionalAmountUSD" placeholder="예: 1000" min="0" step="0.01">
                        <span>USD</span>
                    </span>
                </div>
            </section>
            
            <button id="calculateBtn" class="btn" style="width: 100%; padding: 15px; font-size: 1.2rem; margin-bottom: 25px;">계산하기</button>
            
            <section id="resultsSection" class="hidden" aria-live="polite"></section>
            <section id="sectorAnalysisSection" class="hidden"></section>
            <section id="chartSection" class="card hidden">
                <h2>📊 포트폴리오 시각화</h2>
                <div>
                    <canvas id="portfolioChart"></canvas>
                </div>
            </section>
        </main>
    </div>

    <div id="transactionModal" class="modal-overlay hidden">
        <div class="modal-content card">
            <div class="modal-header">
                <h2 id="modalStockName">거래 내역 관리</h2>
                <button id="closeModalBtn" class="modal-close-btn" aria-label="닫기">&times;</button>
            </div>
            
            <div class="table-responsive" style="margin-bottom: 20px;">
                <table id="transactionTable">
                    <caption>거래 내역 목록</caption>
                    <thead>
                        <tr>
                            <th>날짜</th><th>종류</th><th>수량</th><th>단가</th><th>총액</th><th>작업</th>
                        </tr>
                    </thead>
                    <tbody id="transactionListBody"></tbody>
                </table>
            </div>

            <form id="newTransactionForm">
                <h3>새 거래 추가</h3>
                <div class="mode-selector" style="margin-bottom: 15px;">
                    <label><input type="radio" name="txType" value="buy" checked> 매수</label>
                    <label><input type="radio" name="txType" value="sell"> 매도</label>
                </div>
                <div class="input-grid">
                    <div class="input-group-vertical">
                        <label for="txDate">날짜</label>
                        <input type="date" id="txDate" required>
                    </div>
                    <div class="input-group-vertical">
                        <label for="txQuantity">수량</label>
                        <input type="number" id="txQuantity" placeholder="예: 10" min="0" step="any" required>
                    </div>
                    <div class="input-group-vertical">
                        <label for="txPrice">단가</label>
                        <input type="number" id="txPrice" placeholder="예: 150000" min="0" step="any" required>
                    </div>
                </div>
                <button type="submit" class="btn btn--blue" style="width: 100%; margin-top: 15px;">💾 거래 추가</button>
            </form>
        </div>
    </div>

    <script type="module" src="/js/main.js"></script>
</body>
</html>
```

---

## `style.css`

```css
/* --- 기본 설정 및 테마 --- */
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
    --bg-color: #f5f5f5; --text-color: #333; --card-bg: white; --card-shadow: rgba(0,0,0,0.1);
    --border-color: #eee; --accent-color: #667eea; --input-border: #e9ecef; --input-bg: white;
    --header-grad: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --green-grad: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    --orange-grad: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
    --red-grad: linear-gradient(135deg,#dc3545 0%,#c82333 100%);
    --blue-grad: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    --grey-grad: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    --invalid-text-color: #b71c1c;
    --invalid-border-color: #f44336;
}
body.dark-mode {
    --bg-color: #1a1a1a; --text-color: #e0e0e0; --card-bg: #2d2d2d; --card-shadow: rgba(0,0,0,0.5);
    --border-color: #444; --input-border: #555; --input-bg: #3d3d3d;
    --invalid-text-color: #ff8a80;
}
body { 
    font-family: 'Segoe UI', sans-serif; 
    line-height: 1.6; 
    color: var(--text-color); 
    background-color: var(--bg-color); 
    transition: background-color 0.3s, color 0.3s; 
}

/* --- 레이아웃 및 카드 --- */
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { 
    background: var(--header-grad); color: white; padding: 30px; border-radius: 15px; 
    margin-bottom: 30px; text-align: center; box-shadow: 0 10px 30px var(--card-shadow); 
}
.header h1 { font-size: 2.5rem; margin-bottom: 10px; }
.card { 
    background: var(--card-bg); border-radius: 15px; padding: 25px; 
    margin-bottom: 25px; box-shadow: 0 5px 20px var(--card-shadow); 
    transition: background-color 0.3s, box-shadow 0.3s; 
}
.card h2 { color: var(--accent-color); margin-bottom: 20px; font-size: 1.5rem; }

/* --- 테이블 및 반응형 개선 --- */
.table-responsive { overflow-x: auto; } 
table { width: 100%; border-collapse: collapse; margin-top: 15px; min-width: 600px; }
caption { caption-side: top; text-align: left; font-weight: bold; padding: 10px 0; font-size: 1.1rem; color: var(--text-color); }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
th { background-color: rgba(0,0,0,0.03); font-weight: 600; }
tr:hover { background-color: rgba(0,0,0,0.02); }
.ticker { 
    background-color: var(--input-border); color: var(--text-color); padding: 4px 8px; border-radius: 6px; 
    font-family: 'Courier New',monospace; font-size: .9rem; font-weight: bold; 
}
.calculated-value { font-weight: 500; color: var(--accent-color); }

/* --- 입력 필드 및 버튼 --- */
.input-group { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
.input-group label { font-weight: 600; min-width: 120px; }
.input-group-vertical { display: flex; flex-direction: column; gap: 5px; }
.input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
input, .input-group__select {
    padding: 12px; border: 2px solid var(--input-border); border-radius: 8px; font-size: 1rem; 
    background: var(--input-bg); color: var(--text-color); transition: border-color 0.3s; 
}
.input-group__select {
    flex-grow: 1;
}
input:focus, .input-group__select:focus {
    outline: none; border-color: var(--accent-color); 
}
input:disabled { background-color: #eee; }
body.dark-mode input:disabled { background-color: #2a2a2a; }
.input-invalid { border-color: var(--invalid-border-color) !important; } 
.amount-input { width: 120px; text-align: right; padding: 6px; }
.btn { 
    background: var(--header-grad); color: white; border: none; padding: 12px 25px; border-radius: 8px; 
    cursor: pointer; font-size: 1rem; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; 
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
.btn-controls { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; }
.btn--green { background: var(--green-grad); }
.btn--orange { background: var(--orange-grad); }
.btn--blue { background: var(--blue-grad); }
.btn--grey { background: var(--grey-grad); }
.btn--delete { background: var(--red-grad); padding: 6px 12px; font-size: 0.9rem; }
.btn--small { padding: 8px 16px; font-size: 0.9rem; }
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }

/* --- UI 컴포넌트 --- */
.mode-selector { 
    display: flex; gap: 20px; margin-bottom: 25px; background-color: rgba(0,0,0,0.03); 
    padding: 12px; border-radius: 10px; border: 1px solid var(--border-color); 
}
.mode-selector label { cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
.mode-selector input[type="radio"] { transform: scale(1.2); }

.ratio-validator {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 15px 20px; border-radius: 10px;
    margin-top: 15px; display: flex; justify-content: space-between; align-items: center;
    border: 2px solid transparent; transition: all 0.3s; color: #1a1a1a;
}
.ratio-validator.valid {
    border-color: #4caf50; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); color: #1b5e20;
}
.ratio-validator.invalid {
    border-color: #f44336; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); color: var(--invalid-text-color);
}
.ratio-validator strong { font-size: 1.1rem; color: inherit; }
.ratio-value { font-size: 1.3rem; font-weight: bold; color: inherit; }

body.dark-mode .ratio-validator {
    background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #e0e0e0; border-color: #4a5568;
}
body.dark-mode .ratio-validator.valid {
    border-color: #48bb78; background: linear-gradient(135deg, #22543d 0%, #2f855a 100%); color: #9ae6b4;
}
body.dark-mode .ratio-validator.invalid {
    border-color: #fc8181; background: linear-gradient(135deg, #742a2a 0%, #9b2c2c 100%); color: var(--invalid-text-color);
}

/* --- 결과 표시 --- */
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px; }
.summary-item { padding: 20px; border-radius: 12px; text-align: center; color: #333; }
.summary-item h3 { margin-bottom: 10px; font-size: 1.1rem; }
.summary-item .amount { font-size: 1.8rem; font-weight: bold; }
.summary-item--current { background-color: #d4edda; }
.summary-item--additional { background-color: #cce7ff; }
.summary-item--final { background-color: #f3e5f5; }
.summary-item--rebalance { background-color: #fff3cd; }
body.dark-mode .summary-item { color: var(--text-color); }
body.dark-mode .summary-item--current { background-color: #1e4620; color: #c8e6c9; }
body.dark-mode .summary-item--additional { background-color: #1a3a52; color: #bbdefb; }
body.dark-mode .summary-item--final { background-color: #38294d; color: #e1bee7; }
body.dark-mode .summary-item--rebalance { background-color: #4a3f1f; color: #fff9c4; }

.guide-box { border-radius: 12px; padding: 20px; margin-top: 20px; }
.guide-box--buy { background-color: #e3f2fd; }
.guide-box--sell { background-color: #f8d7da; }
body.dark-mode .guide-box--buy { background-color: #1a3a52; }
body.dark-mode .guide-box--sell { background-color: #4a1f1f; }
.guide-box h3 { margin-bottom: 15px; }
.guide-item { display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); }
.text-buy { font-weight: bold; color: #007bff; font-size: 1.1rem; }
.text-sell { font-weight: bold; color: #dc3545; font-size: 1.1rem; }
.hidden { display: none !important; }

/* --- 모달(Modal) 스타일 --- */
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.6); z-index: 1000;
    display: flex; justify-content: center; align-items: center;
    opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s;
}
.modal-overlay:not(.hidden) { opacity: 1; visibility: visible; }
.modal-content {
    width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;
    transform: scale(0.9); transition: transform 0.3s;
}
.modal-overlay:not(.hidden) .modal-content { transform: scale(1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; }
.modal-close-btn {
    background: none; border: none; font-size: 2rem; cursor: pointer;
    color: var(--text-color);
}

/* --- 애니메이션 및 기타 --- */
.result-row-highlight {
    opacity: 0;
    transform: translateX(-20px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}
.result-row-highlight.in-view {
    opacity: 1;
    transform: translateX(0);
}
#chartSection {
    position: relative;
    max-width: 500px;
    margin: 25px auto;
}
.dark-mode-toggle {
    position: fixed; bottom: 30px; right: 30px; z-index: 1000; width: 60px; height: 60px; border-radius: 50%;
    font-size: 1.8rem; box-shadow: 0 5px 20px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; padding: 0;
}

/* --- Toast 알림 --- */
.toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    z-index: 2000;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
}
@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes fadeOut { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -20px); } }
.toast--success { background: var(--green-grad); }
.toast--error { background: var(--red-grad); }
.toast--info { background: var(--blue-grad); }

/* --- 스켈레톤 UI 스타일 --- */
.skeleton-wrapper {
    background-color: var(--card-bg);
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 5px 20px var(--card-shadow);
}
.skeleton {
    opacity: 0.7;
    animation: shimmer 2s infinite linear;
    background: linear-gradient(90deg, 
        rgba(0,0,0,0.06) 25%, 
        rgba(0,0,0,0.15) 37%, 
        rgba(0,0,0,0.06) 63%);
    background-size: 400% 100%;
    border-radius: 8px;
}
body.dark-mode .skeleton {
    background: linear-gradient(90deg, 
        rgba(255,255,255,0.06) 25%, 
        rgba(255,255,255,0.15) 37%, 
        rgba(255,255,255,0.06) 63%);
    background-size: 400% 100%;
}
@keyframes shimmer {
    0% { background-position: 100% 50%; }
    100% { background-position: 0 50%; }
}
.skeleton-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}
.skeleton-summary-item {
    height: 90px;
}
.skeleton-table-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    margin-bottom: 10px;
    padding: 0 10px;
}
.skeleton-text {
    height: 20px;
    width: 80%;
}
.skeleton-text--short {
    width: 40%;
}

/* --- 모바일 반응형 디자인 --- */
@media (max-width: 768px) {
    .container { 
        padding: 10px; 
    }
    .header {
        padding: 20px 15px;
    }
    .header h1 { 
        font-size: 1.8rem; 
    }
    .btn-controls { 
        flex-direction: column; 
    }
    .btn { 
        width: 100%;
        margin-bottom: 5px;
    }
    table { 
        font-size: 0.85rem; 
        min-width: auto;
    }
    th, td { 
        padding: 8px 4px;
        white-space: normal;
    }
    .amount-input { 
        width: 80px; 
    }
    .input-group {
        flex-direction: column;
        align-items: flex-start;
    }
    .summary-grid {
        grid-template-columns: 1fr;
    }
    .mode-selector {
        flex-direction: column;
        gap: 10px;
    }
    .guide-box {
        padding: 15px;
    }
    .dark-mode-toggle { 
        bottom: 15px; 
        right: 15px; 
        width: 50px; 
        height: 50px; 
    }
}

@media (max-width: 480px) {
    .header h1 {
        font-size: 1.5rem;
    }
    .card {
        padding: 15px;
    }
    .btn {
        font-size: 0.9rem;
        padding: 10px 20px;
    }
}
```

---

## `js/main.js`

```javascript
import { PortfolioController } from './controller.js';

window.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioController();
    app.init();
});
```

---

## `js/constants.js`

```javascript
export const MESSAGES = {
    // Toast Messages
    DATA_RESET: "데이터가 초기화되었습니다.",
    RATIOS_NORMALIZED: "목표 비율이 100%에 맞춰 조정되었습니다.",
    NO_RATIOS_TO_NORMALIZE: "자동 조정을 위한 목표 비율이 없습니다.",
    SAVE_SUCCESS: "포트폴리오가 저장되었습니다.",
    SAVE_NO_DATA: "저장할 데이터가 없습니다.",
    LOAD_SUCCESS: "저장된 데이터를 불러왔습니다.",
    IMPORT_SUCCESS: "데이터를 성공적으로 불러왔습니다.",
    IMPORT_ERROR: "파일을 불러오는 중 오류가 발생했습니다.",
    PORTFOLIO_CREATED: (name) => `포트폴리오 '${name}'이(가) 생성되었습니다.`,
    PORTFOLIO_RENAMED: "포트폴리오 이름이 변경되었습니다.",
    PORTFOLIO_DELETED: "포트폴리오가 삭제되었습니다.",
    LAST_PORTFOLIO_DELETE_ERROR: "마지막 포트폴리오는 삭제할 수 없습니다.",
    TRANSACTION_ADDED: "거래 내역이 추가되었습니다.",
    TRANSACTION_DELETED: "거래 내역이 삭제되었습니다.",
    CONFIRM_RESET: "현재 포트폴리오를 초기 템플릿으로 되돌리시겠습니까?",
    CONFIRM_LOAD: "경고: 현재 입력된 내용을 덮어쓰고 저장된 데이터를 불러오시겠습니까?",
    CONFIRM_DELETE_PORTFOLIO: (name) => `정말로 '${name}' 포트폴리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    CONFIRM_DELETE_TRANSACTION: "이 거래 내역을 정말로 삭제하시겠습니까?",
    CONFIRM_RATIO_SUM_WARN: (totalRatio) => `목표비율 합이 ${totalRatio.toFixed(1)}%입니다. 그래도 계산하시겠습니까?`,
    CALCULATION_ERROR: "계산 중 오류가 발생했습니다. 입력값을 확인해주세요.",
    VALIDATION_ERROR_PREFIX: "입력값을 확인해주세요: ",
    SAVE_ERROR_GENERAL: "저장 중 오류가 발생했습니다.",
    SAVE_ERROR_QUOTA: "저장 공간이 부족합니다.",
    CALC_ERROR_DECIMAL: "입력값이 너무 크거나 잘못된 형식입니다.",
    CALC_ERROR_TYPE: "데이터 형식 오류가 발생했습니다.",

    // Prompts
    PROMPT_NEW_PORTFOLIO_NAME: "새 포트폴리오의 이름을 입력하세요:",
    PROMPT_RENAME_PORTFOLIO: "새로운 포트폴리오 이름을 입력하세요:",

    // Validation Error Messages
    INVESTMENT_AMOUNT_ZERO: "- 추가 투자 금액을 0보다 크게 입력해주세요.",
    CURRENT_AMOUNT_ZERO: "- 현재 금액이 0보다 커야 리밸런싱을 계산할 수 있습니다.",
    RATIO_SUM_NOT_100: (totalRatio) => `- 목표 비율의 합이 100%가 되어야 합니다. (현재: ${totalRatio.toFixed(1)}%)`,
    INVALID_TRANSACTION_DATA: "- 거래 날짜, 수량, 단가를 올바르게 입력해주세요.",
    
    // ARIA Labels
    TICKER_INPUT: (name) => `${name} 티커 입력`,
    SECTOR_INPUT: (name) => `${name} 섹터 입력`,
    TARGET_RATIO_INPUT: (name) => `${name} 목표 비율 입력`,
    CURRENT_PRICE_INPUT: (name) => `${name} 현재가 입력`,
};

export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000,
    DEFAULT_EXCHANGE_RATE: 1300,
    RATIO_TOLERANCE: 0.01,
    LOCAL_STORAGE_KEY: 'portfolioCalculatorData_v5',
    DARK_MODE_KEY: 'darkMode'
};
```

---

## `js/utils.js`

```javascript
import Decimal from 'decimal.js';

/**
 * HTML 문자열을 이스케이프하여 XSS 공격을 방지합니다.
 * @param {string} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 안전한 HTML 문자열
 */
export function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * 포트폴리오 데이터에서 목표 비율의 합계를 계산합니다.
 * @param {Array<Object>} portfolioData - 포트폴리오 주식 객체 배열
 * @returns {number} 목표 비율의 합계
 */
export function getRatioSum(portfolioData) {
    return portfolioData.reduce((sum, s) => sum + (s.targetRatio || 0), 0);
}

/**
 * 숫자를 통화 형식의 문자열로 변환합니다.
 * @param {number|Decimal|string} amount - 변환할 금액
 * @param {string} currency - 통화 코드 ('KRW', 'USD')
 * @returns {string} 포맷팅된 통화 문자열
 */
export function formatCurrency(amount, currency = 'KRW') {
    const num = (typeof amount === 'number' || typeof amount === 'string') ? Number(amount) : amount.toNumber();
    const options = {
        style: 'currency',
        currency: currency,
    };
    if (currency.toUpperCase() === 'KRW') {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
    } else { // USD and others
        options.minimumFractionDigits = 2;
        options.maximumFractionDigits = 2;
    }
    return new Intl.NumberFormat(currency.toUpperCase() === 'USD' ? 'en-US' : 'ko-KR', options).format(num);
}

/**
 * 함수 실행을 지연시키는 디바운스 함수를 생성합니다.
 * @param {Function} func - 디바운싱을 적용할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} 디바운싱이 적용된 새로운 함수
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
```

---

## `js/templates.js`

```javascript
import { escapeHTML, formatCurrency } from './utils.js';
import { CONFIG } from './constants.js';
import Decimal from 'decimal.js';

export function generateAddModeResultsHTML(results, summary, currency) {
    const sortedResults = [...results].sort((a, b) => b.finalBuyAmount.comparedTo(a.finalBuyAmount));
    const resultsRows = sortedResults.map((stock, index) => `
        <tr class="result-row-highlight" data-delay="${index * 0.05}s">
            <td><strong>${escapeHTML(stock.name)}</strong><br><span class="ticker">${escapeHTML(stock.ticker)}</span></td>
            <td style="text-align: center;">${stock.currentRatio.toFixed(1)}%</td>
            <td style="text-align: center;"><strong>${stock.targetRatio.toFixed(1)}%</strong></td>
            <td style="text-align: right;"><div class="text-buy">${formatCurrency(stock.finalBuyAmount, currency)}</div></td>
            <td style="text-align: center;">${stock.buyRatio.toFixed(1)}%</td>
        </tr>
    `).join('');
    
    const buyableStocks = sortedResults.filter(s => s.finalBuyAmount.greaterThan(CONFIG.MIN_BUYABLE_AMOUNT));
    const guideContent = buyableStocks.length > 0 
        ? buyableStocks.map((s, i) => `
            <div class="guide-item">
                <div><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.finalBuyAmount, currency)}</div>
                <span style="font-weight: bold;">(${s.buyRatio.toFixed(1)}%)</span>
            </div>`).join('')
        : '<p style="text-align: center;">매수할 종목이 없습니다.</p>';

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--current"><h3>현재 총 자산</h3><div class="amount">${formatCurrency(summary.currentTotal, currency)}</div></div>
            <div class="summary-item summary-item--additional"><h3>추가 투자금</h3><div class="amount">${formatCurrency(summary.additionalInvestment, currency)}</div></div>
            <div class="summary-item summary-item--final"><h3>투자 후 총 자산</h3><div class="amount">${formatCurrency(summary.finalTotal, currency)}</div></div>
        </div>
        <div class="card">
            <h2>📈 추가 투자 배분 가이드 (매수 금액순 정렬)</h2>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>종목</th><th>현재 비율</th><th>목표 비율</th><th>매수 추천 금액</th><th>투자금 중 비율</th></tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--buy"><h3>💡 매수 실행 가이드</h3>${guideContent}</div>
        </div>`;
}

export function generateSellModeResultsHTML(results, currency) {
    const sortedResults = [...results].sort((a, b) => b.adjustment.comparedTo(a.adjustment));
    const resultsRows = sortedResults.map((s, index) => `
        <tr class="result-row-highlight" data-delay="${index * 0.05}s">
            <td><strong>${escapeHTML(s.name)}</strong><br><span class="ticker">${escapeHTML(s.ticker)}</span></td>
            <td style="text-align: center;">${s.currentRatio.toFixed(1)}%</td>
            <td style="text-align: center;"><strong>${s.targetRatio.toFixed(1)}%</strong></td>
            <td style="text-align: right;">
                <div class="${s.adjustment.isPositive() ? 'text-sell' : 'text-buy'}">
                    ${s.adjustment.isPositive() ? '🔴 매도' : '🔵 매수'}: ${formatCurrency(s.adjustment.abs(), currency)}
                </div>
            </td>
        </tr>`).join('');

    const totalSell = results.filter(s => s.adjustment.isPositive()).reduce((sum, s) => sum.plus(s.adjustment), new Decimal(0));
    const stocksToSell = sortedResults.filter(s => s.adjustment.isPositive());
    const stocksToBuy = sortedResults.filter(s => s.adjustment.isNegative());

    const sellGuide = stocksToSell.map((s, i) => `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment, currency)} 매도</div>`).join('') || '<p>매도할 종목이 없습니다.</p>';
    const buyGuide = stocksToBuy.map((s, i) => `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment.abs(), currency)} 매수</div>`).join('') || '<p>매수할 종목이 없습니다.</p>';

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--rebalance"><h3>총 리밸런싱 금액</h3><div class="amount">${formatCurrency(totalSell, currency)}</div></div>
        </div>
        <div class="card">
            <h2>⚖️ 리밸런싱 가이드 (조정 금액순 정렬)</h2>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>종목</th><th>현재 비율</th><th>목표 비율</th><th>조정 금액</th></tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--sell"><h3>🔴 매도 항목</h3>${sellGuide}</div>
            <div class="guide-box guide-box--buy"><h3>🔵 매수 항목 (매도 자금으로)</h3>${buyGuide}</div>
        </div>`;
}

export function generateSectorAnalysisHTML(sectorData, currency) {
    if (!sectorData || sectorData.length === 0) {
        return '';
    }

    const rows = sectorData.map(data => `
        <tr>
            <td>${escapeHTML(data.sector)}</td>
            <td style="text-align: right;">${formatCurrency(data.amount, currency)}</td>
            <td style="text-align: right;">${data.percentage.toFixed(2)}%</td>
        </tr>
    `).join('');

    return `
        <div class="card">
            <h2>🗂️ 섹터별 분석</h2>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">섹터</th>
                            <th scope="col">금액</th>
                            <th scope="col">비중</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
```

---

## `js/validator.js`

```javascript
import { CONFIG, MESSAGES } from './constants.js';
import { getRatioSum } from './utils.js';
import Decimal from 'decimal.js';

export const Validator = {
    validateForCalculation({ mainMode, portfolioData, additionalInvestment }) {
        const errors = [];
        const calculatedPortfolio = portfolioData;

        for (const stock of calculatedPortfolio) {
            if (!stock.name.trim()) errors.push(`- 이름 없는 종목의 종목명을 입력해주세요.`);
            if (!stock.ticker.trim()) errors.push(`- '${stock.name}'의 티커를 입력해주세요.`);
            if (stock.calculated.quantity.greaterThan(0) && stock.currentPrice <= 0) {
                 errors.push(`- '${stock.name}'의 현재가는 0보다 커야 합니다.`);
            }
        }

        if (mainMode === 'add') {
            if (additionalInvestment.isZero() || additionalInvestment.isNegative()) {
                errors.push(MESSAGES.INVESTMENT_AMOUNT_ZERO);
            }
            const totalFixedBuy = portfolioData.reduce((sum, s) => {
                return s.isFixedBuyEnabled ? sum.plus(new Decimal(s.fixedBuyAmount || 0)) : sum;
            }, new Decimal(0));
            if (totalFixedBuy.greaterThan(additionalInvestment)) {
                errors.push("- 고정 매수 금액의 합이 총 투자금을 초과합니다.");
            }
        } else { // 'sell' mode
            const currentTotal = calculatedPortfolio.reduce((sum, s) => sum.plus(s.calculated.currentAmount), new Decimal(0));
            if (currentTotal.isZero() || currentTotal.isNegative()) {
                errors.push(MESSAGES.CURRENT_AMOUNT_ZERO);
            }
            const totalRatio = getRatioSum(calculatedPortfolio);
            if (Math.abs(totalRatio - 100) > CONFIG.RATIO_TOLERANCE) {
                errors.push(MESSAGES.RATIO_SUM_NOT_100(totalRatio));
            }
        }
        return errors;
    },

    validateNumericInput(value) {
        const trimmedValue = String(value).trim();
        if (trimmedValue === '') return { isValid: true, value: 0 };

        if (isNaN(value)) return { isValid: false, message: '유효한 숫자가 아닙니다.' };
        
        const numValue = parseFloat(value);
        if (numValue < 0) return { isValid: false, message: '음수는 입력할 수 없습니다.' };

        return { isValid: true, value: numValue };
    },

    validateTransaction(txData) {
        const { date, quantity, price } = txData;
        if (!date || isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
            return { isValid: false, message: MESSAGES.INVALID_TRANSACTION_DATA };
        }
        return { isValid: true };
    },

    isDataStructureValid(data) {
        if (!data || !data.portfolios || !data.activePortfolioId) {
            return false;
        }
        const activePortfolio = data.portfolios[data.activePortfolioId];
        if (!activePortfolio || !activePortfolio.portfolioData || !Array.isArray(activePortfolio.portfolioData)) {
            return false;
        }
        const firstStock = activePortfolio.portfolioData[0];
        if (firstStock && typeof firstStock.isFixedBuyEnabled === 'undefined') {
            return false;
        }
        return true;
    }
};
```

---

## `js/calculator.js`

```javascript
import Decimal from 'decimal.js';
import { getRatioSum } from './utils.js';

export const Calculator = {
    calculatePortfolioState({ portfolioData }) {
        return portfolioData.map(stock => {
            let totalQuantity = new Decimal(0);
            let totalBuyCost = new Decimal(0);
            let totalBuyQuantity = new Decimal(0);
            const ZERO = new Decimal(0);

            const sortedTransactions = [...stock.transactions]
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            for (const tx of sortedTransactions) {
                const txQuantity = new Decimal(tx.quantity || 0);
                const txPrice = new Decimal(tx.price || 0);

                if (tx.type === 'buy') {
                    totalQuantity = totalQuantity.plus(txQuantity);
                    totalBuyCost = totalBuyCost.plus(txQuantity.times(txPrice));
                    totalBuyQuantity = totalBuyQuantity.plus(txQuantity);
                } else { // 'sell'
                    totalQuantity = totalQuantity.minus(txQuantity);
                }
            }
            
            totalQuantity = Decimal.max(ZERO, totalQuantity);

            const averageBuyPrice = totalBuyQuantity.isZero() ? ZERO : totalBuyCost.div(totalBuyQuantity);
            const currentAmount = totalQuantity.times(new Decimal(stock.currentPrice || 0));

            return {
                ...stock,
                calculated: {
                    quantity: totalQuantity,
                    avgBuyPrice: averageBuyPrice,
                    currentAmount: currentAmount,
                }
            };
        });
    },

    calculateAddRebalancing({ portfolioData, additionalInvestment }) {
        if (!Array.isArray(portfolioData)) throw new TypeError('유효하지 않은 포트폴리오 데이터입니다.');
        if (!(additionalInvestment instanceof Decimal)) throw new TypeError('투자 금액은 Decimal 타입이어야 합니다.');
        
        const ZERO = new Decimal(0);

        const totalFixedBuy = portfolioData.reduce((sum, s) => {
            return s.isFixedBuyEnabled ? sum.plus(new Decimal(s.fixedBuyAmount || 0)) : sum;
        }, ZERO);
        
        const remainingInvestment = Decimal.max(ZERO, additionalInvestment.minus(totalFixedBuy));
        
        const rebalancingStocks = portfolioData.filter(s => !s.isFixedBuyEnabled);
        const totalRatio = getRatioSum(rebalancingStocks);
        
        const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated.currentAmount), ZERO);
        const finalTotal = currentTotal.plus(additionalInvestment);

        let results = portfolioData.map(stock => ({
            ...stock,
            finalBuyAmount: stock.isFixedBuyEnabled ? new Decimal(stock.fixedBuyAmount || 0) : ZERO,
            currentRatio: currentTotal.isZero() ? 0 : stock.calculated.currentAmount.div(currentTotal).times(100).toNumber()
        }));
        
        if (remainingInvestment.greaterThan(0) && rebalancingStocks.length > 0) {
            const currentRebalancingTotal = rebalancingStocks.reduce((sum, s) => sum.plus(s.calculated.currentAmount), ZERO);
            const finalRebalancingTotal = currentRebalancingTotal.plus(remainingInvestment);

            const neededForRebalancing = rebalancingStocks.map(s => {
                const targetRatio = new Decimal(totalRatio > 0 ? (s.targetRatio || 0) / totalRatio : 1 / rebalancingStocks.length);
                const targetValue = finalRebalancingTotal.times(targetRatio);
                const needed = Decimal.max(ZERO, targetValue.minus(s.calculated.currentAmount));
                return { id: s.id, needed };
            });

            const totalNeeded = neededForRebalancing.reduce((sum, s) => sum.plus(s.needed), ZERO);
            
            let distributedAmount = ZERO;
            neededForRebalancing.forEach((stock, index) => {
                const resultStock = results.find(r => r.id === stock.id);
                if (index === neededForRebalancing.length - 1) {
                    const remaining = remainingInvestment.minus(distributedAmount);
                    resultStock.finalBuyAmount = resultStock.finalBuyAmount.plus(Decimal.max(ZERO, remaining));
                } else {
                    const proportion = totalNeeded.isZero() ? new Decimal(1).div(rebalancingStocks.length) : stock.needed.div(totalNeeded);
                    const allocated = proportion.times(remainingInvestment).round();
                    resultStock.finalBuyAmount = resultStock.finalBuyAmount.plus(allocated);
                    distributedAmount = distributedAmount.plus(allocated);
                }
            });
        }
        
        results.forEach(r => {
            r.buyRatio = additionalInvestment.isZero() || r.finalBuyAmount.isZero() ? 0 : r.finalBuyAmount.div(additionalInvestment).times(100).toNumber();
        });

        const summary = { currentTotal, additionalInvestment, finalTotal };
        return { results, summary };
    },

    calculateSellRebalancing({ portfolioData }) {
        if (!Array.isArray(portfolioData)) throw new TypeError('유효하지 않은 포트폴리오 데이터입니다.');
        
        const ZERO = new Decimal(0);
        const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated.currentAmount), ZERO);

        if (currentTotal.isZero()) {
            return { results: portfolioData.map(s => ({ ...s, currentRatio: 0, adjustment: ZERO })) };
        }

        const results = portfolioData.map(stock => {
            const targetAmountDec = currentTotal.times(new Decimal(stock.targetRatio || 0)).div(100);
            return {
                ...stock,
                currentRatio: stock.calculated.currentAmount.div(currentTotal).times(100).toNumber(),
                adjustment: stock.calculated.currentAmount.minus(targetAmountDec)
            };
        });
        
        return { results };
    },

    analyzeSectors({ portfolioData }) {
        const totalAmount = portfolioData.reduce((sum, stock) => sum.plus(stock.calculated.currentAmount), new Decimal(0));
        if (totalAmount.isZero()) return [];

        const sectorMap = new Map();
        portfolioData.forEach(stock => {
            const sector = stock.sector || '미분류';
            const sectorTotal = sectorMap.get(sector) || new Decimal(0);
            sectorMap.set(sector, sectorTotal.plus(stock.calculated.currentAmount));
        });

        return Array.from(sectorMap.entries())
            .map(([sector, amount]) => ({
                sector,
                amount,
                percentage: amount.div(totalAmount).times(100).toNumber()
            }))
            .sort((a, b) => b.amount.comparedTo(a.amount));
    }
};
```

---

## `js/state.js`

```javascript
import { CONFIG, MESSAGES } from './constants.js';
import { Validator } from './validator.js';
import { getRatioSum as calculateRatioSum } from './utils.js';

/**
 * @typedef {'buy'|'sell'} TransactionType
 * @typedef {Object} Transaction
 * @property {string} id - 거래 고유 ID
 * @property {TransactionType} type - 거래 종류
 * @property {string} date - 거래 날짜 (ISO 8601)
 * @property {number} quantity - 수량
 * @property {number} price - 개당 가격
 * @typedef {Object} Stock
 * @property {number} id
 * @property {string} name
 * @property {string} ticker
 * @property {string} sector
 * @property {number} targetRatio
 * @property {number} currentPrice - 현재가 (사용자 입력)
 * @property {Array<Transaction>} transactions - 거래 내역 배열
 * @property {boolean} isFixedBuyEnabled - 고정 매수 활성화 여부
 * @property {number} fixedBuyAmount - 고정 매수 금액
 */
export class PortfolioState {
    portfolios = {};
    activePortfolioId = null;

    constructor() {
        this.init();
    }

    createStock(id, name, ticker, sector = '미분류') {
        return { 
            id, name, ticker, sector,
            targetRatio: 0, 
            currentPrice: 0,
            transactions: [],
            isFixedBuyEnabled: false,
            fixedBuyAmount: 0,
        };
    }

    loadTemplateData(name = "기본 포트폴리오") {
        const id = Date.now();
        const templateData = {
            name: name,
            portfolioData: [
                { id: Date.now() + 1, name: "알파벳 A", ticker: "GOOGL", sector: "기술주", targetRatio: 25, currentPrice: 175, transactions: [
                    { id: Date.now() + 101, type: 'buy', date: '2023-01-15', quantity: 10, price: 95 },
                    { id: Date.now() + 102, type: 'buy', date: '2023-06-20', quantity: 5, price: 125 },
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0 },
                { id: Date.now() + 2, name: "엔비디아", ticker: "NVDA", sector: "기술주", targetRatio: 30, currentPrice: 120, transactions: [
                    { id: Date.now() + 201, type: 'buy', date: '2023-03-10', quantity: 20, price: 45 },
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0 },
                { id: Date.now() + 3, name: "마이크로소프트", ticker: "MSFT", sector: "기술주", targetRatio: 25, currentPrice: 445, transactions: [], isFixedBuyEnabled: false, fixedBuyAmount: 0 },
                { id: Date.now() + 4, name: "코카콜라", ticker: "KO", sector: "소비재", targetRatio: 20, currentPrice: 62, transactions: [], isFixedBuyEnabled: false, fixedBuyAmount: 0 },
            ],
            settings: {
                mainMode: 'add',
                currentCurrency: 'usd',
            }
        };
        return { id, data: templateData };
    }

    init() {
        const savedDataString = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
        if (savedDataString) {
            try {
                const savedData = JSON.parse(savedDataString);
                if (!Validator.isDataStructureValid(savedData)) {
                    throw new Error("Invalid data structure");
                }
                this.portfolios = savedData.portfolios;
                this.activePortfolioId = savedData.activePortfolioId;
                if (!this.portfolios[this.activePortfolioId]) {
                    this.activePortfolioId = Object.keys(this.portfolios)[0];
                    if (!this.activePortfolioId) throw new Error("No portfolios found.");
                }
            } catch (error) {
                console.error("Failed to load saved portfolios:", error);
                const defaultPortfolio = this.loadTemplateData();
                this.portfolios = { [defaultPortfolio.id]: defaultPortfolio.data };
                this.activePortfolioId = defaultPortfolio.id;
            }
        } else {
            const defaultPortfolio = this.loadTemplateData();
            this.portfolios = { [defaultPortfolio.id]: defaultPortfolio.data };
            this.activePortfolioId = defaultPortfolio.id;
        }

        const savedDarkMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
        if (savedDarkMode === 'true') document.body.classList.add('dark-mode');
    }

    saveState() {
        try {
            const stateToSave = {
                portfolios: this.portfolios,
                activePortfolioId: this.activePortfolioId
            };
            localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
            return { success: true, message: MESSAGES.SAVE_SUCCESS };
        } catch (error) {
            console.error("Save state error:", error);
            if (error.name === 'QuotaExceededError') {
                return { success: false, message: MESSAGES.SAVE_ERROR_QUOTA };
            }
            return { success: false, message: MESSAGES.SAVE_ERROR_GENERAL };
        }
    }
    
    getActivePortfolio() {
        return this.portfolios[this.activePortfolioId];
    }
    
    addPortfolio(name) {
        const newPortfolio = this.loadTemplateData(name);
        this.portfolios[newPortfolio.id] = newPortfolio.data;
        this.activePortfolioId = newPortfolio.id;
        this.saveState();
        return { id: newPortfolio.id, name };
    }

    renamePortfolio(id, newName) {
        if (this.portfolios[id] && newName.trim()) {
            this.portfolios[id].name = newName.trim();
            this.saveState();
            return true;
        }
        return false;
    }
    
    deletePortfolio(id) {
        if (Object.keys(this.portfolios).length <= 1) {
            return false;
        }
        delete this.portfolios[id];
        if (this.activePortfolioId === id) {
            this.activePortfolioId = Object.keys(this.portfolios)[0];
        }
        this.saveState();
        return true;
    }

    switchPortfolio(id) {
        if (this.portfolios[id]) {
            this.activePortfolioId = id;
            return true;
        }
        return false;
    }
    
    addNewStock() {
        const activePortfolioData = this.getActivePortfolio().portfolioData;
        const newStock = this.createStock(Date.now(), "새 종목", "NEW");
        activePortfolioData.push(newStock);
        return newStock;
    }

    deleteStock(id) {
        const activePortfolioData = this.getActivePortfolio().portfolioData;
        if (activePortfolioData.length <= 1) return false;
        
        this.getActivePortfolio().portfolioData = activePortfolioData.filter(s => s.id !== id);
        return true;
    }

    updateStock(id, field, value) {
        const stock = this.getActivePortfolio().portfolioData.find(s => s.id === id);
        if (!stock) return null;

        const numericFields = ['targetRatio', 'currentPrice', 'fixedBuyAmount'];
        
        if (field === 'isFixedBuyEnabled') {
            stock.isFixedBuyEnabled = Boolean(value);
            if (!value) stock.fixedBuyAmount = 0;
        } else if (numericFields.includes(field)) {
            const { isValid, value: validatedValue } = Validator.validateNumericInput(value);
            if(isValid) stock[field] = validatedValue;
        } else {
            stock[field] = value;
        }
        return stock[field];
    }
    
    addTransaction(stockId, transactionData) {
        const stock = this.getActivePortfolio().portfolioData.find(s => s.id === stockId);
        if (!stock) return false;

        const newTransaction = {
            ...transactionData,
            id: `tx_${Date.now()}`
        };
        stock.transactions.push(newTransaction);
        return true;
    }

    deleteTransaction(stockId, transactionId) {
        const stock = this.getActivePortfolio().portfolioData.find(s => s.id === stockId);
        if (!stock) return false;
        
        stock.transactions = stock.transactions.filter(tx => tx.id !== transactionId);
        return true;
    }

    getRatioSum() {
        const portfolioData = this.getActivePortfolio().portfolioData;
        return calculateRatioSum(portfolioData);
    }

    normalizeRatios() {
        const portfolioData = this.getActivePortfolio().portfolioData;
        
        const sum = calculateRatioSum(portfolioData);
        if (sum === 0) return false;
        
        let total = 0;
        portfolioData.forEach((stock, index) => {
            if (index === portfolioData.length - 1) {
                stock.targetRatio = parseFloat((100 - total).toFixed(4));
            } else {
                const normalized = (stock.targetRatio / sum) * 100;
                const rounded = parseFloat(normalized.toFixed(4));
                stock.targetRatio = rounded;
                total += rounded;
            }
        });
        return true;
    }
}
```

## `js/eventBinder.js`

```javascript
import { debounce } from './utils.js';

export function bindEventListeners(controller, dom) {
    // 포트폴리오 관리
    dom.newPortfolioBtn.addEventListener('click', () => controller.handleNewPortfolio());
    dom.renamePortfolioBtn.addEventListener('click', () => controller.handleRenamePortfolio());
    dom.deletePortfolioBtn.addEventListener('click', () => controller.handleDeletePortfolio());
    dom.portfolioSelector.addEventListener('change', () => controller.handleSwitchPortfolio());

    // 포트폴리오 설정
    dom.addNewStockBtn.addEventListener('click', () => controller.handleAddNewStock());
    dom.resetDataBtn.addEventListener('click', () => controller.handleResetData());
    dom.normalizeRatiosBtn.addEventListener('click', () => controller.handleNormalizeRatios());
    dom.saveDataBtn.addEventListener('click', () => controller.handleSaveData());
    dom.loadDataBtn.addEventListener('click', () => controller.handleLoadData());
    dom.exportDataBtn.addEventListener('click', () => controller.handleExportData());
    dom.importDataBtn.addEventListener('click', () => controller.handleImportData());
    dom.importFileInput.addEventListener('change', (e) => controller.handleFileSelected(e));

    // 메인 테이블 이벤트 (이벤트 위임)
    dom.portfolioBody.addEventListener('change', (e) => controller.handlePortfolioBodyChange(e));
    dom.portfolioBody.addEventListener('click', (e) => controller.handlePortfolioBodyClick(e));

    // 계산 및 모드 변경
    dom.calculateBtn.addEventListener('click', () => controller.handleCalculate());
    dom.mainModeSelector.forEach(r => r.addEventListener('change', (e) => controller.handleMainModeChange(e.target.value)));
    dom.currencyModeSelector.forEach(r => r.addEventListener('change', (e) => controller.handleCurrencyModeChange(e.target.value)));

    // 추가 투자금 및 환율 (디바운스 적용)
    const debouncedConversion = debounce((source) => controller.handleCurrencyConversion(source), 300);
    dom.additionalAmountInput.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value);
        const isValid = !isNaN(rate) && rate > 0;
        controller.view.toggleInputValidation(e.target, isValid);
        if (isValid) debouncedConversion('krw');
    });

    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            controller.handleCalculate();
        }
    };
    dom.additionalAmountInput.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput.addEventListener('keydown', handleEnterKey);

    // 모달 관련 이벤트
    dom.closeModalBtn.addEventListener('click', () => controller.view.closeTransactionModal());
    dom.transactionModal.addEventListener('click', (e) => {
        if (e.target === dom.transactionModal) controller.view.closeTransactionModal();
    });
    dom.newTransactionForm.addEventListener('submit', (e) => controller.handleAddNewTransaction(e));
    dom.transactionListBody.addEventListener('click', (e) => controller.handleTransactionListClick(e));
    
    // 기타 UI 이벤트
    dom.darkModeToggle.addEventListener('click', () => controller.handleToggleDarkMode());
}
```

---

## `js/view.js`

```javascript
import { CONFIG, MESSAGES } from './constants.js';
import { formatCurrency } from './utils.js';
import Decimal from 'decimal.js';

export const PortfolioView = {
    dom: {},
    chartInstance: null,
    currentObserver: null,

    cacheDomElements() {
        const D = document;
        this.dom = {
            portfolioBody: D.getElementById('portfolioBody'),
            resultsSection: D.getElementById('resultsSection'),
            sectorAnalysisSection: D.getElementById('sectorAnalysisSection'),
            chartSection: D.getElementById('chartSection'),
            portfolioChart: D.getElementById('portfolioChart'),
            additionalAmountInput: D.getElementById('additionalAmount'),
            additionalAmountUSDInput: D.getElementById('additionalAmountUSD'),
            exchangeRateInput: D.getElementById('exchangeRate'),
            mainModeSelector: D.querySelectorAll('input[name="mainMode"]'),
            currencyModeSelector: D.querySelectorAll('input[name="currencyMode"]'),
            exchangeRateGroup: D.getElementById('exchangeRateGroup'),
            usdInputGroup: D.getElementById('usdInputGroup'),
            addInvestmentCard: D.getElementById('addInvestmentCard'),
            calculateBtn: D.getElementById('calculateBtn'),
            darkModeToggle: D.getElementById('darkModeToggle'),
            addNewStockBtn: D.getElementById('addNewStockBtn'),
            resetDataBtn: D.getElementById('resetDataBtn'),
            normalizeRatiosBtn: D.getElementById('normalizeRatiosBtn'),
            saveDataBtn: D.getElementById('saveDataBtn'),
            loadDataBtn: D.getElementById('loadDataBtn'),
            exportDataBtn: D.getElementById('exportDataBtn'),
            importDataBtn: D.getElementById('importDataBtn'),
            importFileInput: D.getElementById('importFileInput'),
            portfolioTableHead: D.getElementById('portfolioTableHead'),
            ratioValidator: D.getElementById('ratioValidator'),
            ratioSum: D.getElementById('ratioSum'),
            portfolioSelector: D.getElementById('portfolioSelector'),
            newPortfolioBtn: D.getElementById('newPortfolioBtn'),
            renamePortfolioBtn: D.getElementById('renamePortfolioBtn'),
            deletePortfolioBtn: D.getElementById('deletePortfolioBtn'),
            
            transactionModal: D.getElementById('transactionModal'),
            modalStockName: D.getElementById('modalStockName'),
            closeModalBtn: D.getElementById('closeModalBtn'),
            transactionListBody: D.getElementById('transactionListBody'),
            newTransactionForm: D.getElementById('newTransactionForm'),
            txDate: D.getElementById('txDate'),
            txQuantity: D.getElementById('txQuantity'),
            txPrice: D.getElementById('txPrice'),
        };
    },

    renderPortfolioSelector(portfolios, activeId) {
        this.dom.portfolioSelector.innerHTML = '';
        for (const id in portfolios) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolios[id].name;
            if (id.toString() === activeId.toString()) {
                option.selected = true;
            }
            this.dom.portfolioSelector.appendChild(option);
        }
    },
    
    createStockRowElement(stock, currency, mainMode) {
        const tr = document.createElement('tr');
        tr.dataset.id = stock.id;

        const { quantity, avgBuyPrice, currentAmount } = stock.calculated;

        const createCell = (content, className = '') => {
            const td = document.createElement('td');
            if (className) td.className = className;
            if (typeof content === 'string' || typeof content === 'number') {
                td.innerHTML = content;
            } else if (content instanceof Node) {
                td.appendChild(content);
            }
            return td;
        };
        
        const createInput = (type, field, value, ariaLabel, styles = {}) => {
            const input = document.createElement('input');
            input.type = type;
            input.dataset.field = field;
            input.setAttribute('aria-label', ariaLabel);
            input.value = (value === undefined || value === null) ? '' : value;
            if (styles.inline) Object.assign(input.style, styles.inline);
            if (styles.className) input.className = styles.className;
            return input;
        };

        tr.appendChild(createCell(createInput('text', 'name', stock.name, `${stock.name} 종목명`), 'cell-name'));
        tr.appendChild(createCell(createInput('text', 'ticker', stock.ticker, MESSAGES.TICKER_INPUT(stock.name), { inline: { textAlign: 'center' } }), 'cell-ticker'));
        tr.appendChild(createCell(createInput('text', 'sector', stock.sector, MESSAGES.SECTOR_INPUT(stock.name), { inline: { textAlign: 'center' } }), 'cell-sector'));
        tr.appendChild(createCell(createInput('number', 'targetRatio', stock.targetRatio.toFixed(2), MESSAGES.TARGET_RATIO_INPUT(stock.name), { className: 'amount-input', inline: { width: '80px', textAlign: 'center' } }), 'cell-targetRatio'));
        tr.appendChild(createCell(createInput('number', 'currentPrice', stock.currentPrice, MESSAGES.CURRENT_PRICE_INPUT(stock.name), { className: 'amount-input' }), 'cell-currentPrice'));
        tr.appendChild(createCell(`<span class="calculated-value">${quantity.toNumber().toLocaleString()}</span>`, 'amount-input cell-quantity'));
        tr.appendChild(createCell(`<span class="calculated-value">${formatCurrency(avgBuyPrice, currency)}</span>`, 'amount-input cell-avgBuyPrice'));
        tr.appendChild(createCell(`<span class="calculated-value">${formatCurrency(currentAmount, currency)}</span>`, 'amount-input cell-currentAmount'));

        if (mainMode === 'add') {
            const fixedBuyContainer = document.createElement('div');
            fixedBuyContainer.style.cssText = 'display: flex; align-items: center; gap: 8px; justify-content: center;';
            
            const checkbox = createInput('checkbox', 'isFixedBuyEnabled', stock.isFixedBuyEnabled, '고정 매수 활성화');
            checkbox.checked = stock.isFixedBuyEnabled;
            
            const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '고정 매수 금액', { className: 'amount-input' });
            amountInput.disabled = !stock.isFixedBuyEnabled;

            fixedBuyContainer.append(checkbox, amountInput);
            tr.appendChild(createCell(fixedBuyContainer, 'cell-fixedBuy'));
        }

        const actionsContainer = document.createElement('div');
        actionsContainer.style.cssText = 'display: flex; gap: 5px; justify-content: center;';
        
        const manageBtn = document.createElement('button');
        manageBtn.className = 'btn btn--blue btn--small';
        manageBtn.dataset.action = 'manage';
        manageBtn.textContent = '거래 관리';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn--delete btn--small';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.textContent = '삭제';
        
        actionsContainer.append(manageBtn, deleteBtn);
        tr.appendChild(createCell(actionsContainer, 'cell-actions'));

        return tr;
    },

    updateStockRowElement(row, stock, currency, mainMode) {
        const { quantity, avgBuyPrice, currentAmount } = stock.calculated;
        
        row.querySelector('[data-field="name"]').value = stock.name;
        row.querySelector('[data-field="ticker"]').value = stock.ticker;
        row.querySelector('[data-field="sector"]').value = stock.sector;
        row.querySelector('[data-field="targetRatio"]').value = stock.targetRatio.toFixed(2);
        row.querySelector('[data-field="currentPrice"]').value = stock.currentPrice;

        row.querySelector('.cell-quantity .calculated-value').textContent = quantity.toNumber().toLocaleString();
        row.querySelector('.cell-avgBuyPrice .calculated-value').textContent = formatCurrency(avgBuyPrice, currency);
        row.querySelector('.cell-currentAmount .calculated-value').textContent = formatCurrency(currentAmount, currency);
        
        if (mainMode === 'add') {
            const checkbox = row.querySelector('[data-field="isFixedBuyEnabled"]');
            const amountInput = row.querySelector('[data-field="fixedBuyAmount"]');
            if (checkbox) {
                checkbox.checked = stock.isFixedBuyEnabled;
            }
            if (amountInput) {
                amountInput.value = stock.fixedBuyAmount;
                amountInput.disabled = !stock.isFixedBuyEnabled;
            }
        }
    },

    renderTable(calculatedPortfolioData, currency, mainMode) {
        this.updateTableHeader(currency, mainMode);

        const existingRows = new Map(
            Array.from(this.dom.portfolioBody.children).map(row => [row.dataset.id, row])
        );
        
        for (const stock of calculatedPortfolioData) {
            const stockId = String(stock.id);
            const row = existingRows.get(stockId);

            if (row) {
                this.updateStockRowElement(row, stock, currency, mainMode);
                existingRows.delete(stockId);
            } else {
                const newRow = this.createStockRowElement(stock, currency, mainMode);
                this.dom.portfolioBody.appendChild(newRow);
            }
        }
        
        existingRows.forEach(row => row.remove());
    },

    updateTableHeader(currency, mainMode) {
        const currencySymbol = currency.toLowerCase() === 'usd' ? '$' : '원';
        const fixedBuyHeader = mainMode === 'add' ? `<th scope="col">고정 매수(${currencySymbol})</th>` : '';
        this.dom.portfolioTableHead.innerHTML = `
            <tr>
                <th scope="col">종목명</th>
                <th scope="col">티커</th>
                <th scope="col">섹터</th>
                <th scope="col">목표 비율(%)</th>
                <th scope="col">현재가(${currencySymbol})</th>
                <th scope="col">보유 수량</th>
                <th scope="col">평균 단가(${currencySymbol})</th>
                <th scope="col">평가 금액(${currencySymbol})</th>
                ${fixedBuyHeader}
                <th scope="col">작업</th>
            </tr>
        `;
    },

    updateRatioSum(totalRatio) {
        this.dom.ratioSum.textContent = `${totalRatio.toFixed(1)}%`;
        this.dom.ratioValidator.classList.remove('valid', 'invalid');
        if (Math.abs(totalRatio - 100) < CONFIG.RATIO_TOLERANCE) {
            this.dom.ratioValidator.classList.add('valid');
        } else if (totalRatio > 0) {
            this.dom.ratioValidator.classList.add('invalid');
        }
    },

    updateMainModeUI(mainMode) {
        this.dom.addInvestmentCard.classList.toggle('hidden', mainMode !== 'add');
        this.dom.mainModeSelector.forEach(radio => {
            radio.checked = radio.value === mainMode;
        });
        this.hideResults();
    },

    updateCurrencyModeUI(currencyMode) {
        const isUsdMode = currencyMode === 'usd';
        this.dom.exchangeRateGroup.classList.toggle('hidden', !isUsdMode);
        this.dom.usdInputGroup.classList.toggle('hidden', !isUsdMode);
        this.dom.currencyModeSelector.forEach(radio => {
            radio.checked = radio.value === currencyMode;
        });
        if (!isUsdMode) this.dom.additionalAmountUSDInput.value = '';
    },
    
    openTransactionModal(stock, currency) {
        this.dom.transactionModal.dataset.stockId = stock.id;
        this.dom.modalStockName.textContent = `${stock.name} (${stock.ticker}) 거래 내역`;
        this.renderTransactionList(stock.transactions, currency);
        this.dom.txDate.valueAsDate = new Date();
        this.dom.transactionModal.classList.remove('hidden');
    },

    closeTransactionModal() {
        this.dom.transactionModal.classList.add('hidden');
        this.dom.newTransactionForm.reset();
        this.dom.transactionModal.removeAttribute('data-stock-id');
    },

    renderTransactionList(transactions, currency) {
        this.dom.transactionListBody.innerHTML = '';
        if (transactions.length === 0) {
            this.dom.transactionListBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">거래 내역이 없습니다.</td></tr>';
            return;
        }
        
        const sorted = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(tx => {
            const tr = document.createElement('tr');
            tr.dataset.txId = tx.id;
            const total = new Decimal(tx.quantity || 0).times(new Decimal(tx.price || 0));
            tr.innerHTML = `
                <td>${tx.date}</td>
                <td><span class="${tx.type === 'buy' ? 'text-buy' : 'text-sell'}">${tx.type === 'buy' ? '매수' : '매도'}</span></td>
                <td style="text-align:right;">${Number(tx.quantity).toLocaleString()}</td>
                <td style="text-align:right;">${formatCurrency(tx.price, currency)}</td>
                <td style="text-align:right;">${formatCurrency(total, currency)}</td>
                <td style="text-align:center;"><button class="btn btn--delete btn--small" data-action="delete-tx">삭제</button></td>
            `;
            this.dom.transactionListBody.appendChild(tr);
        });
    },

    displaySkeleton() {
        const skeletonHTML = `
            <div class="skeleton-wrapper">
                <div class="skeleton-summary">
                    <div class="skeleton skeleton-summary-item"></div>
                    <div class="skeleton skeleton-summary-item"></div>
                    <div class="skeleton skeleton-summary-item"></div>
                </div>
                <div class="skeleton-table">
                    <div class="skeleton skeleton-table-row">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text--short"></div>
                    </div>
                    <div class="skeleton skeleton-table-row">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text--short"></div>
                    </div>
                    <div class="skeleton skeleton-table-row">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text--short"></div>
                    </div>
                     <div class="skeleton skeleton-table-row">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text--short"></div>
                    </div>
                </div>
            </div>
        `;
        this.dom.resultsSection.innerHTML = skeletonHTML;
        this.dom.resultsSection.classList.remove('hidden');
        this.dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    hideResults() {
        this.dom.resultsSection.innerHTML = '';
        this.dom.resultsSection.classList.add('hidden');
        this.dom.sectorAnalysisSection.innerHTML = '';
        this.dom.sectorAnalysisSection.classList.add('hidden');
        this.dom.chartSection.classList.add('hidden');
        
        if (this.currentObserver) {
            this.currentObserver.disconnect();
            this.currentObserver = null;
        }
    },

    displayResults(html) {
        if (this.currentObserver) {
            this.currentObserver.disconnect();
        }

        requestAnimationFrame(() => {
            this.dom.resultsSection.innerHTML = html;
            this.dom.resultsSection.classList.remove('hidden');
            this.dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const rows = this.dom.resultsSection.querySelectorAll('.result-row-highlight');
            
            this.currentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.transitionDelay = entry.target.dataset.delay;
                        entry.target.classList.add('in-view');
                        this.currentObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            rows.forEach((row) => {
                this.currentObserver.observe(row);
            });
        });
    },

    displaySectorAnalysis(html) {
         requestAnimationFrame(() => {
            this.dom.sectorAnalysisSection.innerHTML = html;
            this.dom.sectorAnalysisSection.classList.remove('hidden');
        });
    },
    
    displayChart(labels, data, title, Chart) {
        this.dom.chartSection.classList.remove('hidden');

        if (this.chartInstance) {
            this.chartInstance.data.labels = labels;
            this.chartInstance.data.datasets[0].data = data;
            this.chartInstance.options.plugins.title.text = title;
            this.chartInstance.update();
        } else {
            const ctx = this.dom.portfolioChart.getContext('2d');
            this.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '비중',
                        data: data,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                            '#C9CBCF', '#77DD77', '#FDFD96', '#836FFF', '#FFB347', '#FFD1DC'
                        ],
                        borderColor: document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: title,
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        }
    },

    toggleInputValidation(inputElement, isValid, errorMessage = '') {
        inputElement.classList.toggle('input-invalid', !isValid);
        inputElement.setAttribute('aria-invalid', String(!isValid));
        
        const errorClass = 'error-message';
        const parent = inputElement.parentElement;
        let errorEl = parent.querySelector(`.${errorClass}`);

        if (!isValid && errorMessage) {
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = errorClass;
                errorEl.style.cssText = `
                    color: var(--invalid-text-color);
                    font-size: 0.8rem;
                    width: 100%;
                    display: block;
                    margin-top: 4px;
                `;
                parent.appendChild(errorEl);
            }
            errorEl.textContent = errorMessage;
        } else if (errorEl) {
            errorEl.remove();
        }
    },
    
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};
```

---

## `js/controller.js`

```javascript
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Calculator } from './calculator.js';
import { Validator } from './validator.js';
import { CONFIG, MESSAGES } from './constants.js';
import { generateAddModeResultsHTML, generateSellModeResultsHTML, generateSectorAnalysisHTML } from './templates.js';
import { bindEventListeners } from './eventBinder.js';
import Chart from 'chart.js/auto';
import Decimal from 'decimal.js';

export class PortfolioController {
    constructor() {
        this.state = new PortfolioState();
        this.view = PortfolioView;
    }

    init() {
        this.view.cacheDomElements();
        bindEventListeners(this, this.view.dom);
        
        this.refreshUI();
        
        this.view.dom.darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }

    refreshUI() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) {
            console.error("No active portfolio found. Cannot refresh UI.");
            return;
        }

        const calculatedPortfolioData = Calculator.calculatePortfolioState({ portfolioData: activePortfolio.portfolioData });
        const { settings } = activePortfolio;

        this.view.renderPortfolioSelector(this.state.portfolios, this.state.activePortfolioId);
        this.view.renderTable(calculatedPortfolioData, settings.currentCurrency, settings.mainMode);
        this.view.updateMainModeUI(settings.mainMode);
        this.view.updateCurrencyModeUI(settings.currentCurrency);
        
        this.handleRatioUpdate();
        this.view.hideResults();
    }
    
    handleToggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        this.view.dom.darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDark);
    }

    handlePortfolioBodyChange(e) {
        const target = e.target;
        const row = target.closest('tr');
        if (!row || !target.dataset.field) return;

        const id = parseInt(row.dataset.id, 10);
        const field = target.dataset.field;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        this.handleStockUpdate(id, field, value, target);
    }

    handlePortfolioBodyClick(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const id = parseInt(button.closest('tr').dataset.id, 10);
        
        if (action === 'delete') {
            this.handleDeleteStock(id);
        } else if (action === 'manage') {
            const stock = this.state.getActivePortfolio().portfolioData.find(s => s.id === id);
            const currency = this.state.getActivePortfolio().settings.currentCurrency;
            if (stock) this.view.openTransactionModal(stock, currency);
        }
    }

    handleAddNewStock() {
        this.state.addNewStock();
        this.refreshUI();
    }

    handleDeleteStock(id) {
        if (this.state.deleteStock(id)) {
            this.refreshUI();
        }
    }

    handleStockUpdate(id, field, value, element) {
        const numericFields = ['targetRatio', 'currentPrice', 'fixedBuyAmount'];
        
        if (numericFields.includes(field)) {
            const { isValid, value: validatedValue, message } = Validator.validateNumericInput(value);
            this.view.toggleInputValidation(element, isValid, message);
            if (!isValid) return;
            
            this.state.updateStock(id, field, validatedValue);
        } else {
             this.state.updateStock(id, field, value);
        }

        const updatedStock = this.state.getActivePortfolio().portfolioData.find(s => s.id === id);
        if (element.type !== 'checkbox' && String(element.value) !== String(updatedStock[field])) {
            element.value = updatedStock[field];
        }
        
        if (['currentPrice', 'targetRatio', 'fixedBuyAmount', 'isFixedBuyEnabled'].includes(field)) {
            this.refreshUI();
        }
    }
    
    handleAddNewTransaction(e) {
        e.preventDefault();
        const dom = this.view.dom;
        const stockId = parseInt(dom.transactionModal.dataset.stockId, 10);
        if (!stockId) return;

        const txData = {
            type: dom.newTransactionForm.txType.value,
            date: dom.txDate.value,
            quantity: parseFloat(dom.txQuantity.value),
            price: parseFloat(dom.txPrice.value),
        };
        
        const validation = Validator.validateTransaction(txData);
        if (!validation.isValid) {
            this.view.showToast(validation.message, 'error');
            return;
        }

        if (this.state.addTransaction(stockId, txData)) {
            this.view.showToast(MESSAGES.TRANSACTION_ADDED, 'success');
            const currency = this.state.getActivePortfolio().settings.currentCurrency;
            const updatedStock = this.state.getActivePortfolio().portfolioData.find(s => s.id === stockId);
            this.view.renderTransactionList(updatedStock.transactions, currency);
            dom.newTransactionForm.reset();
            dom.txDate.valueAsDate = new Date();
            this.refreshUI();
        }
    }
    
    handleTransactionListClick(e) {
        const button = e.target.closest('button[data-action="delete-tx"]');
        if (!button) return;

        if (confirm(MESSAGES.CONFIRM_DELETE_TRANSACTION)) {
            const stockId = parseInt(this.view.dom.transactionModal.dataset.stockId, 10);
            const txId = button.closest('tr').dataset.txId;
            
            if (this.state.deleteTransaction(stockId, txId)) {
                this.view.showToast(MESSAGES.TRANSACTION_DELETED, 'info');
                const currency = this.state.getActivePortfolio().settings.currentCurrency;
                const updatedStock = this.state.getActivePortfolio().portfolioData.find(s => s.id === stockId);
                this.view.renderTransactionList(updatedStock.transactions, currency);
                this.refreshUI();
            }
        }
    }

    handleRatioUpdate() {
        const sum = this.state.getRatioSum();
        this.view.updateRatioSum(sum);
    }

    handleResetData() {
        if (confirm(MESSAGES.CONFIRM_RESET)) {
            const newPortfolio = this.state.loadTemplateData("초기화된 포트폴리오");
            this.state.getActivePortfolio().portfolioData = newPortfolio.data.portfolioData;
            this.refreshUI();
            this.view.showToast(MESSAGES.DATA_RESET, "info");
        }
    }

    handleNormalizeRatios() {
        if (!this.state.normalizeRatios()) {
            this.view.showToast(MESSAGES.NO_RATIOS_TO_NORMALIZE, "error");
            return;
        }
        this.refreshUI();
        this.view.showToast(MESSAGES.RATIOS_NORMALIZED, "success");
    }

    handleSaveData() { 
        const result = this.state.saveState();
        this.view.showToast(result.message, result.success ? "success" : "error");
    }

    handleLoadData() {
        if (confirm(MESSAGES.CONFIRM_LOAD)) {
            this.state.init();
            this.refreshUI();
            this.view.showToast(MESSAGES.LOAD_SUCCESS, 'info');
        }
    }

    handleExportData() {
        const dataToExport = {
            portfolios: this.state.portfolios,
            activePortfolioId: this.state.activePortfolioId
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolios_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleImportData() {
        this.view.dom.importFileInput.click();
    }

    handleFileSelected(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (!Validator.isDataStructureValid(importedData)) {
                    throw new Error("Invalid or corrupted file structure.");
                }
                
                this.state.portfolios = importedData.portfolios;
                this.state.activePortfolioId = importedData.activePortfolioId;
                this.state.saveState();
                this.refreshUI();
                this.view.showToast(MESSAGES.IMPORT_SUCCESS, "success");

            } catch (error) {
                console.error("File import error:", error);
                this.view.showToast(MESSAGES.IMPORT_ERROR, "error");
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    }
    
    handleNewPortfolio() {
        const name = prompt(MESSAGES.PROMPT_NEW_PORTFOLIO_NAME, `포트폴리오 ${Object.keys(this.state.portfolios).length + 1}`);
        if (name && name.trim()) {
            const newPortfolio = this.state.addPortfolio(name.trim());
            this.refreshUI();
            this.view.showToast(MESSAGES.PORTFOLIO_CREATED(newPortfolio.name), 'success');
        }
    }

    handleRenamePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        const newName = prompt(MESSAGES.PROMPT_RENAME_PORTFOLIO, activePortfolio.name);
        if (newName && newName.trim() && newName.trim() !== activePortfolio.name) {
            if (this.state.renamePortfolio(this.state.activePortfolioId, newName)) {
                this.refreshUI();
                this.view.showToast(MESSAGES.PORTFOLIO_RENAMED, 'success');
            }
        }
    }
    
    handleDeletePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (confirm(MESSAGES.CONFIRM_DELETE_PORTFOLIO(activePortfolio.name))) {
            if (this.state.deletePortfolio(this.state.activePortfolioId)) {
                this.refreshUI();
                this.view.showToast(MESSAGES.PORTFOLIO_DELETED, 'info');
            } else {
                this.view.showToast(MESSAGES.LAST_PORTFOLIO_DELETE_ERROR, 'error');
            }
        }
    }

    handleSwitchPortfolio() {
        const selectedId = this.view.dom.portfolioSelector.value;
        if(this.state.switchPortfolio(selectedId)) {
            this.state.saveState();
            this.refreshUI();
        }
    }

    handleMainModeChange(mode) {
        this.state.getActivePortfolio().settings.mainMode = mode;
        this.refreshUI();
    }

    handleCurrencyModeChange(mode) {
        this.state.getActivePortfolio().settings.currentCurrency = mode;
        this.refreshUI();
    }
    
    handleCurrencyConversion(source) {
        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio.settings.currentCurrency !== 'usd') return;
        try {
            const rateVal = parseFloat(this.view.dom.exchangeRateInput.value);
            if (isNaN(rateVal) || rateVal <= 0) return;

            const rate = new Decimal(rateVal);
            if (source === 'krw') {
                const krwAmount = new Decimal(this.view.dom.additionalAmountInput.value || 0);
                this.view.dom.additionalAmountUSDInput.value = krwAmount.div(rate).toDecimalPlaces(2).toString();
            } else {
                const usdAmount = new Decimal(this.view.dom.additionalAmountUSDInput.value || 0);
                this.view.dom.additionalAmountInput.value = usdAmount.times(rate).round().toString();
            }
        } catch (e) { console.error("Currency conversion error:", e); }
    }

    getInvestmentAmountInKRW() {
        const dom = this.view.dom;
        const currency = this.state.getActivePortfolio().settings.currentCurrency;
        if (currency === 'krw') {
            return new Decimal(dom.additionalAmountInput.value || 0);
        } else {
            const usdAmount = new Decimal(dom.additionalAmountUSDInput.value || 0);
            const rate = new Decimal(dom.exchangeRateInput.value || CONFIG.DEFAULT_EXCHANGE_RATE);
            return usdAmount.times(rate).round();
        }
    }

    async handleCalculate() {
        this.view.displaySkeleton();
        await new Promise(resolve => setTimeout(resolve, 300));

        const activePortfolio = this.state.getActivePortfolio();
        const { settings } = activePortfolio;
        const { mainMode, currentCurrency } = settings;
        
        const calculatedPortfolioData = Calculator.calculatePortfolioState({ portfolioData: activePortfolio.portfolioData });
        const additionalInvestment = this.getInvestmentAmountInKRW();

        const validationErrors = Validator.validateForCalculation({ mainMode, portfolioData: calculatedPortfolioData, additionalInvestment });
        if (validationErrors.length > 0) {
            this.view.displayResults(''); 
            this.view.showToast(
                [MESSAGES.VALIDATION_ERROR_PREFIX, ...validationErrors].join('\n'),
                'error'
            );
            return;
        }

        try {
            const currency = currentCurrency.toUpperCase();
            
            if (mainMode === 'add') {
                const totalRatio = this.state.getRatioSum();
                if (Math.abs(totalRatio - 100) > CONFIG.RATIO_TOLERANCE && totalRatio > 0) {
                     if (!confirm(MESSAGES.CONFIRM_RATIO_SUM_WARN(totalRatio))) {
                        this.view.displayResults('');
                        return;
                     }
                }
                const { results, summary } = Calculator.calculateAddRebalancing({ portfolioData: calculatedPortfolioData, additionalInvestment });
                this.view.displayResults(generateAddModeResultsHTML(results, summary, currency));
            } else {
                const { results } = Calculator.calculateSellRebalancing({ portfolioData: calculatedPortfolioData });
                this.view.displayResults(generateSellModeResultsHTML(results, currency));
            }
            
            const sectorResults = Calculator.analyzeSectors({ portfolioData: calculatedPortfolioData });
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorResults, currency));

            const chartData = activePortfolio.portfolioData.filter(stock => stock.targetRatio > 0);
            const labels = chartData.map(stock => stock.name);
            const data = chartData.map(stock => stock.targetRatio);

            this.view.displayChart(labels, data, '목표 비율(%) 구성', Chart);

        } catch (error) {
            console.error("Calculation Error:", error);
            if (error instanceof Decimal.Error) {
                this.view.showToast(MESSAGES.CALC_ERROR_DECIMAL, "error");
            } else if (error instanceof TypeError) {
                this.view.showToast(MESSAGES.CALC_ERROR_TYPE, "error");
            } else {
                this.view.showToast(MESSAGES.CALCULATION_ERROR, "error");
            }
        }
    }
}
```