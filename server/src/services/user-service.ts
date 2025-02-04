import { nanoid } from "nanoid";
import type { User, UserRequest } from "../models";

export class UserService {
  // Map<oauthProfileId -> User>
  private userMap = new Map<string, User>();

  constructor() {}

  init(data: User[]) {
    this.userMap = new Map(data.map((user) => [user.id, user]));
  }

  getUser(id: string) {
    return this.userMap.get(id);
  }

  createUser(userRequest: UserRequest) {
    const user: User = {
      ...userRequest,
      id: nanoid(10),
      _deleted: false,
    };
    this.userMap.set(user.id, user);
    return user;
  }

  dangerouslySetUsersCollection(usersCollection: Map<string, User>) {
    this.userMap = usersCollection;
  }

  getAllUsers() {
    return Array.from(this.userMap.values());
  }
}

export const userService = new UserService();
