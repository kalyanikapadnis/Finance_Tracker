import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleCharts } from './simple-charts';

describe('SimpleCharts', () => {
  let component: SimpleCharts;
  let fixture: ComponentFixture<SimpleCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleCharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleCharts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
