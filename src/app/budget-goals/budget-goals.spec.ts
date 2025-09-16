import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetGoals } from './budget-goals';

describe('BudgetGoals', () => {
  let component: BudgetGoals;
  let fixture: ComponentFixture<BudgetGoals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetGoals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetGoals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
