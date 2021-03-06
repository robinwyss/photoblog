import * as moment from 'moment'
import { FolderInfoType } from "../types"


/**
 * formats the date, the day is optional.
 * e.g. 
 *      2018, 10 => October 2018
 *      2018, 10, 18 => October 18, 2018
 * 
 * @param {number} year 
 * @param {number} month 
 * @param {number} day optional 
 */
export function formatDate(year: string, month: string, day: string = null) {
    if (day) {
        return moment.utc(`${year} ${month} ${day}`, 'YYYY M D')
    } else {
        return moment.utc(`${year} ${month}`, 'YYYY M')
    }
}

// matches against a folder that starts with a number
// e.g. 01_Roadtrip
const folderNumberedRegex = /^(\d)+[_-]?(.+)$/
// matches against a folder that starts with a date, the day is optional
// e.g 20180218_Roadtrip or 201802_Roadtrip
const folderWithDateRegex = /^(\d{4})(\d{2})(\d{2})?[_-]?(.+)$/
// matches against a folder that starts with a date, separate by - or _ , the day is optional
// e.g 2018_02_18_Roadtrip or 2018_02_Roadtrip
const folderWithDateSeparatorRegex = /^(\d{4})[_-](\d{2})[_-](\d{2})?[_-]?(.+)$/
// matches against a folder that starts with a date (year, month) and has a sequence number
// e.g 201802_01_Roadtrip
const folderWithDateAndNumberRegex = /^(\d{4})(\d{2})(\d{2})?[_-](\d{2})[_-](.+)$/
// folders for static pages star with an _ then have an index and another _ before the name
// e.g. _1_About 
const folderStaticPage = /^_(\d)_(.+)/

function convertMatchToFolderInfo(match: RegExpExecArray, pageNumber: number): FolderInfoType {
    return {
        date: formatDate(match[1], match[2], match[3]),
        name: match[4],
        pageNumber
    }
}

/**
 * Tries to extract information from a folder name, including name and index.
 * The following formats are supported
 *  - 01_Roadtrip -> index: 1, name: Roadtrip
 *  - 201802_Roadtrip -> date: 2018.02, name: Roadtrip
 *  - 20180218_Roadtrip -> date: 2018.02.18, name: Roadtrip
 *  - 2018_02_Roadtrip -> date: 2018.02, name: Roadtrip
 *  - 2018_02_18_Roadtrip -> date: 2018.02.18, name: Roadtrip
 *  - 201802_01_Roadtrip -> date: 2018.02, name: Roadtrip
 *  - 20180218_01_Roadtrip -> date: 2018.02.18, name: Roadtrip
 * 
 * @param name name of the folder
 * @param index index
 */
export function extractInfoFromFolderName(name: string, index: number): FolderInfoType {
    // increment index to have it start at 1 instead of 0
    var pageNumber = index + 1
    var date

    // see if it is a folder with a static page
    var match = folderStaticPage.exec(name)
    if (match) {
        // substract 1000 the index in orer to have the static pages at the end
        pageNumber = parseInt(match[1]) - 1000
        name = match[2]
        return { date, pageNumber, name }
    }

    // try to get the date from the folder
    match = folderWithDateAndNumberRegex.exec(name)
    if (match) {
        date = formatDate(match[1], match[2], match[3])
        // use the number from the folder as page number
        pageNumber = parseInt(match[4])
        name = match[5]
        return { date, pageNumber, name }
    }

    // try to match numbered folders
    match = folderWithDateRegex.exec(name)
    if (match) {
        return convertMatchToFolderInfo(match, pageNumber)
    }

    // try to match numbered folders
    match = folderWithDateSeparatorRegex.exec(name)
    if (match) {
        return convertMatchToFolderInfo(match, pageNumber)
    }

    // try to match numbered folders
    match = folderNumberedRegex.exec(name)
    if (match) {
        name = match[2]
        // use the number from the folder as page number
        pageNumber = parseInt(match[1])
        return { date, pageNumber, name }
    }

    return { date, pageNumber, name }
}
