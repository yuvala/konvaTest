import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestBComponent } from './test-b.component';

describe('TestBComponent', () => {
  let component: TestBComponent;
  let fixture: ComponentFixture<TestBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestBComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
