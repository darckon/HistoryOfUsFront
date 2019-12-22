import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassiveCodificationComponent } from './massive-codification.component';

describe('MassiveCodificationComponent', () => {
  let component: MassiveCodificationComponent;
  let fixture: ComponentFixture<MassiveCodificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MassiveCodificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MassiveCodificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
