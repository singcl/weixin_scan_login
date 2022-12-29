import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizedController } from './authorized.controller';

describe('AuthorizedController', () => {
  let controller: AuthorizedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizedController],
    }).compile();

    controller = module.get<AuthorizedController>(AuthorizedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
