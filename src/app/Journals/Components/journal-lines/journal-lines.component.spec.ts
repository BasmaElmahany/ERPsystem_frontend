import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalLinesComponent } from './journal-lines.component';

describe('JournalLinesComponent', () => {
  let component: JournalLinesComponent;
  let fixture: ComponentFixture<JournalLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalLinesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JournalLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
