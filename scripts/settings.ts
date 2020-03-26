import { SettingsType, CacheDataType } from './types'
import { readFileOrDefault } from './utils/fileutils'

const defaultSettings: SettingsType = {
    sourcePath: "./pages",
    distPath: './public',
    title: 'PHOTO',
    template: './templates/default',
    imageOptions: {
        sizes: [720, 1080, 1600],
        showTitle: false
    }
}

/**
 * Reads the user settings and temp data. If there are no user settings, default settings are used. 
 */
async function getSettings(): Promise<SettingsType> {
    return await readFileOrDefault('settings.json', defaultSettings, 'no settings found, using default settings');
}

export default getSettings