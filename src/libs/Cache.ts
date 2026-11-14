const cache = new Map<string, Promise<unknown>>();

export function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    let p = cache.get(key) as Promise<T> | undefined;
    if (!p) {
        p = load().catch((err) => {
            cache.delete(key);
            throw err;
        });
        cache.set(key, p);
    }
    return p;
}