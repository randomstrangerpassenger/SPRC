# SPRC - 주식 포트폴리오 관리 앱

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정 (중요!)

현재가 조회 기능을 사용하려면 Finnhub API 키가 필요합니다.

1. `.env.example` 파일을 `.env`로 복사:
   ```bash
   cp .env.example .env
   ```

2. [Finnhub](https://finnhub.io/register)에서 무료 API 키 발급

3. `.env` 파일을 열고 발급받은 API 키를 입력:
   ```
   VITE_FINNHUB_API_KEY=your_actual_api_key_here
   ```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

## 주요 기능

- 포트폴리오 관리 (추가, 수정, 삭제)
- 주식 종목 관리
- 실시간 현재가 조회 (Finnhub API)
- 비율 계산 및 자동 조정
- 간단 계산기 모드
- 데이터 가져오기/내보내기

## 문제 해결

### 현재가 조회가 작동하지 않는 경우

1. `.env` 파일이 존재하고 올바른 API 키가 설정되어 있는지 확인
2. 개발 서버를 재시작 (환경 변수 변경 시 필요)
3. Finnhub API 키가 유효한지 확인
4. 브라우저 콘솔에서 에러 메시지 확인
