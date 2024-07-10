import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

  @Input() activeClip: IClip | null = null
  @Output() update = new EventEmitter()

  constructor(
    private modal: ModalService,
    private clipService : ClipService
  ) { }


  editModalId: string = "editModal"
  isSubmitting: boolean = false
  showAlert : boolean = false
  alertMsg :string = 'Please wait! Updating clip.'
  alertColor : string = 'blue'

  ngOnInit(): void {
    this.modal.register(this.editModalId)
  }

  ngOnDestroy(): void {
    this.modal.unregister(this.editModalId)
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return
    }
    this.title.setValue(this.activeClip?.title)
    this.isSubmitting = false
    this.editFrom.enable()
    this.showAlert = false
  }

  title = new FormControl('', [
    Validators.required
  ])

  editFrom = new FormGroup({
    title: this.title
  })

  async updateClip(){
    console.log('hjvdjw')
    if(!this.activeClip){
      return
    }
    this.editFrom.disable()
    this.isSubmitting = true,
    this.showAlert = true,
    this.alertMsg = 'Please wait! Updating clip.'
    this.alertColor = 'blue'

    this.activeClip.title = this.title.value as string
    try{
      await this.clipService.updateClip(this.activeClip.docId as string , this.activeClip.title)
      
    }catch(e){
      this.isSubmitting = false,
      this.showAlert = true,
      this.alertMsg = 'Something went wrong. Try again later'
      this.alertColor = 'red'
      this.editFrom.enable()
    } 

    this.update.emit(this.activeClip)

    this.isSubmitting = false,
    this.showAlert = true,
    this.alertMsg = 'Success'
    this.alertColor = 'green'
    this.editFrom.enable()
  }


}
