
export default  class UploadedFile {
    public name: string | null;
    public contentType: string | null;
    public data: Uint8Array | null;

    constructor(file: Partial<UploadedFile>) {
        this.name = file.name ?? null;
        this.contentType = file.contentType ?? null;
        this.data = file.data ?? null;
    }

    public GetFileType(): string | null {
        return this.name?.split(".")[1] ?? null;
    }
}
