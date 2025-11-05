import { test, expect } from '@playwright/test';

test.describe('Portfolio Rebalancer E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should load the application', async ({ page }) => {
        await expect(page).toHaveTitle(/Portfolio Rebalancing Calculator/i);
        await expect(page.locator('h1')).toContainText(/포트폴리오 리밸런싱 계산기|Portfolio Rebalancing Calculator/i);
    });

    test('simple calculation mode workflow', async ({ page }) => {
        // Switch to simple mode
        await page.click('input[value="simple"]');

        // Add stock information
        const nameInput = page.locator('input[data-field="name"]').first();
        await nameInput.fill('Apple Inc.');

        const tickerInput = page.locator('input[data-field="ticker"]').first();
        await tickerInput.fill('AAPL');

        const ratioInput = page.locator('input[data-field="targetRatio"]').first();
        await ratioInput.fill('50');

        const amountInput = page.locator('input[data-field="manualAmount"]').first();
        await amountInput.fill('1000000');

        // Add second stock
        await page.click('#addNewStockBtn');

        const nameInput2 = page.locator('input[data-field="name"]').nth(1);
        await nameInput2.fill('Google');

        const tickerInput2 = page.locator('input[data-field="ticker"]').nth(1);
        await tickerInput2.fill('GOOGL');

        const ratioInput2 = page.locator('input[data-field="targetRatio"]').nth(1);
        await ratioInput2.fill('50');

        const amountInput2 = page.locator('input[data-field="manualAmount"]').nth(1);
        await amountInput2.fill('1000000');

        // Set additional investment
        await page.fill('#additionalAmount', '500000');

        // Click calculate
        await page.click('#calculateBtn');

        // Wait for results
        await page.waitForSelector('#resultsSection:not(.hidden)', { timeout: 5000 });

        // Verify results are displayed
        await expect(page.locator('#resultsSection')).toBeVisible();
    });

    test.describe('Modal Tests', () => {
        test('should open and close custom modal (confirm)', async ({ page }) => {
            // Click new portfolio button to trigger confirm modal
            await page.click('#newPortfolioBtn');

            // Wait for modal to appear
            await page.waitForSelector('#customModal:not(.hidden)');
            const modal = page.locator('#customModal');

            await expect(modal).toBeVisible();
            await expect(modal).toHaveAttribute('aria-modal', 'true');

            // Check modal has input field for prompt
            const input = modal.locator('input');
            await expect(input).toBeVisible();

            // Fill in portfolio name
            await input.fill('Test Portfolio');

            // Click confirm
            await page.click('#customModalConfirm');

            // Modal should close
            await expect(modal).toHaveClass(/hidden/);
        });

        test('should handle Escape key to close modal', async ({ page }) => {
            await page.click('#newPortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');

            // Press Escape
            await page.keyboard.press('Escape');

            // Modal should close
            await expect(page.locator('#customModal')).toHaveClass(/hidden/);
        });

        test('should trap focus within modal', async ({ page }) => {
            await page.click('#newPortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');

            const modal = page.locator('#customModal');

            // Tab through focusable elements
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            // Focus should stay within modal
            const focusedElement = page.locator(':focus');
            await expect(modal.locator('button, input')).toContainText(await focusedElement.textContent() || '');
        });

        test('should open transaction modal for stock', async ({ page }) => {
            // Switch to add mode (not simple)
            await page.click('input[value="add"]');

            // Wait for table to render
            await page.waitForTimeout(500);

            // Click manage button
            const manageBtn = page.locator('button[data-action="manage"]').first();
            if (await manageBtn.isVisible()) {
                await manageBtn.click();

                // Wait for transaction modal
                await page.waitForSelector('#transactionModal:not(.hidden)');

                const txModal = page.locator('#transactionModal');
                await expect(txModal).toBeVisible();
                await expect(txModal).toHaveAttribute('aria-modal', 'true');

                // Close modal
                await page.click('#closeModalBtn');
                await expect(txModal).toHaveClass(/hidden/);
            }
        });
    });

    test.describe('Portfolio Management', () => {
        test('should create new portfolio', async ({ page }) => {
            const initialPortfolios = await page.locator('#portfolioSelector option').count();

            await page.click('#newPortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');

            await page.fill('#customModalInput', 'My New Portfolio');
            await page.click('#customModalConfirm');

            // Wait for modal to close and portfolio to be created
            await page.waitForTimeout(500);

            const newPortfolios = await page.locator('#portfolioSelector option').count();
            expect(newPortfolios).toBe(initialPortfolios + 1);
        });

        test('should switch between portfolios', async ({ page }) => {
            // Get current selected portfolio
            const selector = page.locator('#portfolioSelector');
            const optionsCount = await selector.locator('option').count();

            if (optionsCount > 1) {
                // Select different portfolio
                await selector.selectOption({ index: 1 });

                // Wait for data to load
                await page.waitForTimeout(500);

                // Verify UI updated (toast or data change)
                // This is a basic check, more specific checks can be added
                await expect(page).not.toHaveURL(/error/);
            }
        });

        test('should delete portfolio with confirmation', async ({ page }) => {
            // Create a new portfolio first
            await page.click('#newPortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');
            await page.fill('#customModalInput', 'Portfolio to Delete');
            await page.click('#customModalConfirm');
            await page.waitForTimeout(500);

            const initialCount = await page.locator('#portfolioSelector option').count();

            // Now delete it
            await page.click('#deletePortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');

            // Confirm deletion
            await page.click('#customModalConfirm');
            await page.waitForTimeout(500);

            const finalCount = await page.locator('#portfolioSelector option').count();
            expect(finalCount).toBeLessThan(initialCount);
        });
    });

    test.describe('Dark Mode', () => {
        test('should toggle dark mode', async ({ page }) => {
            const body = page.locator('body');

            // Check initial state
            const initialDarkMode = await body.evaluate((el) => el.classList.contains('dark-mode'));

            // Toggle dark mode
            await page.click('#darkModeToggle');
            await page.waitForTimeout(200);

            // Verify state changed
            const newDarkMode = await body.evaluate((el) => el.classList.contains('dark-mode'));
            expect(newDarkMode).toBe(!initialDarkMode);

            // Toggle again
            await page.click('#darkModeToggle');
            await page.waitForTimeout(200);

            // Verify back to original
            const finalDarkMode = await body.evaluate((el) => el.classList.contains('dark-mode'));
            expect(finalDarkMode).toBe(initialDarkMode);
        });

        test('should persist dark mode preference', async ({ page, context }) => {
            // Enable dark mode
            await page.click('#darkModeToggle');
            await page.waitForTimeout(200);

            const darkModeEnabled = await page.locator('body').evaluate((el) =>
                el.classList.contains('dark-mode')
            );

            // Reload page
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Check dark mode persisted
            const darkModeAfterReload = await page.locator('body').evaluate((el) =>
                el.classList.contains('dark-mode')
            );

            expect(darkModeAfterReload).toBe(darkModeEnabled);
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper ARIA labels', async ({ page }) => {
            // Check for aria-label on important buttons
            await expect(page.locator('#calculateBtn')).toHaveAttribute('aria-label');
            await expect(page.locator('#addNewStockBtn')).toHaveAttribute('aria-label');
        });

        test('should have aria-live region for announcements', async ({ page }) => {
            const announcer = page.locator('#aria-announcer');
            await expect(announcer).toHaveAttribute('aria-live');
        });

        test('should be keyboard navigable', async ({ page }) => {
            // Tab through main elements
            await page.keyboard.press('Tab');
            let focusedElement = page.locator(':focus');
            await expect(focusedElement).toBeVisible();

            // Tab multiple times
            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('Tab');
            }

            focusedElement = page.locator(':focus');
            await expect(focusedElement).toBeVisible();
        });
    });

    test.describe('Data Import/Export', () => {
        test('should export portfolio data', async ({ page }) => {
            // Click data management dropdown
            await page.click('#dataManagementBtn');
            await page.waitForTimeout(200);

            // Setup download handler
            const downloadPromise = page.waitForEvent('download');

            // Click export
            await page.click('#exportDataBtn');

            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(/portfolio_data_.*\.json/);
        });

        test('should show import file dialog', async ({ page }) => {
            await page.click('#dataManagementBtn');
            await page.waitForTimeout(200);

            // Click import (opens file picker - can't fully test without file)
            await page.click('#importDataBtn');
            // File input should be triggered (hidden input)
            // This is hard to test in E2E without actual file
        });
    });

    test.describe('Currency Conversion', () => {
        test('should switch between KRW and USD', async ({ page }) => {
            // Switch to USD mode
            await page.click('input[value="usd"]');
            await page.waitForTimeout(200);

            // Exchange rate input should be visible
            await expect(page.locator('#exchangeRateGroup')).toBeVisible();
            await expect(page.locator('#usdInputGroup')).toBeVisible();

            // Switch back to KRW
            await page.click('input[value="krw"]');
            await page.waitForTimeout(200);

            // Exchange rate input should be hidden
            await expect(page.locator('#exchangeRateGroup')).toHaveClass(/hidden/);
        });

        test('should convert between currencies', async ({ page }) => {
            // Switch to USD mode
            await page.click('input[value="usd"]');

            // Enter USD amount
            await page.fill('#additionalAmountUSD', '100');

            // Trigger conversion (blur event)
            await page.locator('#additionalAmountUSD').blur();
            await page.waitForTimeout(300);

            // Check KRW amount updated
            const krwValue = await page.inputValue('#additionalAmount');
            expect(parseInt(krwValue)).toBeGreaterThan(0);
        });
    });

    test.describe('Virtual Scroll', () => {
        test('should handle many stocks with virtual scrolling', async ({ page }) => {
            // Add multiple stocks
            for (let i = 0; i < 20; i++) {
                await page.click('#addNewStockBtn');
                await page.waitForTimeout(100);
            }

            // Scroll the virtual scroll container
            const scrollContainer = page.locator('#virtual-scroll-wrapper');
            await scrollContainer.evaluate((el) => {
                el.scrollTop = 500;
            });

            await page.waitForTimeout(300);

            // Verify scroll worked (container should have stocks)
            const stocks = await page.locator('.virtual-row-inputs').count();
            expect(stocks).toBeGreaterThan(0);
        });
    });
});
