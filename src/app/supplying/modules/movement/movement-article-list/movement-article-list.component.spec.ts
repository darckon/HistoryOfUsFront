import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementArticleListComponent } from './movement-article-list.component';

describe('MovementArticleListComponent', () => {
  let component: MovementArticleListComponent;
  let fixture: ComponentFixture<MovementArticleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementArticleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementArticleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
