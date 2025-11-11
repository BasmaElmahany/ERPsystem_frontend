import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteJournalComponent } from './delete-journal.component';

describe('DeleteJournalComponent', () => {
  let component: DeleteJournalComponent;
  let fixture: ComponentFixture<DeleteJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteJournalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
