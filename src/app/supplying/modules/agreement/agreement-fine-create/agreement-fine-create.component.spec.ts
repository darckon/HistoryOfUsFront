import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementFineCreateComponent } from './agreement-fine-create.component';

describe('AgreementFineCreateComponent', () => {
  let component: AgreementFineCreateComponent;
  let fixture: ComponentFixture<AgreementFineCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgreementFineCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgreementFineCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
