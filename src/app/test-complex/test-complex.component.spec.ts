import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComplexComponent } from './test-complex.component';

describe('TestComplexComponent', () => {
  let component: TestComplexComponent;
  let fixture: ComponentFixture<TestComplexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestComplexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComplexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
