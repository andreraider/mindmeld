export class User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;

  constructor(rawUser: Partial<User>) {
    Object.assign(this, rawUser);
  }
}
