import { Test, TestingModule } from '@nestjs/testing';
import { MpController } from './mp.controller';

describe('MpController', () => {
  let controller: MpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MpController],
    }).compile();

    controller = module.get<MpController>(MpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
