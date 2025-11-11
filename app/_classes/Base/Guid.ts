class Guid {
    static newGuid() {
        return crypto.randomUUID();
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