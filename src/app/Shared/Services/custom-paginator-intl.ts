import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { I18nService } from './i18n.service';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  constructor(private i18n: I18nService) {
    super();
    this.translate();
    // Update labels when language changes
    this.i18n.currentLang$.subscribe(() => this.translate());
  }

  translate() {
    this.itemsPerPageLabel = this.i18n.instant('ITEMS_PER_PAGE');
    this.nextPageLabel = this.i18n.instant('PAGINATOR_NEXT_PAGE');
    this.previousPageLabel = this.i18n.instant('PAGINATOR_PREVIOUS_PAGE');
    this.firstPageLabel = this.i18n.instant('PAGINATOR_FIRST_PAGE');
    this.lastPageLabel = this.i18n.instant('PAGINATOR_LAST_PAGE');
    // Trigger change for any paginators
    this.changes.next();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.i18n.instant('PAGINATOR_RANGE', { start: 0, end: 0, length });
    }
    const startIndex = page * pageSize;
    // If start index exceeds list length, do not try and fix the end index to the end.
    const endIndex = Math.min(startIndex + pageSize, length);
    return this.i18n.instant('PAGINATOR_RANGE', { start: startIndex + 1, end: endIndex, length });
  };
}
