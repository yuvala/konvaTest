import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCComponent } from './test-c.component';

describe('TestCComponent', () => {
  let component: TestCComponent;
  let fixture: ComponentFixture<TestCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestCComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
