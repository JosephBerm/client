export class SubmitOrderRequest{
    quoteId: number | null
    emails: string[]

    constructor(req: Partial<SubmitOrderRequest>) {
        this.emails = req.emails ?? []
        this.quoteId = req.quoteId ?? null
    }
}