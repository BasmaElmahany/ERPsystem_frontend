import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgerListComponent } from './ledger-list.component';

describe('LedgerListComponent', () => {
  let component: LedgerListComponent;
  let fixture: ComponentFixture<LedgerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LedgerListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LedgerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
