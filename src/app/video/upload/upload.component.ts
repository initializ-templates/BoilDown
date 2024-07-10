import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validator, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { combineLatest, forkJoin, last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'
import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/models/clip.model';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy{

  
  isDragover : boolean = false
  file :File | null = null
  showNextSteps : boolean = false

  percentage = 0
  showPercentage :boolean = false

  isSubmitting : boolean = false

  showAlert = false
  alertMsg = 'Please wait! Your clip is being uploaded.'
  alertColor = 'blue'

  screenshots : string[] = []
  selectedScreenshot :string = ''

  task? : AngularFireUploadTask
  screenshotTask? :AngularFireUploadTask

  user : firebase.User | null = null

  title = new FormControl('',
    [
      Validators.required,
    ]
  )

  uploadForm = new FormGroup({
      title : this.title
  })

  constructor(
    private storeage : AngularFireStorage,
    private auth : AngularFireAuth,
    private clip : ClipService,
    private router : Router,
    public ffmpegService : FfmpegService
  ){
    this.auth.user.subscribe( user => this.user = user)
    this.ffmpegService.init()
  }

  ngOnDestroy(): void {
      this.task?.cancel()
  }

  async storeFile($event :Event){
    if(this.ffmpegService.isRunning){
      return
    }
    this.isDragover = false

    this.file =  ($event as DragEvent).dataTransfer?
    ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
    ($event.target as HTMLInputElement).files?.item(0) ?? null

    if(!this.file || this.file.type !== 'video/mp4'){
      return
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file)
    this.selectedScreenshot = this.screenshots[0]

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/,''))

    this.showNextSteps = true
  }


  async uploadFile(){
    this.uploadForm.disable()
    this.isSubmitting = true
    this.showAlert = true
    this.alertMsg = 'Please wait! Your clip is being uploaded.'
    this.alertColor = 'blue'

    this.showPercentage = true

    const clipFileName  = uuid()
    const clipFilePath = `clips/${clipFileName}.mp4`

   this.task =  this.storeage.upload(clipFilePath, this.file)
   const clipRef = this.storeage.ref(clipFilePath)

   const screenshotBlob  = await this.ffmpegService.blobFormURL(this.selectedScreenshot)
   const screenshotPath = `screenshots/${clipFileName}.png`
   this.screenshotTask = this.storeage.upload(screenshotPath, screenshotBlob)
   const screenshotRef = this.storeage.ref(screenshotPath)

   combineLatest([ 
    this.task.percentageChanges(),
    this.screenshotTask.percentageChanges()
  ]).subscribe((percentage)=>{
    const [taskPrcentage, screenshotPercentage] = percentage
    if(!taskPrcentage || !screenshotPercentage){
      return
    }

    const total = taskPrcentage + screenshotPercentage
     this.percentage = total as number / 200
   })

   forkJoin([
    this.task.snapshotChanges(),
    this.screenshotTask.snapshotChanges()
  ]).pipe(
    switchMap(()=>forkJoin([
      clipRef.getDownloadURL(),
      screenshotRef.getDownloadURL()
    ]))
   ).subscribe({
    next : async (url)=>{
      const [clipURL, screenshotURL] = url
      const clip = {
        uid : this.user?.uid as string,
        displayName : this.user?.displayName as string,
        title : this.title.value,
        fileName : `${clipFileName}.mp4`,
        url : clipURL,
        screenshotURL : screenshotURL,
        screenshotName : `${clipFileName}.png`,
        timeStamp : firebase.firestore.FieldValue.serverTimestamp()
      }

      const clipDocRef = await this.clip.createClip(clip as IClip)
      
      this.alertMsg = 'Success! Your clip is noe ready to share with world'
      this.alertColor = 'green'
      this.showPercentage=false

      setTimeout(() => {
        this.router.navigate(['clip', clipDocRef.id])
      }, 1000);
    },
    error:(error)=>{
      this.uploadForm.enable()
      this.alertMsg = 'Upload failed! Please try again latter'
      this.alertColor = 'red'
      this.showPercentage = false
      this.isSubmitting = true
      console.log(error)
    }
   })

  }
  

}
