import { emptyDirSync, readdirSync } from 'fs-extra'
import readSettings from './settings'
import { PageType } from './types'

/**
 * Creates a page defintion (object containing name and path) from a path.
 * @param {string } pictureFolder 
 * @returns  an object containing the name and the path. e.g. {name: California, sourcePath: pictures/01_California} 
 */
function createPageDefinition(pictureFolder: string, index: number): PageType {
    const folderData = path.parse(pictureFolder)
    var foldername = folderData.name

    var pageInfo = util.extractInfoFromFolderName(foldername, index)

    // page name without spaces to use in urls
    var documentName = foldername.replace(' ', '')
    return { name: pageInfo.foldername, documentName: documentName, sourcePath: pictureFolder, index: pageInfo.pageNumber, date: pageInfo.date }
}

function getPages(sourcePath: string): PageType {
    const pictureDirectories = readdirSync(sourcePath, { withFileTypes: true })
        .filter(filInfo => filInfo.isDirectory())
        .map((fileInfo, index) => createPageDefinition(fileInfo.name, index));
}
async function build(clean: boolean) {
    const { userSettings, tempData } = await readSettings()
    if (clean) {
        console.log('cleaning ' + userSettings.distPath)
        emptyDirSync(userSettings.distPath)
    }

    pictureDirectories.forEach(pd => console.log(pd))


    return
    // return readSettings().then(result => {
    //     var { userSettings, tempData } = result
    //     if (clean) {

    //     }

    //     const pageGen = require('./pages')(settings.template, settings.distPath, settings.imageOptions, tempData)

    //     return globP('pages/!(*.txt)')
    //         .then((pictureFolders) => {
    //             const pages = pictureFolders.map(createPageDefinition)
    //             var promises = pages.map((page) => pageGen.generatePicturePage(page))
    //             return Promise.all(promises).then(() => {
    //                 // sort in reverse order to have the newest post first
    //                 var sortedPages = pages.sort((a, b) => {
    //                     return b.index - a.index
    //                 })
    //                 return pageGen.generateIndex(sortedPages, settings.title)
    //             })
    //         })
    // }).catch((error) => {
    //     console.error(error)
    // })
}

export default build