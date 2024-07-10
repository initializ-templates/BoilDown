import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  onGoto(){
    let link=document.createElement('a');
    link.href='https://www.linkedin.com/in/manjeet-s-7860b5242';
    link.click();
  }

  onGithub(){
    let link=document.createElement('a');
    link.href='https://www.github.com/samratmanjeet7';
    link.click();
  }

}
