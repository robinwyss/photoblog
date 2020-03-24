import { existsSync, readFile } from 'fs-extra'
import { settingsType, userSettingsType, tempDataType } from './types'

const defaultSettings: userSettingsType = {
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
 * Reads a JSON file and returns its content as an object, if the file doesn't exists, 
 * the default value is returned. Optionaly, a message can be defined that is shown if 
 * the file doesn't exist
 * 
 * @param name the name of the file to read
 * @param defaultValue to default value that should be returned if the file doesn't exist
 * @param message [optional] a message to show if the file is not found
 */
async function readFileOrDefault<T>(name: string, defaultValue: T, message: string = null): Promise<T> {
    if (existsSync(name)) {
        const fileJson = await readFile(name, 'utf8')
        return JSON.parse(fileJson)
    } else {
        if (message) {
            console.warn(message)
        }
        return defaultValue;
    }
}

/**
 * Reads the user settings and temp data. If there are no user settings, default settings are used. 
 */
async function getSettings(): Promise<settingsType> {
    const userSettings = await readFileOrDefault('settings.json', defaultSettings, 'no settings found, using default settings');
    const tempData = await readFileOrDefault<tempDataType>('.temp.json', {});
    return { userSettings, tempData }
}

export default getSettings