import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleAutocompleteComponent } from './article-autocomplete.component';

describe('ArticleAutocompleteComponent', () => {
  let component: ArticleAutocompleteComponent;
  let fixture: ComponentFixture<ArticleAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
