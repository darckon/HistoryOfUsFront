import { TestBed } from '@angular/core/testing';

import { PreviousRouteServiceService } from './previous-route-service.service';

describe('PreviousRouteServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreviousRouteServiceService = TestBed.get(PreviousRouteServiceService);
    expect(service).toBeTruthy();
  });
});
