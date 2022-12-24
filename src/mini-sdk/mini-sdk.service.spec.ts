import { Test, TestingModule } from '@nestjs/testing';
import { MiniSdkService } from './mini-sdk.service';

describe('MiniSdkService', () => {
  let service: MiniSdkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiniSdkService],
    }).compile();

    service = module.get<MiniSdkService>(MiniSdkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
