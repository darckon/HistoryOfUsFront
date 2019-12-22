import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementHeaderComponent } from './movement-header.component';

describe('MovementHeaderComponent', () => {
  let component: MovementHeaderComponent;
  let fixture: ComponentFixture<MovementHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
