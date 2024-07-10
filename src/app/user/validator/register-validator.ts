import { AbstractControl, ValidatorFn , ValidationErrors} from "@angular/forms";

export class RegisterValidator {
    static match(controlName : string, matchingControlName : string) : ValidatorFn{
        return (group : AbstractControl) : ValidationErrors | null=>{
            const control = group.get(controlName)
            const matchingControl = group.get(matchingControlName)

            if(!control || !matchingControl){
                console.log('Controls provided are not found')
                return  {
                    controlNotFound : true
                }
            }

            const error = control.value === matchingControl.value ? null : {noMatch : true}

            matchingControl.setErrors(error)

            return error
        }

    }
}
