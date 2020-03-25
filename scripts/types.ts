import { Moment } from 'moment'

export type imageOptionsType = {
    sizes: number[]
    showTitle: boolean
}

export type userSettingsType = {
    sourcePath: string
    distPath: string
    title: string
    template: string
    imageOptions: imageOptionsType
}

export type tempDataType = { [key: string]: string }

export type settingsType = {
    userSettings: userSettingsType
    tempData: tempDataType
}

export type PageType = {
    name: string,
    sourcePath: string,
    index: number,
    images: PictureInfoType[]
    date: Moment
}

export type PictureInfoType = {
    name: string
    path: string
    type: string
}

export type FolderInfoType = {
    name: string,
    pageNumber: number,
    date?: Moment
}
