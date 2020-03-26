import { PageContentType } from "../types";
import { writeFileSync } from "fs-extra";
import * as path from 'path'

export function generatePageContent(pageContent: PageContentType, folderPath: string) {
    const data = JSON.stringify(pageContent);
    var filePath = path.join(folderPath, 'pageData.json')
    writeFileSync(filePath, data, { encoding: 'utf8', flag: 'w' })
}