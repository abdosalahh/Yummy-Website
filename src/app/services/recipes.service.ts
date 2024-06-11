import { Injectable, inject } from '@angular/core';
import{Firestore,updateDoc,getFirestore,collection,collectionData,doc,getDoc, query, where, getDocs ,docData,addDoc,deleteDoc,setDoc, DocumentSnapshot}from '@angular/fire/firestore';
import { Observable, from,throwError } from 'rxjs';
import { recipe } from '../interfaces/recipe.interface';
import { response } from 'express';
import { Storage,getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { UserInterface } from '../../services/user_interface';
import { map } from 'rxjs/operators';
import { get } from 'http';
import { of } from 'rxjs';
import { shopping_items } from '../interfaces/shopItem';
import { switchMap, catchError } from 'rxjs/operators';
import { comment } from '../interfaces/comment.interface';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/UserService';



@Injectable({
  providedIn: 'root'
})
export class RecipesService {
 
  private firestore=inject(Firestore);
  recipescollection=collection(this.firestore,'recipes');
  userCollection = collection(this.firestore, 'users');
  ShoppingItemsCollection=collection(this.firestore,'shopping_items');

  selectedOptions: { [key: string]: string } = {};

  constructor( private storage: Storage, private fs: Firestore , private http: HttpClient,private userService: UserService){}
  
  getallrecipes(): Observable <recipe[]> {

    return collectionData(this.recipescollection, {idField:'id'}) as Observable<recipe[]>;
  }
  getallusers(): Observable <UserInterface[]> {
    
    return collectionData(this.userCollection, {idField:'id'}) as Observable<UserInterface[]>;
  }
  getRecipeById(id: string): Observable<recipe> {
    const recipeDocRef = doc(this.firestore, `recipes/${id}`);
    return docData(recipeDocRef, { idField: 'id' }) as Observable<recipe>;
  }
  getUsereById(id: string): Observable<UserInterface> {
    const userDocRef = doc(this.firestore, `users/${id}`);
    return docData(userDocRef, { idField: 'id' }) as Observable<UserInterface>;
  }
  
  getallItems(): Observable <shopping_items[]> {

    return collectionData(this.ShoppingItemsCollection, {idField:'id'}) as Observable<shopping_items[]>;
  }
  addCommentToRecipe(recipeId: string, comment: comment, user: UserInterface): Observable<void> {
    return this.userService.addCommentToRecipe(recipeId, comment, user);
  }
  addrecipe(name: string, image: File, Nutritional_benefits: string, ingredients: string, preparation_steps?: string,type?:string,Cuisine?:string,Cooking_time?:string,uid?:string): Observable<string> {
    const storageRef = ref(this.storage, `recipes/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    return new Observable<string>((observer) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Track upload progress if needed
        },
        (error) => {
          observer.error(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const recipecreate = { name, photoUrl: downloadURL, Nutritional_benefits, ingredients, preparation_steps,type,Cuisine,Cooking_time,uid };
            addDoc(this.recipescollection, recipecreate).then((response) => {
              observer.next(response.id);
              observer.complete();
            }).catch((error) => {
              observer.error(error);
            });
          }).catch((error) => {
            observer.error(error);
          });
        }
      );
    });
  }
  changeprofilepicture(image: File, currentuser: UserInterface): Observable<string> {
    const storageRef = ref(this.storage, `recipes/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);
  
    console.log('Starting file upload...');
  
    return new Observable<string>((observer) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Track upload progress if needed
        },
        (error) => {
          console.error('Error uploading file:', error);
          observer.error('Error uploading file: ' + error.message);
        },
        () => {
          // Upload completed successfully
          console.log('File uploaded successfully');
  
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log('Download URL:', downloadURL);
              
              // Prepare data to update in the user document
              const updatedUserData = { userphoto: downloadURL };
  
              const userDocRef = doc(this.firestore, 'users', currentuser.id);
              
              console.log('Updating user document...');
  
              // Update the user document with the download URL
              updateDoc(userDocRef, updatedUserData)
                .then(() => {
                  console.log('User document updated successfully');
                  observer.next(downloadURL);
                  observer.complete();
                })
                .catch((error) => {
                  console.error('Error updating user document:', error);
                  observer.error('Error updating user document: ' + error.message);
                });
            })
            .catch((error) => {
              console.error('Error getting download URL:', error);
              observer.error('Error getting download URL: ' + error.message);
            });
        }
      );
    });
  }
  updateRecipe(recipeId: string, recipeData: { name?: string, image?: File,photoUrl?:string, Nutritional_benefits?: string, ingredients?: string, preparation_steps?: string, type?: string, Cuisine?: string, Cooking_time?: string, uid?: string }): Observable<void> {
    return new Observable<void>((observer) => {
        // Check if there's an image to update
        if (recipeData.image) {
            const storageRef = ref(this.storage, `recipes/${recipeData.image.name}`);
            const uploadTask = uploadBytesResumable(storageRef, recipeData.image);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Track upload progress if needed
                },
                (error) => {
                    observer.error(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // Update recipe data with new image URL
                       
                        recipeData.photoUrl = downloadURL;
                        // Remove image from recipeData as it's not needed for document update
                        delete recipeData.image;
                        // Perform document update
                        updateDoc(doc(this.recipescollection, recipeId), recipeData).then(() => {
                            observer.next();
                            observer.complete();
                        }).catch((error) => {
                            observer.error(error);
                        });
                    }).catch((error) => {
                        observer.error(error);
                    });
                }
            );
        } else {
            // No image to update, perform document update directly
            console.log("fkjااااااااااااااللللللللللللللللللااااااااااdfn")

            updateDoc(doc(this.recipescollection, recipeId), recipeData).then(() => {
              
                observer.next();
                observer.complete();
            }).catch((error) => {
                observer.error(error);
            });
        }
    });
}
changeRecipePhoto(recipeId: string, newImage: File): Observable<string> {
  const storage = getStorage();
  const storageRef = ref(storage, `recipes/${newImage.name}`);
  const uploadTask = uploadBytesResumable(storageRef, newImage);

  return new Observable((observer) => {
    uploadTask.on('state_changed', {
      complete: () => {
        console.log("gbflggggggggggggggggggggggggggggggggggggggggggg")
        getDownloadURL(uploadTask.snapshot.ref)
          .then(downloadURL => {
            const firestore = getFirestore();
            const recipeDocRef = doc(firestore, 'recipes', recipeId);
            updateDoc(recipeDocRef, { photoUrl: downloadURL })
              .then(() => {
                observer.next(downloadURL);
                observer.complete();
              })
              .catch(error => observer.error(new Error(`Failed to update Firestore document: ${error.message}`)));
          })
          .catch(error => observer.error(new Error(`Failed to get download URL: ${error.message}`)));
      },
      error: uploadError => observer.error(new Error(`Upload failed: ${uploadError.message}`))
    });
  });
}

getCommentsForRecipe(recipeId: string): Observable<comment[]> {
  const recipeRef = doc(this.firestore, 'recipes', recipeId);
  return new Observable<comment[]>((observer) => {
    getDoc(recipeRef).then((snapshot) => {
      const recipeData = snapshot.data() as { comments?: comment[] }; // Explicit cast
      const comments = recipeData?.comments || [];
      observer.next(comments);
      observer.complete();
    }).catch((error) => {
      observer.error(error);
    });
  });
}

getRecipesByType(type: string): Observable<recipe[]> {
  return collectionData(
    query(this.recipescollection, where('type', '==', type)),
    { idField: 'id' }
  ) as Observable<recipe[]>;
}

getallIngredients(): Observable <shopping_items[]> {

  return collectionData(this.ShoppingItemsCollection, {idField:'id'}) as Observable<shopping_items[]>;
}

getItemById(id: string): Observable<shopping_items> {
  return this.http.get<shopping_items>('/api/shopping-items/${id}');
}

getLunchRecipes(): Observable<recipe[]> {
  return this.getRecipesByType('Lunch');
}

getBreakfastRecipes(): Observable<recipe[]> {
  return this.getRecipesByType('Breakfast');
}

getDinnerRecipes(): Observable<recipe[]> {
  return this.getRecipesByType('Dinner');
}

getSnacksRecipes(): Observable<recipe[]> {
  return this.getRecipesByType('Snacks');
} 
storeSelectedOptions(day: string, mealType: string, selectedOption: string): void {
  this.selectedOptions['${day}-${mealType}'] = selectedOption;
}

// Method to get selected options
getSelectedOptions(day: string, mealType: string): string {
  return this.selectedOptions['${day}-${mealType}'] || 'None';
}



}

