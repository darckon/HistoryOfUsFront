import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderAutocompleteComponent } from './purchase-order-autocomplete.component';

describe('PurchaseOrderAutocompleteComponent', () => {
  let component: PurchaseOrderAutocompleteComponent;
  let fixture: ComponentFixture<PurchaseOrderAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
