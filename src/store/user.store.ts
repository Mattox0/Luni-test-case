import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { readFileSync } from 'fs';
import { join } from 'path';

interface UsersData {
  users: User[];
}

@Injectable()
export class UserStore implements OnModuleInit {
  private usersMap = new Map<string, User>();

  onModuleInit(): void {
    const raw = readFileSync(
      join(process.cwd(), 'data', 'users.json'),
      'utf-8',
    );
    const data = JSON.parse(raw) as UsersData;

    for (const user of data.users) {
      this.usersMap.set(user.id, user);
    }
  }
}