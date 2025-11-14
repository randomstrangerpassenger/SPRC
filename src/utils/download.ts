// src/utils/download.ts

/**
 * File download utilities
 * Provides a clean API for downloading files from the browser
 */

/**
 * Download a Blob as a file
 */
export function downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\s+/g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download JSON data as a file
 */
export function downloadJSON(data: unknown, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadFile(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

/**
 * Download CSV content as a file
 */
export function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Download text content as a file
 */
export function downloadText(content: string, filename: string, mimeType = 'text/plain'): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    downloadFile(blob, filename);
}
