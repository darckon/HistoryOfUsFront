import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderDevolutionComponent } from './provider-devolution.component';

describe('ProviderDevolutionComponent', () => {
  let component: ProviderDevolutionComponent;
  let fixture: ComponentFixture<ProviderDevolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderDevolutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderDevolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
