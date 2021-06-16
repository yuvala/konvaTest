import { TestBed } from '@angular/core/testing';

import { TestAService } from './test-a.service';

describe('TestAService', () => {
  let service: TestAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
