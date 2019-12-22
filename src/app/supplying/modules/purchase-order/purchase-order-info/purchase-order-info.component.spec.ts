import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderInfoComponent } from './purchase-order-info.component';

describe('PurchaseOrderInfoComponent', () => {
  let component: PurchaseOrderInfoComponent;
  let fixture: ComponentFixture<PurchaseOrderInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
