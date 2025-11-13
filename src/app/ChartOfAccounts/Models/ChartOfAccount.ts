export interface ChartOfAccount {
    id: number,
    accountCode: string,
    accountName: string,
    accountType: string,
    parentAccountId?: number,
    isDetail: boolean
}


export interface AccountList{
     id: number,
    accountName: string
}

export interface AccountWithChartDto {
  accountCode: string;
  accountName: string;
  accountType: string;
  parentAccountId?: number;
  isDetail: boolean;

  // New fields (Account entity)
  currency: string;
  openingBalance: number;
}