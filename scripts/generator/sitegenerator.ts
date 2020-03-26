import { PageInfoType, PictureInfoType, SettingsType, ImageOptionsType, ImageDefinitionType, PageContentType } from "../types"
import { emptyDirSync, copy } from 'fs-extra'
import * as path from 'path'
import { getCache } from './cache'
import { forEachAsync } from '../utils/utils'
import { generatePageContent, generateHtml } from './contentgenerator'

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


async function generatePage(destPath: string, page: PageInfoType, settings: SettingsType, pageContentDefinition: PageContentType) {
    createEmptyFolder(destPath)
    const images = await copyImages(page.images, destPath, settings.imageOptions)
    pageContentDefinition.images = images
    await generatePageContent(pageContentDefinition, destPath)
}

/**
* Generates a page
* 
* @param {object} page
*/
export async function copyAndResizeContent(pages: PageInfoType[], settings: SettingsType) {
    const cache = await getCache()
    const pageContents = await forEachAsync(pages, async page => {
        const destPath = path.join(settings.distPath, page.name)
        const pageContentDefinition: PageContentType = { name: page.name, title: page.title, date: page.date }
        if (await cache.isOutdated(destPath)) {
            console.log(`generating ${page.name}`)
            await generatePage(destPath, page, settings, pageContentDefinition)
            await cache.updateCache(destPath)
        } else {
            console.log(`page ${page.name} hasn't changed, it won't be generated.`)
        }
        return pageContentDefinition
    })
    cache.saveCache()
    console.log('generating HTML')
    generateHtml(settings.title, pageContents, settings.distPath, settings.template)
}


/**
	 * Generates a page
	 * 
	 * @param {object} page
	 */
export async function generatePicturePages(pages: PageInfoType[], settings: SettingsType) {
    copyAndResizeContent(pages, settings)
}