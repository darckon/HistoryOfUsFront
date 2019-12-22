import { TestBed } from '@angular/core/testing';

import { ModulemanagerService } from './modulemanager.service';

describe('ModulemanagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModulemanagerService = TestBed.get(ModulemanagerService);
    expect(service).toBeTruthy();
  });
});
