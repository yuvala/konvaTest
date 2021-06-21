import { TestBed } from '@angular/core/testing';

import { ComplexService } from './complex.service';

describe('ComplexService', () => {
  let service: ComplexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComplexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
