# Portfolio Export & Report Features

이 문서는 새로 추가된 Excel 내보내기, PDF 리포트 생성, 이메일 전송 기능에 대한 설명입니다.

## 📋 목차

1. [설치된 라이브러리](#설치된-라이브러리)
2. [Excel 내보내기](#excel-내보내기)
3. [PDF 리포트 생성](#pdf-리포트-생성)
4. [이메일 리포트 전송](#이메일-리포트-전송)
5. [사용 방법](#사용-방법)
6. [API 문서](#api-문서)

## 설치된 라이브러리

### 프론트엔드 라이브러리
- **exceljs** (^4.4.0): Excel 파일 생성 및 조작
- **jspdf** (^3.0.3): PDF 문서 생성
- **html2canvas** (^1.4.1): HTML 요소를 캔버스로 변환 (차트 캡처용)

### 백엔드 라이브러리
- **nodemailer** (^7.0.10): 이메일 전송
- **express** (^5.1.0): 백엔드 서버
- **cors** (^2.8.5): CORS 처리

## Excel 내보내기

### 기능 설명
exceljs 라이브러리를 사용하여 포트폴리오 데이터를 Excel 파일(.xlsx)로 내보냅니다.

### 포함 내용
Excel 파일에는 다음 3개의 시트가 포함됩니다:

#### 1. Portfolio Summary (포트폴리오 요약)
- 포트폴리오 기본 정보
- 종목별 요약 테이블
  - 종목명, 티커, 섹터
  - 목표 비율, 현재가
  - 거래 내역 개수
  - 고정 매수 설정

#### 2. Transactions (거래 내역)
- 모든 거래 내역을 날짜순으로 정렬
- 거래 유형별 색상 구분
  - 매수 (Buy): 연한 녹색
  - 매도 (Sell): 연한 주황색
  - 배당 (Dividend): 회색
- 컬럼: 종목명, 티커, 거래유형, 날짜, 수량, 단가, 총액

#### 3. Stock Details (종목별 상세)
- 종목별 상세 통계
- 컬럼: 종목명, 티커, 섹터, 목표비율, 현재가, 총 매수량, 총 매도량, 순 보유량, 평균 매수가, 총 투자금, 현재가치, 미실현 손익, 미실현 손익률
- 손익에 따른 색상 표시 (수익: 녹색, 손실: 빨강)

### 코드 예시
```typescript
import { ExcelExportService } from './services';

// DataManager에서 사용
await dataManager.handleExportExcel();

// 직접 사용
const portfolio = state.getActivePortfolio();
await ExcelExportService.exportPortfolioToExcel(portfolio);
```

## PDF 리포트 생성

### 기능 설명
jspdf와 html2canvas 라이브러리를 사용하여 포트폴리오 리포트를 PDF로 생성합니다.

### 포함 내용
- **헤더**: 포트폴리오 리포트 제목
- **포트폴리오 정보**: 이름, 환율, 통화 모드, 생성 날짜
- **포트폴리오 요약**: 총 종목 수, 총 투자금, 현재 가치, 총 손익
- **종목 보유 현황 테이블**: 종목명, 티커, 수량, 평균가, 현재가, 가치, 손익률
- **차트 시각화** (옵션): 페이지에 표시된 차트를 캡처하여 PDF에 포함

### 특징
- A4 용지 크기로 자동 포맷팅
- 여러 페이지 자동 생성
- 손익에 따른 색상 표시 (수익: 녹색, 손실: 빨강)
- 짝수/홀수 행 구분을 위한 교대 배경색

### 코드 예시
```typescript
import { PDFReportService } from './services';

// DataManager에서 사용
await dataManager.handleGeneratePDFReport();

// 직접 사용
const portfolio = state.getActivePortfolio();
await PDFReportService.generatePortfolioReport(portfolio);

// HTML 요소를 PDF로 변환
await PDFReportService.generateReportFromHTML('elementId', 'filename.pdf');
```

## 이메일 리포트 전송

### 기능 설명
nodemailer 라이브러리를 사용하여 포트폴리오 리포트를 이메일로 전송합니다.

### 아키텍처
```
Frontend (EmailService)
    ↓ HTTP Request
Backend Server (Express + Nodemailer)
    ↓ SMTP
Email Server (Gmail, etc.)
```

### 백엔드 서버 설정

#### 1. 환경 변수 설정
`server/.env` 파일을 생성하고 다음 내용을 입력:

```env
PORT=3001

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Gmail 앱 비밀번호 사용 권장
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Gmail 사용 시 앱 비밀번호 생성:**
1. Google 계정 설정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. 생성된 16자리 비밀번호를 `EMAIL_PASS`에 입력

#### 2. 서버 시작
```bash
# 이메일 서버만 시작
npm run server

# 개발 서버와 이메일 서버 동시 시작
npm run dev:full

# 또는 별도 터미널에서
# Terminal 1
npm run dev

# Terminal 2
npm run server
```

서버가 성공적으로 시작되면:
```
Email server is running on port 3001
Health check: http://localhost:3001/api/health
```

### 이메일 내용
- **Subject**: "Portfolio Report - {포트폴리오명}"
- **HTML 본문**: 포트폴리오 요약 정보를 보기 좋게 포맷팅
- **첨부파일**:
  - Excel 파일 (.xlsx)
  - PDF 리포트 (.pdf)

### 코드 예시
```typescript
import { EmailService, type EmailConfig } from './services';

// 기본 설정으로 전송 (서버의 .env 파일 사용)
await dataManager.handleSendEmailReport('recipient@example.com');

// 커스텀 이메일 설정으로 전송
const emailConfig: EmailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
    }
};

await dataManager.handleSendEmailReport(
    'recipient@example.com',
    emailConfig,
    { includeExcel: true, includePDF: true }
);

// 서버 상태 확인
const isRunning = await EmailService.checkServerHealth();
console.log('Server running:', isRunning);

// 이메일 설정 테스트
const isValid = await EmailService.testEmailConfig(emailConfig);
console.log('Config valid:', isValid);
```

## 사용 방법

### UI에서 사용 (예정)
UI에 다음 버튼들이 추가될 예정입니다:
- **Excel 내보내기 버튼**: 포트폴리오를 Excel 파일로 다운로드
- **PDF 리포트 버튼**: PDF 리포트 생성 및 다운로드
- **이메일 전송 버튼**: 리포트를 이메일로 전송

### 프로그래밍 방식으로 사용

#### 1. DataManager 사용 (권장)
```typescript
const dataManager = new DataManager(state, view);

// Excel 내보내기
await dataManager.handleExportExcel();

// PDF 리포트 생성
await dataManager.handleGeneratePDFReport();

// 이메일 전송
await dataManager.handleSendEmailReport('user@example.com');
```

#### 2. 서비스 직접 사용
```typescript
import { ExcelExportService, PDFReportService, EmailService } from './services';

const portfolio = state.getActivePortfolio();

// Excel 내보내기
await ExcelExportService.exportPortfolioToExcel(portfolio);

// PDF 생성
await PDFReportService.generatePortfolioReport(portfolio);

// 이메일 전송
await EmailService.sendPortfolioReport(
    portfolio,
    'user@example.com',
    undefined,
    { includeExcel: true, includePDF: true }
);
```

## API 문서

### 백엔드 API 엔드포인트

#### POST /api/send-email
이메일 전송

**Request Body:**
```json
{
    "to": "recipient@example.com",
    "subject": "Portfolio Report",
    "html": "<h1>Report</h1>",
    "text": "Report text",
    "attachments": [
        {
            "filename": "report.xlsx",
            "content": "base64-encoded-content",
            "encoding": "base64"
        }
    ],
    "emailConfig": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false,
        "auth": {
            "user": "email@gmail.com",
            "pass": "app-password"
        }
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Email sent successfully",
    "messageId": "<unique-id@domain>"
}
```

#### POST /api/test-email-config
이메일 설정 테스트

**Request Body:**
```json
{
    "emailConfig": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false,
        "auth": {
            "user": "email@gmail.com",
            "pass": "app-password"
        }
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Email configuration is valid"
}
```

#### GET /api/health
서버 상태 확인

**Response:**
```json
{
    "status": "ok",
    "message": "Email server is running",
    "timestamp": "2025-11-08T12:00:00.000Z"
}
```

## 문제 해결

### Excel 내보내기가 작동하지 않음
- 브라우저 콘솔에서 오류 메시지 확인
- 포트폴리오에 데이터가 있는지 확인
- exceljs 라이브러리가 설치되어 있는지 확인: `npm list exceljs`

### PDF 생성이 작동하지 않음
- jspdf와 html2canvas가 설치되어 있는지 확인
- 브라우저 팝업 차단 설정 확인
- 차트가 렌더링되지 않은 경우 차트 없이 PDF 생성

### 이메일 전송 실패
1. **서버가 실행 중인지 확인**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **이메일 설정 확인**
   - `.env` 파일이 `server/` 디렉토리에 있는지 확인
   - Gmail 앱 비밀번호를 사용하는지 확인
   - 2단계 인증이 활성화되어 있는지 확인

3. **CORS 오류**
   - 프론트엔드와 백엔드가 다른 포트에서 실행 중
   - 백엔드에 CORS가 활성화되어 있음 (cors 미들웨어 사용)

4. **네트워크 오류**
   - SMTP 포트(587)가 방화벽에서 차단되지 않았는지 확인
   - 인터넷 연결 확인

## 파일 구조

```
SPRC/
├── src/
│   ├── services/
│   │   ├── ExcelExportService.ts    # Excel 내보내기 서비스
│   │   ├── PDFReportService.ts      # PDF 리포트 생성 서비스
│   │   ├── EmailService.ts          # 이메일 전송 서비스 (프론트엔드)
│   │   └── index.ts                 # 서비스 내보내기
│   └── controller/
│       └── DataManager.ts           # 업데이트된 DataManager
├── server/
│   ├── emailServer.ts               # 이메일 백엔드 서버
│   ├── .env.example                 # 환경 변수 예시
│   └── .env                         # 실제 환경 변수 (gitignore)
├── package.json                     # 업데이트된 scripts
└── EXPORT_FEATURES_README.md        # 이 문서
```

## 다음 단계

1. UI에 버튼 추가
2. 이메일 설정을 위한 모달 UI 추가
3. 사용자가 이메일 설정을 로컬 스토리지에 저장할 수 있는 기능
4. 예약 이메일 전송 기능 (선택 사항)
5. 다양한 리포트 템플릿 (선택 사항)

## 라이센스

이 프로젝트의 라이센스를 따릅니다.
