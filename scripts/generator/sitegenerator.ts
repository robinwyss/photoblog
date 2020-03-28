import { PageInfoType, PictureInfoType, SettingsType, ImageOptionsType, ImageDefinitionType, PageContentType } from "../types"
import { emptyDirSync, copy } from 'fs-extra'
import * as path from 'path'
import { getCache } from './cache'
import { forEachAsync } from '../utils/utils'
import { generatePageContent, generateHtml } from './contentgenerator'
import * as sharp from 'sharp'

/**
 * Creates the given folder or deletes all its content if it already exists. 
 * 
 * @param path 
 */
function createEmptyFolder(path: string) {
    emptyDirSync(path)
}

async function resizeImages(images: PictureInfoType[], destinationFolder: string, imageOptions: ImageOptionsType): Promise<ImageDefinitionType[]> {
    return await forEachAsync(images, async image => {
        var sizeDefinitions = await forEachAsync(imageOptions.sizes, async size => {
            var filename = `${image.name}_${size}.jpeg`;
            await sharp(image.path)
                .resize(size)
                .jpeg({
                    quality: 80,
                })
                .toFile(path.join(destinationFolder, filename))
            return { width: size, filename }
        })
        return { name: image.filename, sizes: sizeDefinitions }
    })

}

async function copyImages(images: PictureInfoType[], destinationFolder: string, imageOptions: ImageOptionsType): Promise<ImageDefinitionType[]> {
    return await forEachAsync(images, async image => {
        await copy(image.path, path.join(destinationFolder, image.filename))
        return { name: image.filename, sizes: [{ width: 1000, height: 1000, filename: image.filename }] }
    })
}


async function generatePage(destPath: string, page: PageInfoType, settings: SettingsType, pageContentDefinition: PageContentType) {
    createEmptyFolder(destPath)
    const images = await resizeImages(page.images, destPath, settings.imageOptions)
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