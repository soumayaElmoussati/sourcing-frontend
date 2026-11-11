import { TestBed } from '@angular/core/testing';

import { ReportSellerService } from './report-seller.service';

describe('ReportSellerService', () => {
  let service: ReportSellerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportSellerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
