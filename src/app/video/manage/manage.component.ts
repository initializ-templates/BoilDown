import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

  videoOrder : string = '1'
  clips : IClip[] = []
  activeClip : IClip | null = null
  sort$: BehaviorSubject<string>

  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private clipService : ClipService,
    private modal : ModalService
  ){
    this.sort$ = new BehaviorSubject(this.videoOrder)
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params : Params)=>{
      this.videoOrder = params['sort'] === '2'? params['sort'] : '1'
      this.sort$.next(this.videoOrder)
    })
    
    this.clipService.getUserClips(this.sort$).subscribe(
      (docs)=>{
        this.clips = [],

        docs.forEach((doc)=>{
          this.clips.push({
            docId : doc.id,
            ...doc.data()
          })
        })
      }
    )
    
  }

  sort(event : Event){
    const {value} = (event.target as HTMLSelectElement)
    
    this.router.navigate([],
      {
        queryParams : {
          sort : value
        }
      })
  }

  openModal($event:Event, clip :IClip){
    $event.preventDefault()
    this.modal.toggeleModal('editModal')

    this.activeClip = clip
  }

  update($event : IClip){
    this.clips.forEach((clip, index)=>{
      if(clip.docId == $event.docId){
        this.clips[index].title = $event.title
      }
    })
  }

  async deleteClip($event: Event, clip : IClip){
    $event.preventDefault()
    await this.clipService.deleteClip(clip)

    this.clips.forEach((iretingClip, index)=>{
      if(clip.docId == iretingClip.docId){
        this.clips.splice(index, 1)
      }
    })
  }

  copyLinkToClipboard($event : MouseEvent, docId : string | undefined){
    $event.preventDefault()
    if(!docId){
      return
    }
    const url = `${location.origin}/clip/${docId}`
    
    navigator.clipboard.writeText(url)
    alert("Link copied")
  }
}
