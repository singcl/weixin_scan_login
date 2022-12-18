import { Test, TestingModule } from '@nestjs/testing';
import { MpService } from './mp.service';

describe('MpService', () => {
  let service: MpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MpService],
    }).compile();

    service = module.get<MpService>(MpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
