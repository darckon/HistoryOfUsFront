import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementRecordComponent } from './movement-record.component';

describe('MovementRecordComponent', () => {
  let component: MovementRecordComponent;
  let fixture: ComponentFixture<MovementRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
