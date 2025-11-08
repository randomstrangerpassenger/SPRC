# 사용 예시 (Usage Examples)

이 문서는 새로 추가된 Excel, PDF, Email 기능을 실제로 사용하는 방법을 단계별로 안내합니다.

## 빠른 시작

### 1. Excel 파일로 내보내기

```typescript
// src/controller.ts 또는 다른 컨트롤러 파일에서

// 방법 1: DataManager 인스턴스를 통해 (권장)
await this.dataManager.handleExportExcel();

// 방법 2: 서비스를 직접 사용
import { ExcelExportService } from './services';
const portfolio = this.state.getActivePortfolio();
if (portfolio) {
    await ExcelExportService.exportPortfolioToExcel(portfolio);
}
```

**결과**: `portfolio_{포트폴리오명}_{타임스탬프}.xlsx` 파일이 다운로드됩니다.

### 2. PDF 리포트 생성

```typescript
// 방법 1: DataManager를 통해
await this.dataManager.handleGeneratePDFReport();

// 방법 2: 서비스를 직접 사용
import { PDFReportService } from './services';
const portfolio = this.state.getActivePortfolio();
if (portfolio) {
    await PDFReportService.generatePortfolioReport(portfolio);
}
```

**결과**: `portfolio_report_{포트폴리오명}_{타임스탬프}.pdf` 파일이 다운로드됩니다.

### 3. 이메일로 리포트 전송

#### Step 1: 이메일 서버 시작

터미널에서:
```bash
# 환경 변수 설정
cd server
cp .env.example .env
# .env 파일을 편집하여 이메일 설정 입력

# 서버 시작
npm run server
```

#### Step 2: 이메일 전송

```typescript
// 방법 1: 기본 이메일 설정 사용 (서버의 .env 파일 사용)
await this.dataManager.handleSendEmailReport('recipient@example.com');

// 방법 2: 커스텀 이메일 설정 사용
import { type EmailConfig } from './services';

const emailConfig: EmailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
    }
};

await this.dataManager.handleSendEmailReport(
    'recipient@example.com',
    emailConfig,
    {
        includeExcel: true,  // Excel 첨부
        includePDF: true     // PDF 첨부
    }
);

// 방법 3: Excel만 첨부
await this.dataManager.handleSendEmailReport(
    'recipient@example.com',
    undefined,
    { includeExcel: true, includePDF: false }
);
```

## UI에 버튼 추가하는 방법

### HTML 버튼 추가 (index.html)

기존의 export 버튼들 근처에 새 버튼을 추가하세요:

```html
<!-- 기존 버튼 -->
<button id="exportDataBtn">JSON 내보내기</button>
<button id="exportTransactionsCSVBtn">거래내역 CSV</button>

<!-- 새로운 버튼 추가 -->
<button id="exportExcelBtn">📊 Excel 내보내기</button>
<button id="generatePDFBtn">📄 PDF 리포트</button>
<button id="sendEmailBtn">📧 이메일 전송</button>
```

### 컨트롤러에 이벤트 리스너 추가 (controller.ts)

```typescript
// src/controller.ts의 setupEventListeners() 메서드에 추가

private setupEventListeners(): void {
    // ... 기존 코드 ...

    // Excel 내보내기 버튼
    this.view.dom.exportExcelBtn?.addEventListener('click', async () => {
        await this.dataManager.handleExportExcel();
    });

    // PDF 리포트 생성 버튼
    this.view.dom.generatePDFBtn?.addEventListener('click', async () => {
        await this.dataManager.handleGeneratePDFReport();
    });

    // 이메일 전송 버튼
    this.view.dom.sendEmailBtn?.addEventListener('click', async () => {
        // 이메일 주소 입력받기
        const email = prompt('이메일 주소를 입력하세요:');
        if (email) {
            await this.dataManager.handleSendEmailReport(email);
        }
    });
}
```

### View에 DOM 참조 추가 (view.ts)

```typescript
// src/view/index.ts 또는 view.ts

export class PortfolioView {
    readonly dom = {
        // ... 기존 DOM 참조 ...
        exportExcelBtn: document.getElementById('exportExcelBtn'),
        generatePDFBtn: document.getElementById('generatePDFBtn'),
        sendEmailBtn: document.getElementById('sendEmailBtn'),
    };
}
```

## 고급 사용 예시

### 1. 이메일 설정 모달 만들기

```typescript
// 이메일 설정을 위한 모달 표시
function showEmailConfigModal(callback: (config: EmailConfig) => void): void {
    // 모달 HTML 생성
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="modal">
            <h2>이메일 설정</h2>
            <input id="emailHost" placeholder="SMTP Host" value="smtp.gmail.com">
            <input id="emailPort" placeholder="Port" value="587" type="number">
            <input id="emailUser" placeholder="Email Address">
            <input id="emailPass" placeholder="App Password" type="password">
            <button id="saveEmailConfig">저장</button>
            <button id="cancelEmailConfig">취소</button>
        </div>
    `;

    document.body.appendChild(modal);

    // 저장 버튼 이벤트
    document.getElementById('saveEmailConfig')?.addEventListener('click', () => {
        const config: EmailConfig = {
            host: (document.getElementById('emailHost') as HTMLInputElement).value,
            port: parseInt((document.getElementById('emailPort') as HTMLInputElement).value),
            secure: false,
            auth: {
                user: (document.getElementById('emailUser') as HTMLInputElement).value,
                pass: (document.getElementById('emailPass') as HTMLInputElement).value
            }
        };

        callback(config);
        document.body.removeChild(modal);
    });

    // 취소 버튼 이벤트
    document.getElementById('cancelEmailConfig')?.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// 사용
this.view.dom.sendEmailBtn?.addEventListener('click', async () => {
    const email = prompt('이메일 주소를 입력하세요:');
    if (email) {
        showEmailConfigModal(async (config) => {
            await this.dataManager.handleSendEmailReport(email, config);
        });
    }
});
```

### 2. 이메일 설정을 로컬 스토리지에 저장

```typescript
// 이메일 설정 저장
function saveEmailConfig(config: EmailConfig): void {
    // 비밀번호는 저장하지 않는 것을 권장
    const configToSave = {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user
        // pass는 저장하지 않음
    };
    localStorage.setItem('emailConfig', JSON.stringify(configToSave));
}

// 이메일 설정 불러오기
function loadEmailConfig(): Partial<EmailConfig> | null {
    const saved = localStorage.getItem('emailConfig');
    if (saved) {
        const config = JSON.parse(saved);
        return {
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: '' // 매번 입력받아야 함
            }
        };
    }
    return null;
}

// 사용
const savedConfig = loadEmailConfig();
if (savedConfig) {
    // 비밀번호만 입력받기
    const password = prompt('이메일 앱 비밀번호를 입력하세요:');
    if (password && savedConfig.auth) {
        savedConfig.auth.pass = password;
        await this.dataManager.handleSendEmailReport(
            'recipient@example.com',
            savedConfig as EmailConfig
        );
    }
}
```

### 3. 일괄 내보내기 (모든 형식으로 한번에)

```typescript
async function exportAllFormats(): Promise<void> {
    try {
        // 1. Excel 내보내기
        await this.dataManager.handleExportExcel();

        // 2. PDF 생성
        await this.dataManager.handleGeneratePDFReport();

        // 3. CSV 내보내기
        this.dataManager.handleExportTransactionsCSV();

        // 4. JSON 내보내기
        this.dataManager.handleExportData();

        this.view.showToast('모든 형식으로 내보내기 완료!', 'success');
    } catch (error) {
        this.view.showToast('일부 내보내기 실패', 'error');
    }
}

// 버튼에 연결
this.view.dom.exportAllBtn?.addEventListener('click', async () => {
    await exportAllFormats();
});
```

### 4. 서버 상태 확인 후 이메일 전송

```typescript
import { EmailService } from './services';

async function sendEmailWithCheck(email: string): Promise<void> {
    // 1. 서버 상태 확인
    const isServerRunning = await EmailService.checkServerHealth();

    if (!isServerRunning) {
        this.view.showToast(
            '이메일 서버가 실행 중이지 않습니다. npm run server를 실행하세요.',
            'error'
        );
        return;
    }

    // 2. 이메일 설정 테스트
    const config = loadEmailConfig();
    if (config) {
        const isValid = await EmailService.testEmailConfig(config as EmailConfig);
        if (!isValid) {
            this.view.showToast('이메일 설정이 올바르지 않습니다.', 'error');
            return;
        }
    }

    // 3. 이메일 전송
    await this.dataManager.handleSendEmailReport(email, config as EmailConfig);
}
```

### 5. HTML 요소를 PDF로 변환

```typescript
import { PDFReportService } from './services';

// 특정 HTML 요소를 PDF로 변환
async function exportElementToPDF(elementId: string): Promise<void> {
    await PDFReportService.generateReportFromHTML(
        elementId,
        `custom_report_${Date.now()}.pdf`
    );
}

// 차트를 PDF로 내보내기
this.view.dom.exportChartBtn?.addEventListener('click', async () => {
    await exportElementToPDF('myChart');
});

// 전체 대시보드를 PDF로 내보내기
this.view.dom.exportDashboardBtn?.addEventListener('click', async () => {
    await exportElementToPDF('dashboard');
});
```

## 테스트 코드 예시

```typescript
// tests/exportServices.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { ExcelExportService, PDFReportService, EmailService } from '../src/services';
import type { Portfolio } from '../src/types';

describe('Export Services', () => {
    let mockPortfolio: Portfolio;

    beforeEach(() => {
        mockPortfolio = {
            id: 'test-1',
            name: 'Test Portfolio',
            portfolioData: [],
            settings: {
                mainMode: 'add',
                currentCurrency: 'usd',
                exchangeRate: 1300
            }
        };
    });

    it('should export to Excel', async () => {
        await expect(
            ExcelExportService.exportPortfolioToExcel(mockPortfolio)
        ).resolves.not.toThrow();
    });

    it('should generate PDF report', async () => {
        await expect(
            PDFReportService.generatePortfolioReport(mockPortfolio)
        ).resolves.not.toThrow();
    });

    it('should check email server health', async () => {
        const health = await EmailService.checkServerHealth();
        expect(typeof health).toBe('boolean');
    });
});
```

## 문제 해결 체크리스트

### Excel 내보내기가 안 될 때
- [ ] exceljs가 설치되어 있나요? (`npm list exceljs`)
- [ ] 포트폴리오에 데이터가 있나요?
- [ ] 브라우저 콘솔에 오류가 있나요?
- [ ] 다운로드가 차단되지 않았나요?

### PDF 생성이 안 될 때
- [ ] jspdf가 설치되어 있나요? (`npm list jspdf`)
- [ ] html2canvas가 설치되어 있나요? (`npm list html2canvas`)
- [ ] 브라우저 팝업이 차단되지 않았나요?
- [ ] 메모리 부족 오류가 발생하지 않았나요? (큰 포트폴리오의 경우)

### 이메일 전송이 안 될 때
- [ ] 이메일 서버가 실행 중인가요? (`npm run server`)
- [ ] `.env` 파일이 올바르게 설정되어 있나요?
- [ ] Gmail 앱 비밀번호를 사용하고 있나요?
- [ ] 네트워크 연결이 정상인가요?
- [ ] 방화벽이 포트 3001, 587을 차단하고 있지 않나요?

## 추가 리소스

- [exceljs 문서](https://github.com/exceljs/exceljs)
- [jspdf 문서](https://github.com/parallax/jsPDF)
- [html2canvas 문서](https://html2canvas.hertzen.com/)
- [nodemailer 문서](https://nodemailer.com/)
- [Gmail 앱 비밀번호 만들기](https://support.google.com/accounts/answer/185833)
