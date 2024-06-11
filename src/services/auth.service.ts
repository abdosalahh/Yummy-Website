import { Injectable, inject, signal } from '@angular/core';
import {AuthProvider} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user
} from '@angular/fire/auth';


import {Observable, from} from 'rxjs'
import { UserInterface } from './user_interface';
@Injectable({
    providedIn:'root'
})

export class authService
{


    firebaseAuth = inject(Auth)
    user$ = user(this.firebaseAuth)
    currentUserSig = signal<UserInterface | null | undefined>(undefined);
    
    register(username: string, email: string, password: string): Observable<string> {
        return new Observable<string>(observer => {
            createUserWithEmailAndPassword(this.firebaseAuth, email, password)
                .then(response => {
                    updateProfile(response.user, { displayName: username }).then(() => {
                        observer.next(response.user.uid); // Emit the user ID upon successful registration
                        observer.complete();
                    }).catch(error => {
                        observer.error(error);
                    });
                })
                .catch(error => {
                    observer.error(error);
                });
        });
    }

    login(
        email:string, 
        password:string, 
        )
        :Observable<void>
    {
        const promise = signInWithEmailAndPassword(
            this.firebaseAuth,
            email,
            password,
        ).then(() => {});
        return from(promise);
    }
    logout(): Observable<void>{
        const promise=signOut(this.firebaseAuth);
        return from(promise);
    }
}