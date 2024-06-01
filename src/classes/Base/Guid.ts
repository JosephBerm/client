class Guid {
    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static isEmpty(guid: string) {
        return guid === '00000000-0000-0000-0000-000000000000';
    }

    static isNotEmpty(guid: string) {
        return !Guid.isEmpty(guid);
    }

    static isNullOrEmpty(guid: string | null) {
        return guid === null || Guid.isEmpty(guid);
    }

    static isNotNullOrEmpty(guid: string | null) {
        return !Guid.isNullOrEmpty(guid);
    }
    
}

export default Guid;