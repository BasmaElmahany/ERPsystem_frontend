import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpostLedgerComponent } from './unpost-ledger.component';

describe('UnpostLedgerComponent', () => {
  let component: UnpostLedgerComponent;
  let fixture: ComponentFixture<UnpostLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnpostLedgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnpostLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
