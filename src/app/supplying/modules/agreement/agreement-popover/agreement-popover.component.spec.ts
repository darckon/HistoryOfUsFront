import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementPopoverComponent } from './agreement-popover.component';

describe('AgreementPopoverComponent', () => {
  let component: AgreementPopoverComponent;
  let fixture: ComponentFixture<AgreementPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgreementPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgreementPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
