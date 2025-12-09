export interface JournalLine {
  accountId: number;
  debit: number;
  credit: number;
  description?: string;
  // New mapped field
  accountName?: string;
}

export interface JournalEntry {
  id: number;
  entryNumber: string;
  date: string;
  description: string;
  posted: boolean;
  createdAt?: string;
  photoUrl?: string;
}

export interface CreateJournalDto {
  entryNumber: string;
  date: string;
  description: string;
  PhotoUrl?: string;
  LinesJson: string;
}

export interface JournalWithLines {
  entry: JournalEntry;
  lines: JournalLine[];
}