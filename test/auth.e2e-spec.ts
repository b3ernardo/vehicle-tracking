import { AuthService } from './../src/auth/auth.service';
import { UsersService } from './../src/users/users.service';

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should return an access token when credentials are correct', async () => {
    const user = { userId: 1, username: '671603', password: 'password' };
    mockUsersService.findOne.mockResolvedValue(user);

    const mockToken = 'mocked.jwt.token';
    mockJwtService.signAsync.mockResolvedValue(mockToken);

    const result = await authService.signIn('671603', 'password');

    expect(result).toEqual({ access_token: mockToken });
    expect(mockUsersService.findOne).toHaveBeenCalledWith('671603');
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: user.userId,
      username: user.username,
    });
  });

  it('should throw an UnauthorizedException if password is incorrect', async () => {
    const user = { userId: 1, username: '671603', password: 'password' };
    mockUsersService.findOne.mockResolvedValue(user);

    await expect(authService.signIn('671603', 'wrongpassword')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockUsersService.findOne).toHaveBeenCalledWith('671603');
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should throw an UnauthorizedException if user does not exist', async () => {
    mockUsersService.findOne.mockResolvedValue(null);

    await expect(
      authService.signIn('nonexistentuser', 'password'),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockUsersService.findOne).toHaveBeenCalledWith('nonexistentuser');
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });
});
