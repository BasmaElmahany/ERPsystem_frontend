import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostLedgerComponent } from './post-ledger.component';

describe('PostLedgerComponent', () => {
  let component: PostLedgerComponent;
  let fixture: ComponentFixture<PostLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostLedgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
