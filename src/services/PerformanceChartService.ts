// src/services/PerformanceChartService.ts
import type { Chart, ChartConfiguration } from 'chart.js';
import type { PortfolioSnapshot, CalculatedStock } from '../types';
import { ChartLoaderService } from './ChartLoaderService';
import { logger } from './Logger';
import Decimal from 'decimal.js';

/**
 * @class PerformanceChartService
 * @description 포트폴리오 성과 차트 생성 서비스
 */
export class PerformanceChartService {
    /**
     * 시간별 수익률 라인 차트 생성
     */
    static async createPerformanceLineChart(
        canvas: HTMLCanvasElement,
        snapshots: PortfolioSnapshot[]
    ): Promise<Chart | null> {
        try {
            const ChartClass = await ChartLoaderService.getChart();

            // 날짜순 정렬
            const sortedSnapshots = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

            // 데이터 준비
            const labels = sortedSnapshots.map((s) => s.date);
            const totalValues = sortedSnapshots.map((s) => s.totalValue);
            const investedCapital = sortedSnapshots.map((s) => s.totalInvestedCapital);

            // 수익률 계산 (%)
            const returnRates = sortedSnapshots.map((s) => {
                if (s.totalInvestedCapital === 0) return 0;
                return ((s.totalValue - s.totalInvestedCapital) / s.totalInvestedCapital) * 100;
            });

            const config: ChartConfiguration = {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '총 평가액 (USD)',
                            data: totalValues,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            yAxisID: 'y',
                            tension: 0.1,
                        },
                        {
                            label: '투자 원금 (USD)',
                            data: investedCapital,
                            borderColor: 'rgb(153, 102, 255)',
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            yAxisID: 'y',
                            tension: 0.1,
                        },
                        {
                            label: '수익률 (%)',
                            data: returnRates,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            yAxisID: 'y1',
                            tension: 0.1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: '포트폴리오 성과 추이',
                        },
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    const value = context.parsed.y;
                                    if (context.datasetIndex === 2) {
                                        // 수익률
                                        label += value.toFixed(2) + '%';
                                    } else {
                                        // 금액
                                        label += '$' + value.toLocaleString();
                                    }
                                    return label;
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: '날짜',
                            },
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: '금액 (USD)',
                            },
                            ticks: {
                                callback: function (value) {
                                    return '$' + Number(value).toLocaleString();
                                },
                            },
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: '수익률 (%)',
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: {
                                callback: function (value) {
                                    return Number(value).toFixed(2) + '%';
                                },
                            },
                        },
                    },
                },
            };

            return new ChartClass(canvas, config);
        } catch (error) {
            logger.error('Failed to create performance line chart', 'PerformanceChartService', error);
            return null;
        }
    }

    /**
     * 섹터별 파이/도넛 차트 생성
     */
    static async createSectorPieChart(
        canvas: HTMLCanvasElement,
        portfolioData: CalculatedStock[],
        chartType: 'pie' | 'doughnut' = 'doughnut'
    ): Promise<Chart | null> {
        try {
            const ChartClass = await ChartLoaderService.getChart();

            // 섹터별 집계
            const sectorMap = new Map<string, Decimal>();

            portfolioData.forEach((stock) => {
                const sector = stock.sector || 'Unknown';
                const currentValue = stock.calculated?.currentAmount || new Decimal(0);

                const existing = sectorMap.get(sector) || new Decimal(0);
                sectorMap.set(sector, existing.plus(currentValue));
            });

            // 데이터 정렬 (큰 것부터)
            const sortedSectors = Array.from(sectorMap.entries())
                .sort((a, b) => b[1].minus(a[1]).toNumber())
                .filter(([_, value]) => value.greaterThan(0));

            const labels = sortedSectors.map(([sector]) => sector);
            const data = sortedSectors.map(([_, value]) => value.toNumber());

            // 색상 팔레트
            const backgroundColors = [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)',
                'rgba(199, 199, 199, 0.8)',
                'rgba(83, 102, 255, 0.8)',
                'rgba(255, 99, 255, 0.8)',
                'rgba(99, 255, 132, 0.8)',
            ];

            const borderColors = backgroundColors.map((color) =>
                color.replace('0.8', '1')
            );

            const config: ChartConfiguration = {
                type: chartType,
                data: {
                    labels,
                    datasets: [
                        {
                            label: '섹터별 비중',
                            data,
                            backgroundColor: backgroundColors,
                            borderColor: borderColors,
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: '섹터별 자산 배분',
                        },
                        legend: {
                            display: true,
                            position: 'right',
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = (context.dataset.data as number[]).reduce(
                                        (a, b) => a + b,
                                        0
                                    );
                                    const percentage = ((value / total) * 100).toFixed(2);
                                    return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                                },
                            },
                        },
                    },
                },
            };

            return new ChartClass(canvas, config);
        } catch (error) {
            logger.error('Failed to create sector pie chart', 'PerformanceChartService', error);
            return null;
        }
    }

    /**
     * 자산 배분 변화 라인 차트 생성 (스냅샷 기반)
     */
    static async createAllocationChangeChart(
        canvas: HTMLCanvasElement,
        snapshots: PortfolioSnapshot[],
        portfolioData: CalculatedStock[]
    ): Promise<Chart | null> {
        try {
            const ChartClass = await ChartLoaderService.getChart();

            // 날짜순 정렬
            const sortedSnapshots = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

            // 상위 5개 종목만 표시 (현재 보유량 기준)
            const topStocks = [...portfolioData]
                .sort((a, b) => {
                    const aValue = a.calculated?.currentAmount || new Decimal(0);
                    const bValue = b.calculated?.currentAmount || new Decimal(0);
                    return bValue.minus(aValue).toNumber();
                })
                .slice(0, 5);

            // 데이터셋 생성 (실제로는 스냅샷에 종목별 데이터가 필요하지만, 여기서는 현재 비율 사용)
            const labels = sortedSnapshots.map((s) => s.date);
            const datasets = topStocks.map((stock, index) => {
                const targetRatio = new Decimal(stock.targetRatio || 0).toNumber();
                // 실제로는 각 스냅샷별 실제 비율을 사용해야 하지만, 여기서는 목표 비율 사용
                const data = sortedSnapshots.map(() => targetRatio);

                const colors = [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 206, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)',
                ];

                return {
                    label: stock.name,
                    data,
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
                    tension: 0.1,
                };
            });

            const config: ChartConfiguration = {
                type: 'line',
                data: {
                    labels,
                    datasets,
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: '자산 배분 변화 (상위 5개 종목)',
                        },
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.parsed.y.toFixed(2) + '%';
                                    return label;
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: '날짜',
                            },
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '목표 비율 (%)',
                            },
                            ticks: {
                                callback: function (value) {
                                    return Number(value).toFixed(2) + '%';
                                },
                            },
                        },
                    },
                },
            };

            return new ChartClass(canvas, config);
        } catch (error) {
            logger.error(
                'Failed to create allocation change chart',
                'PerformanceChartService',
                error
            );
            return null;
        }
    }

    /**
     * 일일 수익률 막대 차트 생성
     */
    static async createDailyReturnBarChart(
        canvas: HTMLCanvasElement,
        snapshots: PortfolioSnapshot[]
    ): Promise<Chart | null> {
        try {
            const ChartClass = await ChartLoaderService.getChart();

            // 날짜순 정렬
            const sortedSnapshots = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

            if (sortedSnapshots.length < 2) {
                logger.warn('Not enough snapshots for daily return chart', 'PerformanceChartService');
                return null;
            }

            // 일일 수익률 계산
            const labels: string[] = [];
            const dailyReturns: number[] = [];

            for (let i = 1; i < sortedSnapshots.length; i++) {
                const prev = sortedSnapshots[i - 1];
                const curr = sortedSnapshots[i];

                if (prev.totalValue === 0) continue;

                const dailyReturn = ((curr.totalValue - prev.totalValue) / prev.totalValue) * 100;
                labels.push(curr.date);
                dailyReturns.push(dailyReturn);
            }

            // 양수/음수에 따라 색상 다르게
            const backgroundColors = dailyReturns.map((r) =>
                r >= 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)'
            );

            const config: ChartConfiguration = {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '일일 수익률 (%)',
                            data: dailyReturns,
                            backgroundColor: backgroundColors,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: '일일 수익률 변화',
                        },
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const value = context.parsed.y;
                                    return '수익률: ' + value.toFixed(2) + '%';
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: '날짜',
                            },
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '수익률 (%)',
                            },
                            ticks: {
                                callback: function (value) {
                                    return Number(value).toFixed(2) + '%';
                                },
                            },
                        },
                    },
                },
            };

            return new ChartClass(canvas, config);
        } catch (error) {
            logger.error('Failed to create daily return bar chart', 'PerformanceChartService', error);
            return null;
        }
    }
}
