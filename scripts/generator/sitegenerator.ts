import { PageInfoType, PictureInfoType, SettingsType, ImageOptionsType, ImageDefinitionType } from "../types"
import { emptyDirSync, copy } from 'fs-extra'
import * as path from 'path'
import { getCache } from './cache'
import { forEachAsync } from '../utils/utils'
import { generatePageContent } from './contentgenerator'

/**
 * Creates the given folder or deletes all its content if it already exists. 
 * 
 * @param path 
 */
function createEmptyFolder(path: string) {
    emptyDirSync(path)
}

async function copyImages(images: PictureInfoType[], destinationFolder: string, imageOptions: ImageOptionsType): Promise<ImageDefinitionType[]> {
    return await forEachAsync(images, async image => {
        await copy(image.path, path.join(destinationFolder, image.filename))
        return { name: image.filename, sizes: [{ width: 1000, height: 1000, filename: image.filename }] }
    })
}

/**
* Generates a page
* 
* @param {object} page
*/
export async function copyAndResizeContent(pages: PageInfoType[], settings: SettingsType) {
    const cache = await getCache()
    forEachAsync(pages, async page => {
        const destPath = path.join(settings.distPath, page.name)
        if (await cache.isOutdated(destPath)) {
            console.log(`generating ${page.name}`)
            createEmptyFolder(destPath);
            var images = await copyImages(page.images, destPath, settings.imageOptions)
            var pageContentDefinition = { name: page.name, title: page.title, date: page.date, images }
            await generatePageContent(pageContentDefinition, destPath)
            await cache.updateCache(destPath)
        } else {
            console.log(`page ${page.name} hasn't changed, it won't be generated.`)
        }
        return
    })
    cache.saveCache()
}

/**
	 * Generates a page
	 * 
	 * @param {object} page
	 */
export async function generatePicturePages(pages: PageInfoType[], settings: SettingsType) {
    copyAndResizeContent(pages, settings)
}