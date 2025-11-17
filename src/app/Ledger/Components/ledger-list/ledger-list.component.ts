import { Component, OnInit, ViewChild } from '@angular/core';
import { LedgerService } from '../../Services/ledger.service';
import { generaledger } from '../../Models/ledger';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-ledger-list',

  templateUrl: './ledger-list.component.html',
  styleUrl: './ledger-list.component.scss'
})
export class LedgerListComponent implements OnInit {
  projectName = '';
  ledger: generaledger[] = [];
  filteredledger: generaledger[] = []; // ✅ filtered results
  paginatedledger: generaledger[] = []; // ✅ فقط الصفحة الحالية
  searchTerm = ''; // ✅ search box model
  loading = false;
  sortKey: keyof generaledger | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  startDate: string = '';
  endDate: string = '';
  // 🟢 إعدادات المقسم
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20, 50];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private service: LedgerService, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.loadLedger();
  }
  loadLedger(): void {
    this.loading = true;
    this.service.getAll(this.projectName).subscribe({
      next: (res) => {
        this.ledger = res;
        this.filteredledger = [...res];
        this.updatePagination();
        console.log(res);
      },
      error: (err) => console.error(err),
      complete: () => (this.loading = false)
    });
  }

  // ✅ البحث + الفلترة
  applySearch(): void {
    const term = this.searchTerm.toLowerCase();
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    this.filteredledger = this.ledger.filter(j => {
      const entryDate = new Date(j.date);
      const matchesText =
        j.accountName?.toLowerCase().includes(term) ||
        j.accountType?.toLowerCase().includes(term) ||
        j.description?.toLowerCase().includes(term) ||  j.date?.toString().includes(term);
      const matchesDate =
        (!start || entryDate >= start) && (!end || entryDate <= end);
      return matchesText && matchesDate;
    });

    this.pageIndex = 0; // reset to first page
    this.updatePagination();
  }

  // ✅ تحديث الصفحة
  updatePagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedledger = this.filteredledger.slice(start, end);
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  // 🔁 فرز البيانات
  sortData(key: keyof generaledger): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.filteredledger.sort((a: any, b: any) => {
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }



}
