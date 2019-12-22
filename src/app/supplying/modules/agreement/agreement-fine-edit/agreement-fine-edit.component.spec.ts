import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementFineEditComponent } from './agreement-fine-edit.component';

describe('AgreementFineEditComponent', () => {
  let component: AgreementFineEditComponent;
  let fixture: ComponentFixture<AgreementFineEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgreementFineEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgreementFineEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
