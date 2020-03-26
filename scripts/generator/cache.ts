import { writeFileSync, existsSync } from 'fs-extra'
import { readFileOrDefault } from '../utils/fileutils'
import { CacheDataType } from '../types';
import { hashElement } from 'folder-hash'
import * as path from 'path'


const cacheDataFile = '.temp.json';

class Cache {
    cacheData: CacheDataType;

    constructor(cacheData: CacheDataType) {
        this.cacheData = cacheData
    }

    isOutdated = async function (folderPath: string): Promise<boolean> {
        const name = path.basename(folderPath)
        if (existsSync(folderPath)) {
            const hash = await hashElement(folderPath)
            const previousHash = this.cacheData[name]
            if (hash && previousHash) {
                return hash.hash !== previousHash.hash
            }
        }
        return true
    }

    updateCache = async function (folderPath: string) {
        const name = path.basename(folderPath)
        const hash = await hashElement(folderPath)
        this.cacheData[name] = hash

    }

    saveCache = function name() {
        var data = JSON.stringify(this.cacheData)
        writeFileSync(cacheDataFile, data, { encoding: 'utf8', flag: 'w' })
    }

}

/**
 * Reads the cache file or initiliazes an empty cache if it doesn't exist
 */
export async function getCache(): Promise<Cache> {
    const cacheData = await readFileOrDefault<CacheDataType>(cacheDataFile, {});
    return new Cache(cacheData)
}