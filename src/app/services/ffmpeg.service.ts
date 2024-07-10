import { Injectable } from '@angular/core';
import { FS, createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
    providedIn: 'root'
})
export class FfmpegService {
    public isReady: boolean = false
    public isRunning: boolean = false
    private ffmpeg

    constructor() {
        this.ffmpeg = createFFmpeg({ log: true })
    }

    async init() {
        if (this.isReady) {
            return
        }

        await this.ffmpeg.load()
        this.isReady = true
    }

    async getScreenshots(file: File): Promise<string[]> {
        this.isRunning = true
        const data = await fetchFile(file)

        this.ffmpeg.FS('writeFile', file.name, data)

        const seconds = [1, 2, 3]
        const comands: string[] = []

        seconds.forEach(second => {
            comands.push(
                //input
                '-i', file.name,

                //output options
                '-ss', `00:00:0${second}`,
                '-frames:v', '1',
                '-filter:v', 'scale=510:-1',

                //output
                `screenshot_0${second}.png`
            )
        });

        await this.ffmpeg.run(...comands)

        const screenshots: string[] = []

        seconds.forEach((second) => {
            const screenshotFile = this.ffmpeg.FS('readFile', `screenshot_0${second}.png`)

            const screenshotBlob = new Blob(
                [screenshotFile.buffer], {
                type: "image/png"
            }
            )

            const screenshotURL = URL.createObjectURL(screenshotBlob);
            screenshots.push(screenshotURL)
        })

        this.isRunning = false
        return screenshots
    }

    async blobFormURL(url : string){
        const response = await fetch(url)
        const blob = await response.blob()
        return blob
    }
}
