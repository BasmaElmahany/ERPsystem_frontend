import { ApexChart, ApexDataLabels, ApexLegend, ApexMarkers, ApexNonAxisChartSeries, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis } from "ng-apexcharts";

export interface generaledger {
    accountName: string;
    accountType: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    date: Date
} 

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  legend : ApexLegend,
  tooltip : ApexTooltip
};

export type BarChartOptions = {
  series: { name: string; data: number[] }[];
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  stroke : ApexStroke;
  markers :ApexMarkers;
   legend : ApexLegend,
  tooltip : ApexTooltip

};