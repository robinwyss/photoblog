const fse = require('fs-extra')
const ejs = require('ejs')
const path = require('path')
const images = require('./images')()

/**
 *
 * 
 * @param {string} srcPath
 * @param {string} distPath 
 * @param {[int]} imgSizes: array of sizes for which the pictures exists
 */
module.exports = function (srcPath, distPath, imgSizes) {

	/**
	 * Generates a page
	 * 
	 * @param {object} page
	 */
	function generatePicturePage(page) {
		const destPath = path.join(distPath, page.documentName)
		// create destination directory
		fse.mkdirs(destPath)
		console.info(`resize images ${page.name}`)
		return images.copyAndResizeImages(page.sourcePath, destPath, imgSizes)
			.then(pictures => {
				// sort pictures by name
				pictures = pictures.sort((a, b) => {
					const aName = a.name.toUpperCase()
					const bName = b.name.toUpperCase()
					if (aName < bName) return -1
					if (aName > bName) return 1
					return 0
				})
				console.info('generating HTML files')
				return fse.readFile('./src/pageTemplate.ejs', 'utf-8')
					.then(templateContent => {
						const content = ejs.render(templateContent, { pictures, page, imgSizes })
						const htmlFileName = `${distPath}/${page.documentName}.html`
						console.info(`generating HTML file: ${htmlFileName}`)
						fse.writeFile(htmlFileName, content)
					})
			}).catch((error) => {
				console.error(error)
			})

	}

	/**
	 * Generates the index page.
	 * 
	 * @param {object[]} pages 
	 */
	function generateIndex(pages) {
		return fse.readFile('./src/indexTemplate.ejs', 'utf-8')
			.then(templateContent => {
				const content = ejs.render(templateContent, { pages: pages })
				console.info('generating index file')
				return fse.writeFile(`${distPath}/index.html`, content)
					.then(fse.copyFile(`${srcPath}/styles.css`, `${distPath}/styles.css`))
					.then(fse.copyFile(`${srcPath}/app.js`, `${distPath}/app.js`))
			})
	}

	return {
		generatePicturePage,
		generateIndex
	}
}