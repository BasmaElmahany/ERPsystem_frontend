import { Project } from "../../Project/Models/project";

export interface NavItem {
  icon: string;
  key: string; // Use key for translation
  route: string;
}

export interface DashboardCard {
  key: string; // Use key for translation
  value: string;
  icon: string;
  color: string;
  change: string;
}

export interface Activity {
  timeKey: string; // Use key for translation
  descriptionKey: string; // Use key for translation
}

export interface Employee {
  id: number;
  name: string;
  title: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  email: string;
}


export interface IncomeStatment {
  totalRevenue: number,
  totalExpense: number,
  netProfit: number
}


export interface trialbalance {
  accountId: number,
  accountCode: string,
  accountName: string,
  accountType: string,
  debit: number,
  credit: number,
  balance: number

}

export interface BalanceSheet {
  assets : number 
  liabilities: number 
  equity: number 
  isBalanced: boolean 
}



export interface CanvasConfig {
    readonly heightMultiplier: number;
    readonly circleCount: number;
    readonly squareCount: number;
    readonly timeIncrement: number;
}

/**
 * Animation state
 */
export interface AnimationState {
    time: number;
    animationId: number | null;
}

/**
 * Circle properties
 */
export interface CircleProperties {
    x: number;
    y: number;
    radius: number;
    fillOpacity: number;
    strokeOpacity: number;
}

/**
 * Square properties
 */
export interface SquareProperties {
    x: number;
    y: number;
    size: number;
    rotation: number;
    fillOpacity: number;
    strokeOpacity: number;
}

/**
 * Color configuration
 */
export interface ColorConfig {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
    readonly circleColor: ColorConfig;
    readonly squareColor: ColorConfig;
    readonly circleOpacityRange: {
        readonly min: number;
        readonly max: number;
    };
    readonly squareOpacityRange: {
        readonly min: number;
        readonly max: number;
    };
}

/**
 * Feature card interface
 */
export interface Feature {
    title: string;
    description: string;
    icon: string;
}

/**
 * Statistics card interface
 */
export interface Stat {
    label: string;
    value: string;
    color: string;
}



// Extend the Project interface to hold fetched report data
export interface ProjectSummary extends Project {
  // Financial Reports fetched from HomeService
  incomeStatement?: IncomeStatment;
  balanceSheet?: BalanceSheet[];
  trialBalance?: trialbalance[];
  
  // Status flags for the dashboard UI
  isBalanced?: boolean; // True if Trial Balance Debits == Credits
  loadingReports: boolean; // True while reports are being fetched
  errorReports: boolean; // True if there was an error fetching reports
}


export type ProjectReportResult = {
  project: ProjectSummary;
  reports: {
    incomeStatement: IncomeStatment;
    balanceSheet: BalanceSheet[];
    trialBalance: trialbalance[];
  } | null;
};