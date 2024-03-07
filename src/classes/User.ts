/**
 * Implementation of the server user class. 
 */
export class User {
    constructor(user: Partial<IUser>) {
        Object.assign(this, user);
    }

    public id: number = 0;
    public username: string = '';
    public email: string = '';
    public password: string = '';
}

export interface IUser extends User {}
