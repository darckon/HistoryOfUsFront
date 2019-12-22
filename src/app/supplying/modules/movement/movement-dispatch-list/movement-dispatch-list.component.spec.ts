import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementDispatchListComponent } from './movement-dispatch-list.component';

describe('MovementDispatchListComponent', () => {
  let component: MovementDispatchListComponent;
  let fixture: ComponentFixture<MovementDispatchListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementDispatchListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementDispatchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
