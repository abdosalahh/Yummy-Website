
import { Component, ElementRef, OnInit, ViewChild,Inject, inject } from '@angular/core';
import { recipe } from '../interfaces/recipe.interface';
import { RecipesService } from '../services/recipes.service';
import { UserInterface } from '../../services/user_interface'; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Router } from '@angular/router'; // Import Angular Router for navigation

import{Firestore,updateDoc,collection,collectionData,doc,getDoc, query, where, getDocs ,docData,addDoc,deleteDoc,setDoc}from '@angular/fire/firestore';
@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css'
})
export class RecipesComponent implements OnInit{

  //search
  

  private fs=inject(Firestore);   

  isFilterDropdownOpen: boolean = false;
  selectedFilter: string = 'Recipe name'; // Default filter
  public image: any={};

  recipes: recipe[]=[]
  filteredRecipes: recipe[] = [];
  searchInput: string = '';
  heartColor: string = 'gray'; // Initial color
  UserInterfaces: UserInterface[] = [];

  constructor(private rs:RecipesService,private router: Router) {
    
  }

  ngOnInit(): void {
    // Love post
    this.rs.getallrecipes().subscribe(data => {
      this.recipes = data;
      this.filteredRecipes = [...this.recipes]; // Initially, display all recipes
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
      if (user) {
       const uemail = user.email;
       if (uemail) {
        console.log('User Email:', uemail); // Ensure that the user email is correct

        // Retrieve data only when user is authenticated
        this.rs.getallusers().subscribe(data => {
          this.UserInterfaces = data.filter(UserInterface => UserInterface.email.includes(uemail));

          this.filteredRecipes.forEach(recipe => {
            if (recipe.id && this.UserInterfaces[0].favourites?.includes(recipe.id)) {
              recipe.liked = 'red';
            } else {
              recipe.liked = '#ccc';
            }
          });
       });}}});
    });
    ////////////////////////////////
    // Love post
    

    // Add post form
    const addPostTab = document.getElementById("addPostTab");
    const modalBackground = document.getElementById("modalBackground");
    const addPostForm = document.getElementById("addPostForm");

    if (addPostTab && modalBackground && addPostForm) {
      addPostTab.addEventListener("click", (event) => {
        event.preventDefault();
        modalBackground.style.display = "block"; // Show the modal background
        addPostForm.style.display = "block"; // Show the modal form
      });

      // Hide the modal form when clicking on the modal background
      modalBackground.addEventListener("click", (event) => {
        if (event.target === modalBackground) {
          modalBackground.style.display = "none";
          addPostForm.style.display = "none";
        }
      });

      // Prevent the modal form from closing when clicking inside it
      addPostForm.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }
  }


  filterRecipes() {
    
    switch (this.selectedFilter) {
      case 'Recipe name':
        this.filteredRecipes = this.recipes.filter(recipe => 
          recipe.name?.toLowerCase().includes(this.searchInput.toLowerCase())
        );
        break;
        case 'Cooking time':
          // Split the search input into minutes and filter based on exact match
          const searchMinutes = parseInt(this.searchInput);
          if (!isNaN(searchMinutes)) {
            this.filteredRecipes = this.recipes.filter(recipe => {
              const recipeMinutes = parseInt(recipe.Cooking_time);
              return !isNaN(recipeMinutes) && recipeMinutes === searchMinutes;
            });
          } else {
            // If search input is not a number, default to filtering by recipe name
            this.filteredRecipes = this.recipes.filter(recipe => 
              recipe.name?.toLowerCase().includes(this.searchInput.toLowerCase())
            );
          }
          break;
      case 'Ingredients':
        this.filteredRecipes = this.recipes.filter(recipe =>
          recipe.ingredients?.toLowerCase().includes(this.searchInput.toLowerCase())
        );
        break;
      case 'Cuisine':
        this.filteredRecipes = this.recipes.filter(recipe =>
          recipe.Cuisine?.toLowerCase().includes(this.searchInput.toLowerCase())
        );
        break;
      default:
        // Default to filtering by recipe name if selectedFilter is not recognized
        this.filteredRecipes = this.recipes.filter(recipe => 
          recipe.name?.toLowerCase().includes(this.searchInput.toLowerCase())
        );
        break;
    }
  }

  resetSearch() {
   
    this.searchInput = '';
    this.filteredRecipes = [...this.recipes];
  }
  chooseFile(event: any) {
    this.image = event.target.files[0];
  }
  addRecipe(name: string, Nutritional_benefits: string, ingredients: string, preparation_steps?: string,type?:string,Cuisine?:string,Cooking_time?:string) {
    this.rs.addrecipe(name, this.image, Nutritional_benefits, ingredients, preparation_steps,type,Cuisine,Cooking_time).subscribe((id) => {
      console.log('Recipe added with ID: ', id);
      // Optionally, you can refresh the recipes list here
      this.image = {}; // Reset the image after adding the recipe
    }, (error) => {
      console.error('Error adding recipe: ', error);
    });
  }
  
  
  toggleHeart(recipe: recipe) {
    
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
    toggleFilterDropdown() {
      this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
    }
  
    selectFilter(filter: string) {
      this.selectedFilter = filter;
      this.isFilterDropdownOpen = false; // Close the dropdown after selecting a filter
      this.filterRecipes(); 
    }
    goToDetails(event:any, itemId: any) {
      event.preventDefault(); // Prevent default action
      // Your navigation logic here
      if(itemId) // Method to navigate to post details page
      this.router.navigate(['/post', itemId]); // Navigate to post details page with item ID
  }
}
