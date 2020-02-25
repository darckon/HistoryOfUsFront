import { TestBed } from '@angular/core/testing';

import { MovimientosService } from './movimientos.service';

describe('MovimientosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MovimientosService = TestBed.get(MovimientosService);
    expect(service).toBeTruthy();
  });
});
