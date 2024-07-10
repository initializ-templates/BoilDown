import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot , Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ClipService  {

    private clipsCollection: AngularFirestoreCollection<IClip>
    public clipsList: IClip[] = []
    private panddingRequest: boolean = false

    constructor(
        private db: AngularFirestore,
        private auth: AngularFireAuth,
        private storage: AngularFireStorage,
        private router : Router
    ) {
        this.clipsCollection = db.collection<IClip>('clips')
    }

    public createClip(data: IClip): Promise<DocumentReference<IClip>> {
        return this.clipsCollection.add(data)
    }

    public getUserClips($sort$: BehaviorSubject<string>) {
        return combineLatest([
            this.auth.user,
            $sort$
        ]).pipe(
            switchMap((value) => {
                const [user, sort] = value

                if (!user) {
                    return of([])
                }

                const query = this.clipsCollection.ref.where('uid', '==', user.uid).orderBy('timeStamp', sort === '1' ? 'desc' : 'asc')

                return query.get()
            }),
            map((snapshot) => {
                return (snapshot as QuerySnapshot<IClip>).docs
            })
        )
    }

    public async updateClip(docId: string, title: string) {
        await this.clipsCollection.doc(docId).update({
            title: title
        })
    }

    public async deleteClip(clip: IClip) {
        const clipRef = this.storage.ref(`clips/${clip.fileName}`)
        clipRef.delete()

        const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotName}`)
        screenshotRef.delete()

        await this.clipsCollection.doc(clip.docId).delete()

    }

    public async getClips() {
        if (this.panddingRequest) {
            return
        }

        this.panddingRequest = true
        let query = this.clipsCollection.ref.orderBy('timeStamp', 'desc').limit(6)

        if (this.clipsList.length != 0) {
            console.log("after")
            const lastDocID = this.clipsList[this.clipsList.length - 1].docId
            const lastDoc = await this.clipsCollection.ref.doc(lastDocID).get()

            query = query.startAfter(lastDoc)
        }

        const snapshot = await query.get()

        snapshot.forEach((doc) => {
            this.clipsList.push({
                docId: doc.id,
                ...doc.data()
            })
        })

        this.panddingRequest = false
    }

    resolve : ResolveFn<IClip|null> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot)=>{
        return this.clipsCollection.doc(route.params['id']).get().pipe(
            map((snapshot)=>{
                const data = snapshot.data()
                if(!data){
                    this.router.navigate(['/'])
                    return null
                }

                return data
            })
        )
    }
}
