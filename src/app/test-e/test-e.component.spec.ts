import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestEComponent } from './test-e.component';

describe('TestEComponent', () => {
  let component: TestEComponent;
  let fixture: ComponentFixture<TestEComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestEComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
