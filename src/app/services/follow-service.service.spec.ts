import { TestBed } from '@angular/core/testing';

import { FollowServiceService } from './follow-service.service';

describe('FollowServiceService', () => {
  let service: FollowServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FollowServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
