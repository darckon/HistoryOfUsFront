import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyingDashboardComponent } from './supplying-dashboard.component';

describe('SupplyingDashboardComponent', () => {
  let component: SupplyingDashboardComponent;
  let fixture: ComponentFixture<SupplyingDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplyingDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplyingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
