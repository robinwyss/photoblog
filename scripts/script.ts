import { emptyDirSync, readdirSync } from 'fs-extra'
import readSettings from './settings'
import getPages from './pageparser'

async function build(clean: boolean) {
    const { userSettings, tempData } = await readSettings()
    if (clean) {
        console.log('cleaning ' + userSettings.distPath)
        emptyDirSync(userSettings.distPath)
    }
    var pages = await getPages(userSettings.sourcePath);
    pages.forEach(page => console.log(page))
    return
}

export default build