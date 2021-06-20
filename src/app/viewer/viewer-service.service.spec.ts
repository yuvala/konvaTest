import { TestBed } from '@angular/core/testing';

import { ViewerServiceService } from './viewer-service.service';

describe('ViewerServiceService', () => {
  let service: ViewerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
