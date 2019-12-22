import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementFineDetailComponent } from './agreement-fine-detail.component';

describe('AgreementFineDetailComponent', () => {
  let component: AgreementFineDetailComponent;
  let fixture: ComponentFixture<AgreementFineDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgreementFineDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgreementFineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
