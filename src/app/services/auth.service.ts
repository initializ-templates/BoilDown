import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import IUser from '../models/user.model';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore'
import { Observable, of } from 'rxjs';
import { delay, filter, map, switchMap} from 'rxjs/operators'
import { NavigationEnd, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersCollection : AngularFirestoreCollection<IUser>
  public isAuthenticated$ : Observable<Boolean>
  public isAuthenticatedWithDelay$ : Observable<Boolean>
  private isredirected : boolean = false

  constructor(
    private auth : AngularFireAuth,
    private db  : AngularFirestore,
    private router : Router,
    private route : ActivatedRoute
    ) { 
      this.usersCollection = db.collection<IUser>('users')
      this.isAuthenticated$ = auth.user.pipe(
        map((user)=> Boolean(user))
      )
      this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
        delay(1000)
      )

      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        map( e => this.route.firstChild),
        switchMap(e => e?.data ?? of({authOnly : false}))
      ).subscribe(
        (data)=>{
          this.isredirected = data.authOnly ?? false
        }
      )
    }


  public async crateUser(userData : IUser){
    if(!userData.password){
      throw new Error("Password is not provided!")
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email as string, 
      userData.password as string
      ) 

    if(!userCred.user){
      throw new Error('User not found!')
    }

    await this.usersCollection.doc(userCred.user.uid).set({
      name : userData.name,
      email : userData.email,
      age : userData.age,
      phoneNumber : userData.phoneNumber
    })

    await userCred.user.updateProfile({
      displayName : userData.name
    })

  }

  public async loginUser(cerdential : IUser){
    if(!cerdential.password){
      throw new Error("Password is not provided!")
    }
    
    await this.auth.signInWithEmailAndPassword(
      cerdential.email,
      cerdential.password
    )
  }

  public async logout($event? : Event){
    if($event){
      $event.preventDefault()
    }

    this.auth.signOut()

    if(this.isredirected){
      this.router.navigateByUrl('/')
    } 
  }
}
