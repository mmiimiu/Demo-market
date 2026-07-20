/**
 * Types for RevenueInsights
 */

export interface RevenueInsightsProps {
  lang: 'th' | 'en' | 'cn';
}

export interface ChartPoint {
  monthTh: string;
  monthEn: string;
  value: number;
  label: string;
  growth: string;
  x: number;
  y: number;
}
