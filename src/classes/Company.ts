import Quote from "@/classes/Quote";
import User from "@/classes/User";
import Order from "@/classes/Order";

export default class Company {
    id: number = 0;
    name: string = '';
    email: string = '';
    phone: string = '';
    address: string = '';
    city: string = '';
    state: string = '';
    zip: string = '';
    country: string = '';
    identifier: string | null = "";
    createdAt: Date | string = "";
    updatedAt: Date | null = null;

    quotes: Quote[] = [];
    orders: Order[] = [];
    users: User[] = [];

    constructor(customer: Partial<Company>) {
        customer.identifier = customer.identifier || ""; // We cannot let it have null because of formik.

        Object.assign(this, customer);
    }

}