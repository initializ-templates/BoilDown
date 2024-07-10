import { Component } from '@angular/core';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    isSubmitting: boolean = false

    showAlert = false
    alertMsg = 'Please wait. You are logging in'
    alertColor = 'blue'

    constructor(
        private auth: AuthService
    ) { }

    credential = {
        email: "",
        password: ""
    }

    public async login() {
        this.isSubmitting = true

        this.showAlert = true
        this.alertMsg = 'Please wait!. We are logging you in'
        this.alertColor = 'blue'

        try {
            await this.auth.loginUser(this.credential as IUser)
        } catch (e) {
            console.log(e)
            this.alertMsg = 'An unexpected error occured. Please try again latter'
            this.alertColor = 'red'

            this.isSubmitting = false
            return
        }

        this.alertMsg = 'Success! You are now logged In'
        this.alertColor = 'green'

    }

}
