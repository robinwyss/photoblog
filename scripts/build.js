
const fse = require('fs-extra')
const path = require('path')

const { promisify } = require('util')
const globP = promisify(require('glob'))


const util = require('./util')()


/**
 * Creates a page defintion (object containing name and path) from a path.
 * @param {string } pictureFolder 
 * @returns  an object containing the name and the path. e.g. {name: California, sourcePath: pictures/01_California} 
 */
function createPageDefinition(pictureFolder, index) {
	const folderData = path.parse(pictureFolder)
	var foldername = folderData.name

	var pageInfo = util.extractInfoFromFolderName(foldername, index)

	// page name without spaces to use in urls
	var documentName = foldername.replace(' ', '')
	return { name: pageInfo.foldername, documentName: documentName, sourcePath: pictureFolder, index: pageInfo.pageNumber, date: pageInfo.date }
}


// clear destination folder
//fse.emptyDirSync(distPath)

//var tempSettings = JSON.parse(fse.readFileSync('/path/to/file.json', 'utf8'));
function readSettingsAndTempData() {
	var settingsP = fse.readFile('settings.json', 'utf8').then(file => {
		return JSON.parse(file)
	}).catch(() => {
		console.warn('no settings found, using default settings')
		return {
			srcPath: './src', distPath: './public', title: 'KIRO', imageOptions: {
				sizes: [720, 1080],
				showTitle: false
			}
		}
	})
	var tempP = fse.readFile('.temp.json', 'utf8').then(file => {
		return JSON.parse(file)
	}).catch(() => {
		return {}
	})
	return Promise.all([settingsP, tempP]).then(values => {
		return { settings: values[0], tempData: values[1] }
	})
}

readSettingsAndTempData().then(result => {
	var { settings, tempData } = result

	const pageGen = require('./pages')(settings.srcPath, settings.distPath, settings.imageOptions, tempData)

	return globP('pages/!(*.txt)')
		.then((pictureFolders) => {
			const pages = pictureFolders.map(createPageDefinition)
			var promises = pages.map((page) => pageGen.generatePicturePage(page))
			return Promise.all(promises).then(() => {
				// sort in reverse order to have the newest post first
				var sortedPages = pages.sort((a, b) => {
					return b.index - a.index
				})
				return pageGen.generateIndex(sortedPages, settings.title)
			})
		})
}).catch((error) => {
	console.error(error)
})


