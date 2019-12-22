import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderPopupComponent } from './purchase-order-popup.component';

describe('PurchaseOrderPopupComponent', () => {
  let component: PurchaseOrderPopupComponent;
  let fixture: ComponentFixture<PurchaseOrderPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
