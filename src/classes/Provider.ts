import { Product } from "./Product";

export default class Provider {
    id: number = 0;
    name: string = "";
    email: string = "";
    phone: string = "";
    address: string = "";
    city: string = "";
    state: string = "";
    zip: string = "";
    country: string = "";
    website: string = "";
    identifier: string = "";
    products: Product[];
    createdAt: Date  = new Date();
    updatedAt: Date | null;

    constructor(partial?: Partial<Provider>) {
        Object.assign(this, partial);
        this.createdAt = partial && partial.createdAt ? new Date(partial.createdAt) : new Date();
        this.updatedAt = partial && partial.updatedAt ? new Date(partial.updatedAt) : null;
        this.products = partial && partial.products ? partial.products : [];
    }
}
