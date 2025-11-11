import { OrderStatus } from "@_classes/Enums";

export default class FinanceSearchFilter {
    public FromDate: Date | null = new Date(0);
    public ToDate: Date | null = new Date();
    public FromStatus: OrderStatus = OrderStatus.Placed;
    public ToStatus: OrderStatus = OrderStatus.Delivered;
    public customerId?: string;
}
