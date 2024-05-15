// Types
import { InactiveDowloadsDb } from "../../../types/lib/db/Downloads/types.js"
import { NFileObjectManager } from "../../../types/lib/fileSystem/types.js"
import { IAria2Helper, IAria2DownloadStatus } from "../../../types/lib/fileTransfer/serverFileTransfer/types.js"
import { ITorrentDownloadResult, IDownloadResult } from "../../../types/lib/fileTransfer/serverFileTransfer/types.js"

import ufs from 'url-file-size'
import EventEmitter from "node:events"
import path from 'node:path'
import { ClientAria2, Conn, aria2, open } from 'maria2'
import { files } from "@ctrl/torrent-file"
import WebTorrent from "webtorrent"
import WebSocket from "ws"
import fs from 'fs/promises'

export async function aria2c(database: InactiveDowloadsDb, fileManager: NFileObjectManager.IFileObjectManager, aria2_configs: any) {
    const host = aria2_configs.host || 'localhost'
    const port = aria2_configs.port || 6800
    const path = 'jsonrpc'
    const downloadStatusUpdateDuration = aria2_configs.downloadStatusUpdateDurationInSeconds * 1000 || 3000

    console.log("Connecting to aria2 service...")
    const url = `ws://${host}:${port}/${path}`
    const ws = new WebSocket(url)
    ws.on('close', () => {
        console.error("\x1b[31m", "Connection to aria2 service was terminated.\n")
        console.log("\x1b[0m")
    })
    ws.on('error', (e) => {
        console.error("\x1b[31m", "Error connecting to aria2 service. Check if aria2 is running in json rpc mode.\n")
        console.log("\x1b[33m", `Hint : Use the following command to run aria2c in json rpc mode at url: ${url}:\n`)
        console.log("\x1b[34m", `aria2c --enable-rpc --rpc-listen-all=true --rpc-listen-port=${port} --interface=${host} --rpc-allow-origin-all --disable-ipv6`)
        console.log("\x1b[0m")
        process.exit(-1)
    })
    ws.on('open', () => {
        console.log("\x1b[32m", "Successfully connected to aria2 service")
        console.log("\x1b[0m")
    })
    const aria2Version = await open(ws)
    return new Aria2Helper(database, fileManager, aria2Version, aria2, downloadStatusUpdateDuration)
}

class Aria2Helper extends EventEmitter implements IAria2Helper {
    private userDownloads: Map<string, Set<string>>
    private database: InactiveDowloadsDb
    private downloadStatusUpdateDuration: number
    private aria2c
    private fileManager
    private version
    private webtorrent = new WebTorrent()
    constructor(database: InactiveDowloadsDb, fileManager: NFileObjectManager.IFileObjectManager, aria2version: Conn, aria2Client: ClientAria2, statusUpdateInterval: number) {
        if (!database) {
            throw new Error("Database oject not passed")
        }
        super()
        this.version = aria2version
        this.userDownloads = new Map()
        this.aria2c = aria2Client
        this.database = database
        this.fileManager = fileManager
        this.downloadStatusUpdateDuration = statusUpdateInterval
    }

    private async getFileSizeFromMagnet(uri: string, downloadPath: string): Promise<number> {
        const size = new Promise<number>((resolve, reject) => {
            this.webtorrent.add(uri, { path: downloadPath }, (torrent) => {
                let fileSize = torrent.length
                torrent.destroy({}, (err) => {
                    if (err) {
                        reject(err)
                    }
                })
                resolve(fileSize)
            })
        })
        return size
    }

    public async downloadWithURI(email: string, uri: string, downloadPath: string): Promise<IDownloadResult> {
        const result: IDownloadResult = { valid: false, guid: undefined, sizeLimitExceeded: false, error: false }
        try {
            let fileSize = undefined
            if (uri.startsWith("magnet:")) {
                // Uri is a magnet link
                const userDir = this.fileManager.getUserInfo(email).USER_HOME
                fileSize = await this.getFileSizeFromMagnet(uri, path.join(userDir, downloadPath))
                result.valid = true
            }
            if (!fileSize) {
                fileSize = await ufs(uri)
                result.valid = true
            }
            // Check if space is available
            if (this.fileManager.updateUsedDiskSpace(email, fileSize)) {
                const userDir = this.fileManager.getUserInfo(email).USER_HOME
                result.guid = await this.aria2c.addUri(this.version, [uri], { dir: path.join(userDir, downloadPath) })
                this.addUserDownload(email, result.guid)

                this.addStatusUpdateEventEmitter(email)
                console.log("Download started with GUID: " + result.guid)
            }
            else {
                result.sizeLimitExceeded = true
                throw new Error("NoSpaceAvailable")
            }
        }
        catch (e) {
            result.error = true
            console.error(e)
        }
        return result
    }


    public async downloadWithTorrent(email: string, torrentFilePath: string, downloadPath: string): Promise<ITorrentDownloadResult> {
        const result: ITorrentDownloadResult = { torrentPathExists: false, valid: false, guid: undefined, sizeLimitExceeded: false, error: false }
        try {
            const torrentFileObject = await this.fileManager.checkPermission(email, torrentFilePath)

            if (torrentFileObject) {
                if (torrentFileObject.permission && torrentFileObject.pathExists && torrentFileObject.fileName) {
                    result.torrentPathExists = true
                    const userDir = this.fileManager.getUserInfo(email).USER_HOME
                    const fullDownloadPath = path.join(userDir, downloadPath)
                    const file = await fs.readFile(path.join(torrentFileObject.dirName, torrentFileObject.fileName))
                    const torrentContents = files(file)
                    result.valid = true
                    // If size of file to be downloaded is lesser than available space
                    if (this.fileManager.updateUsedDiskSpace(email, torrentContents.length)) {
                        // Follow the torrent file and download contents from it
                        result.guid = await this.aria2c.addTorrent(this.version, file.toString('base64'), [], { dir: fullDownloadPath })
                        this.addUserDownload(email, result.guid)

                        this.addStatusUpdateEventEmitter(email)
                    }
                    else {
                        result.sizeLimitExceeded = true
                    }

                }
            }
        }
        catch (e) {
            result.error = true
            console.error(e)
        }
        return result
    }

    private getUserDownloads(email: string): Set<string> | undefined {
        return this.userDownloads.get(email)
    }

    private addUserDownload(email: string, guid: string): void {
        const user = this.userDownloads.get(email)
        if (user) {
            user.add(guid)
        }
        else {
            this.userDownloads.set(email, new Set([guid]))
        }
    }

    private removeUserDownload(email: string, guid: string): boolean {
        const user = this.userDownloads.get(email)
        if (user) {
            return user.delete(guid)
        }
        return false
    }

    private addStatusUpdateEventEmitter(email: string): void {
        const statusUpdateInterval = setInterval(async () => {
            const downloads = this.getUserDownloads(email)
            if (!downloads) {
                return false
            }
            const downloadStatusArray = await this.getUserDownloadStatus(downloads)
            for (let i = 0; i < downloadStatusArray.length; i++) {
                let download = downloadStatusArray[i]
                if (download.status === "complete" || download.status === "error") {
                    const guid = download.gid
                    this.removeUserDownload(email, guid)
                    await this.database.addInactiveDownload(email, guid, true)
                }
                this.emit('statusUpdate_' + email.toString(), download)
            }
            if (downloads.size === 0) {
                clearInterval(statusUpdateInterval)
            }
        }, this.downloadStatusUpdateDuration)
    }

    public async pauseDownload(email: string, guid: string): Promise<undefined | string> {
        let result = undefined
        try {
            const user = this.userDownloads.get(email)
            if (user) {
                if (user.has(guid)) {
                    result = await this.aria2c.pause(this.version, guid)
                    console.log("Download with guid : " + guid + " paused!")
                }
            }
        }
        catch (exception) {
            console.log("Aria2 API error!!! Bad request or aria2c client not running...\n" + exception)
        }

        return result
    }
    async resumeDownload(email: string, guid: string): Promise<undefined | string> {
        let result = undefined
        try {
            const user = this.userDownloads.get(email)
            if (user) {
                if (user.has(guid)) {
                    result = await this.aria2c.unpause(this.version, guid)
                    console.log("Download with guid : " + guid + " resumed!")
                }
            }
        }
        catch (exception) {
            console.log("Aria2 API error!!! Bad request or aria2c client not running...\n" + exception)
        }
        return result
    }
    public async cancelDownload(email: string, guid: string): Promise<string | undefined> {
        let result = undefined
        try {
            if (this.removeUserDownload(email, guid)) {
                result = await this.aria2c.remove(this.version, guid)
                console.log("Download with guid : " + guid + " cancelled!")
            }
        }
        catch (exception) {
            console.log("Aria2 API error!!! Bad request or aria2c client not running...\n" + exception)
        }
        return result
    }

    public async getUserDownloadStatus(guidSet: Set<string> | string[]): Promise<IAria2DownloadStatus[]> {
        const result: Array<IAria2DownloadStatus> = []
        try {
            for (let guid of guidSet) {
                const downloadStatus = await this.aria2c.tellStatus(this.version, guid)
                const resultStatus: any = { ...downloadStatus }
                delete resultStatus.files
                if (downloadStatus.files) {
                    let fileName = undefined
                    const filePath = downloadStatus.files[0].path
                    if (filePath.length > 0) {
                        fileName = path.basename(filePath)
                    }
                    resultStatus.file = fileName
                }
                result.push(resultStatus)
            }
        }
        catch (exception) {
            console.log("Aria2 API error!!! Bad request or aria2c client not running..." + "\n" + exception)
        }
        return result
    }

    public async getInactiveDownloads(email: string): Promise<undefined | IAria2DownloadStatus[]> {
        try {
            const inactiveDownloads = await this.database.getInactiveDownloads(email)
            if (inactiveDownloads) {
                return await this.getUserDownloadStatus(inactiveDownloads)
            }
        }
        catch (e) {
            console.error(e)
            console.error("Some error occured while fetching inactive downloads")
        }
        return undefined
    }
}