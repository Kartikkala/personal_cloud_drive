export interface InactiveDowloadsDb{
    addInactiveDownload(email : string, downloadGid : string, upsert : boolean) : Promise<Boolean>,
    getInactiveDownloads(email : string) : Promise<Array<string> | undefined>,
}