
export async function forEachAsync<T, E>(collection: T[], action: (element: T) => Promise<E>) {
    return await Promise.all(collection.map(async element => {
        return await action(element)
    }))
}