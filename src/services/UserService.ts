import { Firestore, collection, doc, addDoc, deleteDoc, setDoc, collectionData, updateDoc, arrayUnion, runTransaction } from '@angular/fire/firestore';
import { UserInterface } from './user_interface';
import { from, Observable } from 'rxjs'; 
import { inject, Injectable } from '@angular/core';
import { comment } from '../app/interfaces/comment.interface';

@Injectable({
    providedIn: 'root'
})

export class UserService{
    private firestore = inject(Firestore);
    userCollection = collection(this.firestore, 'users');
    constructor(){}
    

    getallUsers(): Observable <UserInterface[]> 
    {
        return collectionData(this.userCollection, {idField:'id'}) as Observable<UserInterface[]>;
    }

    

    addUser(id: string, email: string,username: 
        string,phone:string,age:number,password?:string)
        :Observable<string>
    {
    const usercreate={id,email,username,phone,age,password};
    const promise=addDoc(this.userCollection,usercreate).then((response)=>{return response.id;});
    return from(promise);  
    }

    addCommentToRecipe(recipeId: string, comment: comment, user: UserInterface): Observable<void> {
        const recipeDocRef = doc(this.firestore, 'recipes', recipeId);
    
        const promise = runTransaction(this.firestore, async (transaction) => {
            const recipeDoc = await transaction.get(recipeDocRef);
            if (!recipeDoc.exists()) {
                throw new Error('Recipe does not exist!');
            }
    
            const recipeData = recipeDoc.data();
            const currentComments = recipeData['comments'] || [];
            const updatedComments = [...currentComments, comment];
            
            // Update the comments array in the recipe document
            transaction.update(recipeDocRef, { comments: updatedComments });
        });
    
        return from(promise);
    }
    
    addCommentToUser(user: UserInterface, comment: comment): Observable<void> {
        const userDocRef = doc(this.firestore, 'users', user.id);
    
        const promise = runTransaction(this.firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw new Error('User does not exist!');
            }
    
            const userData = userDoc.data();
            const currentComments = userData['comments'] || [];
            const updatedComments = [...currentComments, comment];
            
            // Update the comments array in the user document
            transaction.update(userDocRef, { comments: updatedComments });
        });
    
        return from(promise);
    }
    
}