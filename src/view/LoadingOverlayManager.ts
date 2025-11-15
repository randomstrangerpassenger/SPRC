// src/view/LoadingOverlayManager.ts

/**
 * @class LoadingOverlayManager
 * @description Manages calculation loading overlay display
 */
export class LoadingOverlayManager {
    private readonly LOADER_CLASS = 'calculation-loader';

    /**
     * @description Show calculation loading indicator
     */
    show(): void {
        const existingLoader = document.querySelector(`.${this.LOADER_CLASS}`);
        if (existingLoader) return;

        const loader = document.createElement('div');
        loader.className = this.LOADER_CLASS;
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-live', 'polite');
        loader.innerHTML = `
            <div class="spinner"></div>
            <span class="sr-only">계산 중...</span>
        `;
        document.body.appendChild(loader);
    }

    /**
     * @description Hide calculation loading indicator
     */
    hide(): void {
        const loader = document.querySelector(`.${this.LOADER_CLASS}`);
        if (loader) loader.remove();
    }

    /**
     * @description Check if loading overlay is currently visible
     * @returns True if visible
     */
    isVisible(): boolean {
        return document.querySelector(`.${this.LOADER_CLASS}`) !== null;
    }
}
