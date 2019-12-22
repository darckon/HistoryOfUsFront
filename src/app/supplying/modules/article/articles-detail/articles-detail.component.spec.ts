import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesDetailComponent } from './articles-detail.component';

describe('ArticlesDetailComponent', () => {
  let component: ArticlesDetailComponent;
  let fixture: ComponentFixture<ArticlesDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticlesDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticlesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
