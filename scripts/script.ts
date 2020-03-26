import { emptyDirSync, readdirSync } from 'fs-extra'
import readSettings from './settings'
import getPages from './parser/pageparser'
import { generatePicturePages } from './generator/sitegenerator'

async function build(clean: boolean) {

    const settings = await readSettings()
    if (clean) {
        console.log('cleaning ' + settings.distPath)
        emptyDirSync(settings.distPath)
    }
    
    console.log('reading pages')
    var pages = await getPages(settings.sourcePath);

    console.log('generite site')
    generatePicturePages(pages, settings)
    return
}

export default build