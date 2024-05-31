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

    constructor(customer: Partial<Company>) {
        customer.identifier = customer.identifier || ""; // We cannot let it have null because of formik.

        Object.assign(this, customer);
    }

}