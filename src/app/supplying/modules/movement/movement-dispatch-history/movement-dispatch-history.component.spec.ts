import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementDispatchHistoryComponent } from './movement-dispatch-history.component';

describe('MovementDispatchHistoryComponent', () => {
  let component: MovementDispatchHistoryComponent;
  let fixture: ComponentFixture<MovementDispatchHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementDispatchHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementDispatchHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
