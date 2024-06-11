import { Injectable } from '@angular/core';
import { Firestore, collection, doc, DocumentReference, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserInterface } from '../../services/user_interface';

@Injectable({
  providedIn: 'root'
})
export class FollowServiceService {
  private firestore;
  private currentUserId: string | null = null;

  constructor(private angularFirestore: Firestore) {
    this.firestore = angularFirestore;
  }

  setCurrentUserId(userId: string | null): void {
    this.currentUserId = userId;
  }

  getFollowers(): Observable<UserInterface[]> {
    if (!this.currentUserId) {
      return new Observable<UserInterface[]>(observer => {
        observer.error('User not authenticated');
      });
    }

    const userDocRef: DocumentReference = doc(collection(this.firestore, 'users'), this.currentUserId);
    return new Observable<UserInterface[]>(observer => {
      getDoc(userDocRef).then(snapshot => {
        const user = snapshot.data();
        const followers = user ? user['followers'] || [] : [];
        observer.next(followers);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  getFollowings(): Observable<UserInterface[]> {
    if (!this.currentUserId) {
      return new Observable<UserInterface[]>(observer => {
        observer.error('User not authenticated');
      });
    }

    const userDocRef: DocumentReference = doc(collection(this.firestore, 'users'), this.currentUserId);
    return new Observable<UserInterface[]>(observer => {
      getDoc(userDocRef).then(snapshot => {
        const user = snapshot.data();
        const following = user ? user['following'] || [] : [];
        observer.next(following);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  unfollowUser(currentUserId: string, userIdToUnfollow: string): Observable<void> {
    if (!currentUserId) {
      return new Observable<void>(observer => {
        observer.error('User not authenticated');
      });
    }

    const userDocRef: DocumentReference = doc(collection(this.firestore, 'users'), currentUserId);
    return new Observable<void>(observer => {
      getDoc(userDocRef).then(snapshot => {
        const user = snapshot.data();
        if (user) {
          
          const updatedFollowing = (user['following'] || []).filter((id: string) => id !== userIdToUnfollow);
          updateDoc(userDocRef, { following: updatedFollowing }).then(() => {
            observer.next();
            observer.complete();
          }).catch(error => {
            observer.error(error);
          });
        } else {
          observer.error('User data not found');
        }
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  followUser(currentUserId: string, userIdToFollow: string): Observable<void> {
    if (!currentUserId) {
      return new Observable<void>(observer => {
        observer.error('User not authenticated');
      });
    }

    const userDocRef: DocumentReference = doc(collection(this.firestore, 'users'), currentUserId);
    return new Observable<void>(observer => {
      getDoc(userDocRef).then(snapshot => {
        const user = snapshot.data();
        if (user) {
          const updatedFollowing = [...(user['following'] || []), userIdToFollow];
          updateDoc(userDocRef, { following: updatedFollowing }).then(() => {
            observer.next();
            observer.complete();
          }).catch(error => {
            observer.error(error);
          });
        } else {
          observer.error('User data not found');
        }
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}