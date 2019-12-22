import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementFineComponent } from './agreement-fine.component';

describe('AgreementFineComponent', () => {
  let component: AgreementFineComponent;
  let fixture: ComponentFixture<AgreementFineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgreementFineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgreementFineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
