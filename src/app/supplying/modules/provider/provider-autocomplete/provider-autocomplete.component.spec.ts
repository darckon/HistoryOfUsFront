import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderAutocompleteComponent } from './provider-autocomplete.component';

describe('ProviderAutocompleteComponent', () => {
  let component: ProviderAutocompleteComponent;
  let fixture: ComponentFixture<ProviderAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
