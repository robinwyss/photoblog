import * as path from 'path'
import * as ejs from 'ejs'

import { PageContentType } from "../types";
import { writeFile, readFile, copy } from "fs-extra";
import { forEachAsync } from "../utils/utils";

export async function generatePageContent(pageContent: PageContentType, folderPath: string) {
    const data = JSON.stringify(pageContent);
    var filePath = path.join(folderPath, 'pageData.json')
    await writeFile(filePath, data, { encoding: 'utf8', flag: 'w' })
}

async function copyStaticFiles(templatePath: string, folderPath: string) {
    return await forEachAsync(['styles.css', 'app.js', 'favicon.ico'], async file => {
        return copy(path.join(templatePath, file), path.join(folderPath, file))
    })

}

function sortPages(pages: PageContentType[]) {
    return pages.sort((a, b) => {
        if (a.name.startsWith("_") && !b.name.startsWith("_")) {
            return 1;
        } else if (!a.name.startsWith("_") && b.name.startsWith("_")) {
            return -1;
        }
        return a.name > b.name ? -1 : 1;
    })
}

export async function generateHtml(title: string, pages: PageContentType[], folderPath: string, templatePath: string) {
    const templateContent = await readFile(templatePath + '/indexTemplate.ejs', 'utf-8')
    const sortedPages = sortPages(pages)
    const content = ejs.render(templateContent, { pages: sortedPages, title })
    var filePath = path.join(folderPath, 'index.html')
    await copyStaticFiles(templatePath, folderPath)
    await writeFile(filePath, content, { encoding: 'utf8', flag: 'w' })
}