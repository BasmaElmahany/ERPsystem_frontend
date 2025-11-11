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

