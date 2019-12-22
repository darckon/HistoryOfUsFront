import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyingComponent } from './supplying.component';

describe('SupplyingComponent', () => {
  let component: SupplyingComponent;
  let fixture: ComponentFixture<SupplyingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplyingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplyingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
