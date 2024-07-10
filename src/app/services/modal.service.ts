import { Injectable } from '@angular/core';

interface IModal{
  Id : string
  Visible : boolean
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private Modals : IModal[] = [];

  constructor() { }

  register(Id :string){
    this.Modals.push({
      Id : Id,
      Visible : false
    })
  }

  unregister(Id :string){
    this.Modals = this.Modals.filter(element => element.Id !== Id)
  }

  isModalOpen (Id : string) : boolean{
    return Boolean(this.Modals.find(element => element.Id === Id)?.Visible)
  }

  toggeleModal(Id : string){
    var modal = this.Modals.find(element => element.Id === Id)
    if(modal){
      modal.Visible = !modal.Visible
    }

  }
}
