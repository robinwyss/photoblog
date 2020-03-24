

const moment = require('moment')

/**
 * formats the date, the day is optional.
 * e.g. 
 *      2018, 10 => October 2018
 *      2018, 10, 18 => October 18, 2018
 * 
 * @param {string} year 
 * @param {string} month 
 * @param [{string} day] 
 */
function formatDate(year, month, day) {
	if (day) {
		return moment(`${year}-${month}-${day}`).format('MMMM DD, YYYY')
	} else {
		return moment(`${year}-${month}`).format('MMMM YYYY')
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
const folderWithDateAndNumberRegex = /^(\d{4})(\d{2})[_-](\d{2})?[_-]?(.+)$/
// folders for static pages star with an _ then have an index and another _ before the name
// e.g. _1_About 
const folderStaticPage = /^_(\d)_(.+)/

module.exports = function extractInforFromFolderName(foldername, index) {
	// increment index to have it start at 1 instead of 0
	var pageNumber = index + 1
	var date

	// see if it is a folder with a static page
	var match = folderStaticPage.exec(foldername)
	if (match) {
		// substract 1000 the index in orer to have the static pages at the end
		pageNumber = parseInt(match[1]) - 1000
		foldername = match[2]
	} else {
		// try to get the date from the folder
		match = folderWithDateAndNumberRegex.exec(foldername)
		if (match) {
			date = formatDate(match[1], match[2])
			// use the number from the folder as page number
			pageNumber = parseInt(match[3])
			foldername = match[4]
		} else {
			// try to match numbered folders
			match = folderWithDateRegex.exec(foldername)
			if (match) {
				date = formatDate(match[1], match[2], match[3])
				foldername = match[4]
			} else {
				// try to match numbered folders
				match = folderWithDateSeparatorRegex.exec(foldername)
				if (match) {
					date = formatDate(match[1], match[2])
					foldername = match[4]
					// use the number from the folder as page number
					pageNumber = parseInt(match[3])
				} else {
					// try to match numbered folders
					match = folderNumberedRegex.exec(foldername)
					if (match) {
						foldername = match[2]
						// use the number from the folder as page number
						pageNumber = parseInt(match[1])
					}
				}
			}
		}
	}
	return { date, pageNumber, foldername }
}