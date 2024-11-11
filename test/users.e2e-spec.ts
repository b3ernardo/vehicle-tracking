import { UsersService } from './../src/users/users.service';

import { Test, TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by username', async () => {
    const username = '671603';
    const user = await service.findOne(username);

    expect(user).toBeDefined();
    expect(user.username).toBe(username);
    expect(user.password).toBe('password');
  });

  it('should return undefined when user is not found', async () => {
    const username = 'nonexistent';
    const user = await service.findOne(username);

    expect(user).toBeUndefined();
  });
});
