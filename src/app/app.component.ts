import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers :[DatePipe]
})
export class AppComponent {

  constructor(
    public auth:AuthService
  ){}

  title = 'BOIL DOWN';
}
