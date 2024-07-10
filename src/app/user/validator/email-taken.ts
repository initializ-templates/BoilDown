import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn : 'root'
})
export class EmailTaken implements AsyncValidator {

    constructor(
        private auth : AngularFireAuth
    ){}

    validate = async (control: AbstractControl): Promise<ValidationErrors | null> => {
        const response = await this.auth.fetchSignInMethodsForEmail(control.value);
        const error =  response.length ? {emailTaken : true} : null;
        return error
    }
}
