
import { Component, AfterViewInit, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { RecipesService } from '../services/recipes.service';
import { UserInterface } from '../../services/user_interface'; 
import { recipe } from '../interfaces/recipe.interface';  
import { Firestore } from '@angular/fire/firestore';
import{updateDoc,collection,collectionData,doc,getDoc, query, where, getDocs ,docData,addDoc,deleteDoc,setDoc}from '@angular/fire/firestore';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Router } from '@angular/router'; // Import Angular Router for navigation

@Component({
  selector: 'app-favourite',
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.css']
})
export class FavouriteComponent implements AfterViewInit {
  private fs=inject(Firestore);   
  tutorialsRef: AngularFireList<recipe> | undefined;
  //code of heart
  constructor(@Inject(PLATFORM_ID) private platformId: Object,private rs:RecipesService,private router: Router) {}
  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Code accessing document object will only execute in a browser environment
      const hearts = document.querySelectorAll('.contain .screen .tab .desc i.fa-heart');
      hearts.forEach(heart => {
        heart.addEventListener('click', () => {
          heart.classList.toggle('red');
        });
      });
    }
  }
  UserInterfaces: UserInterface[] = [];
  recipes: recipe[]=[]

  isFilterDropdownOpen: boolean = false;

  ngOnInit(): void {
  
    
    this.rs.getallrecipes().subscribe(data => {
      this.recipes = data;
      this.recipes = [...this.recipes]; // Initially, display all recipes
    });
  
 
  this.display_liked_recipes()
}
display_liked_recipes() {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.email;
      if (uid) {
        console.log('User Email:', uid); // Ensure that the user email is correct

        // Retrieve data only when user is authenticated
        this.rs.getallusers().subscribe(data => {
          this.UserInterfaces = data.filter(UserInterface => UserInterface.email.includes(uid));
        });
        this.rs.getallrecipes().subscribe(data => {
          this.recipes = data;
          this.recipes = [...this.recipes]; // Initially, display all recipes
        });
      } else {
        console.log('User email is null.');
      }
    } else {
      console.log('There is no user. Please login.');
    }
  });
}
/*toggleHeart(recipe: recipe) {
  recipe.heartColor = (recipe.heartColor === 'red') ? '#ccc' : 'red'; 


  //
  
  if(recipe.heartColor=='#ccc')
   { 
    
    let valueToRemove=recipe.id;
    this.UserInterfaces[0].favourites=this.UserInterfaces[0].favourites?.filter(item => item !== valueToRemove)
    
     

 // updateDoc(curr_user_document, this.recipe)
    
   
  }
}*/
toggleHeart(recipe: recipe) {
  recipe.liked = (recipe.liked === 'red') ? '#ccc' : 'red'; 

  if (recipe.liked === 'red' && this.UserInterfaces && this.UserInterfaces.length > 0) {
    let valueToRemove = recipe.id;
    const id = this.UserInterfaces[0].id;
    const username = this.UserInterfaces[0].username;
    const email = this.UserInterfaces[0].email;
    const favourites = this.UserInterfaces[0].favourites?.filter(item => item !== valueToRemove);
    
    const curr_user_document_data = {
      id,
      username,
      email,
      favourites
    };

    const curr_user_document = doc(this.fs, 'users', this.UserInterfaces[0].id);
    updateDoc(curr_user_document, curr_user_document_data)
      .then(() => {
        console.log('Document updated successfully');
      })
      .catch(error => {
        console.error('Error updating document:', error);
      });
  }
}
goToDetails(event:any, itemId: any) {
  event.preventDefault(); // Prevent default action
  // Your navigation logic here
  if(itemId) // Method to navigate to post details page
  this.router.navigate(['/post', itemId]); // Navigate to post details page with item ID
}
}


