export interface JournalLine {
  accountId: number;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: number;
  entryNumber: string;
  date: string;
  description: string;
  posted: boolean;
  createdAt?: string;
}

export interface CreateJournalDto {
  entryNumber: string;
  date: string;
  description: string;
  lines: JournalLine[];
}

export interface JournalWithLines {
  entry: JournalEntry;
  lines: JournalLine[];
}