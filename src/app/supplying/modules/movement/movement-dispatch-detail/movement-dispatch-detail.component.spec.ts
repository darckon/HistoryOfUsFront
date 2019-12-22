import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementDispatchDetailComponent } from './movement-dispatch-detail.component';

describe('MovementDispatchDetailComponent', () => {
  let component: MovementDispatchDetailComponent;
  let fixture: ComponentFixture<MovementDispatchDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementDispatchDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementDispatchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
