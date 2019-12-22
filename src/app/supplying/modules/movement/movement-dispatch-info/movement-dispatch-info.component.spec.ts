import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementDispatchInfoComponent } from './movement-dispatch-info.component';

describe('MovementDispatchInfoComponent', () => {
  let component: MovementDispatchInfoComponent;
  let fixture: ComponentFixture<MovementDispatchInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementDispatchInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementDispatchInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
