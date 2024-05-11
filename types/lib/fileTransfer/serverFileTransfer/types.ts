import { Aria2DownloadStatus } from "maria2"
export interface IAria2DownloadStatus extends Omit<Aria2DownloadStatus, 'files' | 'dir'>
{
    file : string | undefined
}

export interface ITorrentDownloadResult
{
    torrentPathExists : boolean,
    valid : boolean,
    guid : string | undefined,
    sizeLimitExceeded : boolean,
    error : boolean
}

export interface IDownloadResult extends Omit<ITorrentDownloadResult, "torrentPathExists">{}
export interface ICancelDownloadResult extends Omit<IDownloadResult, "sizeLimitExceeded">{}


export interface IAria2Helper{
    getUserDownloads(email : string) : Set<string> | undefined,
    addUserDownload(email : string, guid : string) : void,
    removeUserDownload(email : string, guid : string) : boolean,
    addStatusUpdateEventEmitter(email : string) : void,
    downloadWithTorrent(email : string, torrentFilePath : string, downloadPath : string) : Promise<ITorrentDownloadResult>,
    downloadWithURI(email : string, uri : string, downloadPath : string) : Promise<IDownloadResult>,
    pauseDownload(email : string, guid : string) : Promise<undefined | string>,
    resumeDownload(email : string, guid : string) : Promise<undefined | string>,
    cancelDownload(email : string, guid : string) : Promise<string | undefined>,
    getUserDownloadStatus(guidSet : Set<string>) : Promise<IAria2DownloadStatus[]>,
    getInactiveDownloads(email : string) : Promise<undefined | IAria2DownloadStatus[]>
}