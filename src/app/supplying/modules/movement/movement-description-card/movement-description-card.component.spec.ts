import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementDescriptionCardComponent } from './movement-description-card.component';

describe('MovementDescriptionCardComponent', () => {
  let component: MovementDescriptionCardComponent;
  let fixture: ComponentFixture<MovementDescriptionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementDescriptionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementDescriptionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
