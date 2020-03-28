import { Moment } from 'moment'

/**
 * Holds options as to how the images should be processed and displayed
 */
export type ImageOptionsType = {
    sizes: number[]
    showTitle: boolean
}

/**
 * Settings for the page geneartion
 */
export type SettingsType = {
    sourcePath: string
    distPath: string
    title: string
    template: string
    imageOptions: ImageOptionsType
}

/**
 * Holds cache information, this allows to avoid regenerating pages if the content hasn't changed
 */
export type CacheDataType = { [key: string]: string }

/**
 * The definition of the source for a page
 */
export type PageInfoType = {
    name: string,
    title: string,
    sourcePath: string,
    index: number,
    images: PictureInfoType[]
    date: Moment
}

/**
 * Information about a picture
 */
export type PictureInfoType = {
    filename: string
    name: string
    path: string
    type: string
}

/**
 * Information extracted from a folder name
 */
export type FolderInfoType = {
    name: string,
    pageNumber: number,
    date?: Moment
}

export type PageContentType = {
    name: string,
    title: string,
    date: Moment
    images?: ImageDefinitionType[]
}

export type ImageDefinitionType = {
    name: string,
    sizes: ImageSize[]
}

export type ImageSize = {
    width: number
    filename: string
}