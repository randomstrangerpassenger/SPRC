// e2e/app.spec.ts

import { test, expect } from '@playwright/test';

// 테스트 1: 페이지가 올바르게 로드되는지 확인
test('페이지 로드 및 제목 확인', async ({ page }) => {
  // 1. baseURL (http://localhost:5173)로 이동
  await page.goto('/');

  // 2. <title> 태그의 텍스트가 올바른지 확인
  await expect(page).toHaveTitle(/포트폴리오 리밸런싱 계산기/);

  // 3. h1 제목이 보이는지 확인
  await expect(
    page.getByRole('heading', { name: '📊 포트폴리오 리밸런싱 계산기' })
  ).toBeVisible();
});

// 테스트 2: '간단 계산 모드' E2E 시나리오
test('간단 계산 모드 워크플로우 테스트', async ({ page }) => {
  // 1. 페이지 방문
  await page.goto('/');

  // 2. '간단 계산 모드' 라디오 버튼 선택 (기본값이지만 명시적으로 확인)
  const simpleModeRadio = page.getByLabel('🎯 간단 계산 모드');
  await simpleModeRadio.check();
  await expect(simpleModeRadio).toBeChecked();

  // 3. 첫 번째 (기본 "새 종목") 행의 입력 필드 채우기
  // 가상 스크롤의 첫 번째 행을 찾습니다.
  const firstRow = page.locator('.virtual-row-inputs').first();

  // '새 종목' 이름을 '테스트 주식'으로 변경
  await firstRow.getByRole('textbox', { name: /티커/ }).fill('TEST');
  await firstRow.getByRole('spinbutton', { name: /목표 비율/ }).fill('100');
  await firstRow.getByRole('spinbutton', { name: /보유 금액/ }).fill('100000');

  // 4. 추가 투자 금액 입력
  await page.getByLabel('추가 투자 금액:').fill('50000');

  // 5. 계산하기 버튼 클릭
  await page.getByRole('button', { name: '계산하기' }).click();

  // 6. 결과 확인
  const resultsSection = page.locator('#resultsSection');
  
  // 6-1. 결과 섹션이 보이는지 확인
  await expect(resultsSection).toBeVisible();

  // 6-2. 요약 정보가 올바른지 확인 (총 자산 100,000 + 50,000 = 150,000)
  await expect(page.getByText('투자 후 총 자산')).toBeVisible();
  // formatCurrency 함수가 콤마를 사용하므로 '150,000'으로 확인
  await expect(resultsSection.getByText('150,000')).toBeVisible(); 

  // 6-3. 구매 가이드에 올바른 금액이 표시되는지 확인 (목표 150,000 - 현재 100,000 = 50,000)
  const guideBox = resultsSection.locator('.guide-box--buy');
  // 'formatCurrency'는 '원'을 붙이므로 '50,000원'을 확인합니다.
  await expect(guideBox.getByText(/TEST.*50,000원/)).toBeVisible();
});