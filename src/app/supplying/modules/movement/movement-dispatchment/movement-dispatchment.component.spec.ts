import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementDispatchmentComponent } from './movement-dispatchment.component';

describe('MovementDispatchmentComponent', () => {
  let component: MovementDispatchmentComponent;
  let fixture: ComponentFixture<MovementDispatchmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementDispatchmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementDispatchmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
