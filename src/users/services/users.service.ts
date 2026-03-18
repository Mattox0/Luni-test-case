import { Injectable } from '@nestjs/common';
import { UserStore } from '../../store/user.store';

@Injectable()
export class UsersService {
  constructor(private readonly userStore: UserStore) {}
}
