import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualPurchaseOrderComponent } from './manual-purchase-order.component';

describe('ManualPurchaseOrderComponent', () => {
  let component: ManualPurchaseOrderComponent;
  let fixture: ComponentFixture<ManualPurchaseOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualPurchaseOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
