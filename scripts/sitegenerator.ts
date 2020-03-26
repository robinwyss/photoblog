import { CacheDataType, PageType, PictureInfoType, SettingsType, ImageOptionsType } from "./types"
import { hashElement } from 'folder-hash'
import { emptyDirSync, copy } from 'fs-extra'
import * as path from 'path'
import { getCache } from './cache'
import { forEachAsync } from './utils'

/**
 * Creates the given folder or deletes all its content if it already exists. 
 * 
 * @param path 
 */
function createEmptyFolder(path: string) {
    emptyDirSync(path)
}

async function copyImages(images: PictureInfoType[], destinationFolder: string, imageOptions: ImageOptionsType) {
    return await forEachAsync(images, async image => {
        return await copy(image.path, path.join(destinationFolder, image.filename))
    })
}

/**
* Generates a page
* 
* @param {object} page
*/
export async function copyAndResizeContent(pages: PageType[], settings: SettingsType) {
    const cache = await getCache()
    forEachAsync(pages, async page => {
        const destPath = path.join(settings.distPath, page.name)
        if (await cache.isOutdated(destPath)) {
            try {
                console.log(`generating ${page.name}`)
                createEmptyFolder(destPath);
                await copyImages(page.images, destPath, settings.imageOptions)
                await cache.updateCache(destPath)
            } catch (e) {
                console.log(e)
            }
        } else {
            console.log(`page ${page.name} hasn't changed, it won't be generated.`)
        }
        return { name: page.name, title: page.title, date: page.date }
    })
    cache.saveCache()
}

/**
	 * Generates a page
	 * 
	 * @param {object} page
	 */
export async function generatePicturePages(pages: PageType[], settings: SettingsType) {
    copyAndResizeContent(pages, settings)
}