import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizedService } from './authorized.service';

describe('AuthorizedService', () => {
  let service: AuthorizedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizedService],
    }).compile();

    service = module.get<AuthorizedService>(AuthorizedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
