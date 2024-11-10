/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: '671603',
      password: 'password',
    },
    {
      userId: 2,
      username: '273445',
      password: 'password',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
