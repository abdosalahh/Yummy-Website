import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { recipe } from '../interfaces/recipe.interface';
import { ViewChild,Inject, inject } from '@angular/core';
import { RecipesService } from '../services/recipes.service';
import { UserInterface } from '../../services/user_interface'; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import{Firestore,updateDoc,collection,collectionData,doc,getDoc, query, where, getDocs ,docData,addDoc,deleteDoc,setDoc}from '@angular/fire/firestore';
import { Router } from '@angular/router'; // Import Angular Router for navigation

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fs=inject(Firestore);   

  recipes: recipe[]=[]
  UserInterfaces: UserInterface[] = [];
  current_user: UserInterface | undefined;
  changeuser_photo: UserInterface | undefined;
  uid:string='';
  public image: any={};
  recipe1: recipe | undefined;
  constructor(private renderer: Renderer2, private el: ElementRef,private rs:RecipesService,private router: Router) {}
  
  ngOnInit(): void {
    this.setupLovePost();
    this.setupAddPostForm();
    
   
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
      if (user) {
       const uemail= user.email;
      if (uemail) 
      {
        console.log('User id:', uemail); // Ensure that the user email is correct
        this.rs.getallusers().subscribe(data => {
          this.UserInterfaces = data.filter(UserInterface => UserInterface.email.includes(uemail));
          this.current_user=this.UserInterfaces[0];
          this.uid=this.UserInterfaces[0].id;
          const userNameSpan = document.getElementById("user-name");
          const followersSpan  = document.getElementById("user-followers-num");
          const followingSpan = document.getElementById("user-following-num");
          


          if (userNameSpan)
            userNameSpan.innerText = this.current_user.username;
          
          // Set the inner text of the span to the user's name
          
          if(followersSpan&&this.current_user.followers)
          followersSpan.innerText = this.current_user.followers?.length.toString();
          if(followingSpan&&this.current_user.following)
          followingSpan.innerText = this.current_user.following?.length.toString();
          
          const userphotoSpan = document.getElementById('user-photo-num');
          if (userphotoSpan) userphotoSpan.setAttribute('src', this.current_user.userphoto || '');

          
       
       });
        // Retrieve data only when user is authenticated
        this.rs.getallrecipes().subscribe(data => {
          this.recipes = data.filter(recipe => recipe.uid.includes(this.uid));
          this.recipes.forEach(recipe => {
            const postsSpan = document.getElementById("user-posts-num");
           
            if (this.recipes && postsSpan) {
  // Set the inner text of the span to the length of the recipes array as a string
              postsSpan.innerText = this.recipes.length.toString();
            }
            if (recipe.id && this.UserInterfaces[0].favourites?.includes(recipe.id)) {
              recipe.liked = 'red';
            } else {
              recipe.liked = '#ccc';
            }
          });
          
       });}}});
       
  }

  // Love post
  private setupLovePost(): void {
    const hearts = this.el.nativeElement.querySelectorAll('.contain .screen .tab .desc i.fa-heart');
    hearts.forEach((heart: HTMLElement) => {
      heart.addEventListener('click', () => {
        heart.classList.toggle('red');
      });
    });
  }

  // Add post form
  private setupAddPostForm(): void {
    const addPostTab = this.el.nativeElement.querySelector("#addPostTab");
    const modalBackground = this.el.nativeElement.querySelector("#modalBackground");
    const addPostForm = this.el.nativeElement.querySelector("#addPostForm");

    if (addPostTab && modalBackground && addPostForm) {
      addPostTab.addEventListener("click", (event: MouseEvent) => { // Specify MouseEvent type
        event.preventDefault();
        modalBackground.style.display = "block"; // Show the modal background
        addPostForm.style.display = "block"; // Show the modal form
      });

      // Hide the modal form when clicking on the modal background
      modalBackground.addEventListener("click", (event: MouseEvent) => { // Specify MouseEvent type
        if (event.target === modalBackground) {
          modalBackground.style.display = "none";
          addPostForm.style.display = "none";
        }
      });

      // Prevent the modal form from closing when clicking inside it
      addPostForm.addEventListener("click", (event: MouseEvent) => { // Specify MouseEvent type
        event.stopPropagation();
      });
    }
  }
  toggleHeart(event: Event, recipe: recipe) {
    event.preventDefault(); // Prevent default action (navigation)
    event.stopPropagation(); 
    
    const addedRecipeFavorite = recipe.id;
    const userId = this.UserInterfaces[0].id;
    const userFavorites = this.UserInterfaces[0].favourites || [];

    if ( recipe.liked != 'red') {
      
     
     
      if(addedRecipeFavorite)
         if(userFavorites.includes(addedRecipeFavorite))
            console.log('Recipe is already exist .');
          else
             {       
              const favourites = [...(this.UserInterfaces[0].favourites || []), addedRecipeFavorite];
              console.log('Favourites:', favourites); // Log favourites array to check its content
              const userDocRef = doc(this.fs, 'users', userId);
              updateDoc(userDocRef, { favourites })
                .then(() => {
                  console.log('Recipe added to favorites successfully.');
                })
                .catch((error) => {
                  console.error('Error adding recipe to favorites:', error);
                });
                recipe.liked = 'red';
            }}
  else
  {
    if ( recipe.liked === 'red') {
      
     
     
      if(addedRecipeFavorite)
         if(userFavorites.includes(addedRecipeFavorite))
          {
            let valueToRemove = addedRecipeFavorite;
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
    
    
    
    
    
    
    
    recipe.liked = '#ccc'




  }
  }}
  chooseFile(event: any) {
    this.image = event.target.files[0];
    console.log("enter the function2")
  }
  addRecipe(name: string, Nutritional_benefits: string, ingredients: string, preparation_steps?: string,type?:string,Cuisine?:string,Cooking_time?:string) {
    
    this.rs.addrecipe(name, this.image, Nutritional_benefits, ingredients, preparation_steps,type,Cuisine,Cooking_time,this.uid).subscribe((id) => {
      console.log('Recipe added with ID: ', id);
      // Optionally, you can refresh the recipes list here
      this.image = {}; // Reset the image after adding the recipe
    }, (error) => {
      console.error('Error adding recipe: ', error);
    });
  }
  changeuserphoto( )
  {
    this.changeuser_photo =this.UserInterfaces[0];
   if(this.rs.changeprofilepicture( this.image ,this.changeuser_photo))
    console.log("enter the function")
    
    


}
getRecipeById1() {
  const user = this.UserInterfaces[0];
  if (user) {
    const recipee = this.rs.getRecipeById("16a3RZy2ghFydrrKKh1u");
    recipee.subscribe((data) => {
      const { name, Nutritional_benefits, ingredients, preparation_steps, type, Cuisine, Cooking_time } = data;
      console.log('Name:', name);
      console.log('Nutritional Benefits:', Nutritional_benefits);
      console.log('Ingredients:', ingredients);
      console.log('Preparation Steps:', preparation_steps);
      console.log('Type:', type);
      console.log('Cuisine:', Cuisine);
      console.log('Cooking Time:', Cooking_time);
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
  
