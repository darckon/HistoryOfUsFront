import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicitationAutocompleteComponent } from './licitation-autocomplete.component';

describe('LicitationAutocompleteComponent', () => {
  let component: LicitationAutocompleteComponent;
  let fixture: ComponentFixture<LicitationAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicitationAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicitationAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
