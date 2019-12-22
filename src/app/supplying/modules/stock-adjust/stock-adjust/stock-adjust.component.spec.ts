import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAdjustListComponent } from './stock-adjust.component';

describe('StockAdjustListComponent', () => {
  let component: StockAdjustListComponent;
  let fixture: ComponentFixture<StockAdjustListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockAdjustListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockAdjustListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
