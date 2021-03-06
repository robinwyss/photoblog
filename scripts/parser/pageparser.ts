import { readdirSync } from 'fs-extra'
import * as glob from 'glob'
import * as path from 'path'
import { PageInfoType, PictureInfoType } from '../types'
import { extractInfoFromFolderName } from './nameparser'


/**
 * Get all pictures within the folder
 * 
 * @param pictureFolder 
 */
function getImagesInFolder(pictureFolder: string): Promise<PictureInfoType[]> {
    return new Promise((res, rej) =>
        glob(`${pictureFolder}/*.jpg`, (error, matches) => {
            if (error) {
                rej(error)
            }
            var pictures = matches.map(imagePath => {
                const extension = path.extname(imagePath)
                return { filename: path.basename(imagePath), name: path.basename(imagePath, extension), path: imagePath, type: extension }
            })
            res(pictures)
        })
    )
}

/**
 * Extract information from the folder name
 * 
 * @param string pictureFolder 
 * @returns  an object containing the name and the path. e.g. {name: California, sourcePath: pictures/01_California} 
 */
async function createPageDefinition(sourcePath: string, pictureFolderName: string, index: number): Promise<PageInfoType> {
    var folderPath = path.join(sourcePath, pictureFolderName)
    var pageInfo = extractInfoFromFolderName(pictureFolderName, index)
    var images = await getImagesInFolder(folderPath)
    // page name without spaces to use in urls
    var documentName = pictureFolderName.replace(' ', '')
    return { name: pictureFolderName, title: pageInfo.name, sourcePath: folderPath, index: pageInfo.pageNumber, images, date: pageInfo.date }
}

/**
 * Reads all folders in the source folder and extracts information from the folder name
 * 
 * @param sourcePath 
 */
async function getPages(sourcePath: string): Promise<PageInfoType[]> {
    var pagePromises = readdirSync(sourcePath, { withFileTypes: true })
        .filter(filInfo => filInfo.isDirectory())
        .map(async (fileInfo, index) => {
            return createPageDefinition(sourcePath, fileInfo.name, index)
        });
    return Promise.all(pagePromises);
}

export default getPages