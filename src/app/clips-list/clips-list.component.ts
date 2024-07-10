import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css']
})
export class ClipsListComponent implements OnInit, OnDestroy{
  @Input() isScrollable = true

  constructor(
    public clipService: ClipService
  ){
  
  }

  ngOnInit(): void {
    if(this.isScrollable){
      window.addEventListener('scroll', this.handlScroll)
    }
    this.clipService.getClips()
  }

  handlScroll = ()=>{
    const { scrollTop, offsetHeight } = document.documentElement
    const {innerHeight} = window

    const bottomOFWindow = Math.round(scrollTop) + innerHeight == offsetHeight 

    if(bottomOFWindow){
      this.clipService.getClips()
    }
  }

  ngOnDestroy(): void {
    if(this.isScrollable){
      window.removeEventListener('scroll', this.handlScroll)
    }

    this.clipService.clipsList = [] 
  }

}
