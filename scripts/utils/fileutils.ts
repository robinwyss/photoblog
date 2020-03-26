import { existsSync, readFile, copy, writeFileSync } from 'fs-extra'
import { promisify } from 'util'

export const copyAsync = promisify(copy)
// export const existsAsync = promisify(exists)

/**
 * Reads a JSON file and returns its content as an object, if the file doesn't exists, 
 * the default value is returned. Optionaly, a message can be defined that is shown if 
 * the file doesn't exist
 * 
 * @param name the name of the file to read
 * @param defaultValue to default value that should be returned if the file doesn't exist
 * @param message [optional] a message to show if the file is not found
 */
export async function readFileOrDefault<T>(name: string, defaultValue: T, message: string = null): Promise<T> {
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
