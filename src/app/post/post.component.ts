import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute to access route parameters
import { RecipesService } from '../services/recipes.service'; // Import RecipeService to fetch recipe details
import { recipe } from '../interfaces/recipe.interface';
import { ViewChild,Inject, inject } from '@angular/core';
import { UserInterface } from '../../services/user_interface'; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import{Firestore,updateDoc,collection,collectionData,doc,getDoc, query, where, getDocs ,docData,addDoc,deleteDoc,setDoc}from '@angular/fire/firestore';
import { comment } from '../interfaces/comment.interface';
import { UserService } from '../../services/UserService';
import { Rate } from '../interfaces/Rate';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  isCommentFormVisible: boolean = false;
  UserInterfaces: UserInterface[] = [];
  current_user: UserInterface | undefined;
  recipes: recipe[] = [];
  comments: comment[] = [];
  recipe: recipe | undefined;
  users: UserInterface[] = []; // Array to store user data
  like:string="";
  postcreator: UserInterface[] = [];
  currentRecipe: recipe | undefined;
  newCommentText: string = '';
  inputValue: number = 0;

  toggleCommentForm() {
    this.isCommentFormVisible = !this.isCommentFormVisible;
  }

  constructor(private fs:Firestore,private renderer: Renderer2, private el: ElementRef,private route: ActivatedRoute,private rs: RecipesService,private usersrv:UserService) { }
  

  ngOnInit(): void
  {    
    // Stars of rate
    const itemId = this.route.snapshot.paramMap.get('id');
    const ratingStars = this.el.nativeElement.querySelectorAll('.rating i.fa-star') as NodeListOf<HTMLElement>;
    const auth = getAuth();
    if (itemId) {
      this.getRecipeWithComments(itemId);
    }
    
    onAuthStateChanged(auth, (user) => {
    if (user) {
     const uemail= user.email;
     if (uemail) {
      console.log('User id:', uemail); // Ensure that the user email is correct
      this.rs.getallusers().subscribe(data => {
        this.UserInterfaces = data.filter(UserInterface => UserInterface.email.includes(uemail)); 
        if(itemId)
        this.getRecipeById1(itemId);
     });
     if(itemId)
     this.rs.getallrecipes().subscribe(data => {
      this.recipes = data.filter(recipe => recipe.id?.includes(itemId));
      this.currentRecipe=this.recipes[0];
      if(this.UserInterfaces[0].favourites&&this.recipes[0].id)
        {if(this.UserInterfaces[0].favourites?.includes(this.recipes[0].id))
          {
            this.recipes[0].liked="red";
            
          }
          if(this.recipes[0].likes?.includes(this.UserInterfaces[0].id))
            this.like="blue";
  
        }
          const totallikes = document.getElementById("total likes");
          if(totallikes&&this.recipes[0].likes)
          totallikes.innerText = this.recipes[0].likes?.length.toString();


          if(this.recipes[0].rates)
            this.inputValue=this.calculateAverage(this.recipes[0].rates)


        const totalComment = document.getElementById("commentTab1");
        if(totalComment&&this.recipes[0].comments)
        totalComment.innerText = this.recipes[0].comments?.length.toString();
  
   });
   this.rs.getallusers().subscribe(data => {
    this.postcreator = data.filter(UserInterface => UserInterface.id.includes(this.recipes[0].uid));
    const rate = document.getElementById("postcreator");
    if(rate&&this.postcreator)
      rate.innerText = this.postcreator[0].username;


      const userphotoSpan = document.getElementById('user-photo-num');
      if (userphotoSpan) 
        userphotoSpan.setAttribute('src', this.postcreator[0].userphoto || '');
   
    
    if(itemId)
    this.getRecipeById1(itemId);

 });
    
}}});
    ratingStars.forEach((star: HTMLElement) => {
      this.renderer.listen(star, 'click', () => {
        const rating = parseInt(star.getAttribute('data-index') || '0', 10);
        const ratingContainer = star.parentNode as HTMLElement;
        const currentRating = parseInt(ratingContainer.getAttribute('data-rating') || '0', 10);

        // If the star is already active, remove the active class and set data-rating to 0
        if (currentRating === rating) {
          ratingContainer.setAttribute('data-rating', '0');
          star.classList.remove('active');
        } else {
          // If the star is not active, set data-rating to its index and highlight stars up to that index
          ratingContainer.setAttribute('data-rating', rating.toString());
          this.highlightStars(ratingContainer, rating);
        }
      });
    });

    // Heart of favorite
    const heartIcon = this.el.nativeElement.querySelector('#heartIcon');

    // Add a click event listener to the heart icon
    this.renderer.listen(heartIcon, 'click', () => {
      // Toggle the 'red' class to change the color
      heartIcon.classList.toggle('red');
    });

    // Like color
    // Get the thumbs-up icon element
    const likeIcon = this.el.nativeElement.querySelector("#likeIcon");
    // Add click event listener
    this.renderer.listen(likeIcon, "click", () => {
      // Toggle the 'active' class
      likeIcon.classList.toggle("active");
    });

    // Get the follow button element
    const followBtn = this.el.nativeElement.querySelector('#followBtn');
    // Add click event listener to the follow button
    this.renderer.listen(followBtn, 'click', () => {
      // Toggle follow/unfollow state
      if (followBtn.textContent === 'Follow') {
        followBtn.textContent = 'Unfollow';
        followBtn.style.backgroundColor = '#ccc';
        followBtn.style.color = 'black';
      } else {
        followBtn.textContent = 'Follow';
        followBtn.style.backgroundColor = 'rgb(0, 132, 255)';
        followBtn.style.color = 'white';
      }
    });

    // Comment form
    const commentTab = document.getElementById("commentTab");
    const modalBackground = document.getElementById("modalBackground");
    const commentForm = document.getElementById("commentForm");

    if (commentTab && modalBackground && commentForm) {
      commentTab.addEventListener("click", (event) => {
        event.preventDefault();
        modalBackground.style.display = "block"; // Show the modal background
        commentForm.style.display = "block"; // Show the comment form
      });

      // Hide the comment form when clicking on the modal background
      modalBackground.addEventListener("click", (event) => {
        if (event.target === modalBackground) {
          modalBackground.style.display = "none";
          commentForm.style.display = "none";
        }
      });

      // Prevent the comment form from closing when clicking inside it
      commentForm.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }

  }

  //stars
  private highlightStars(ratingContainer: HTMLElement, rating: number) {
    const stars = ratingContainer.querySelectorAll<HTMLElement>('i.fa-star');
    stars.forEach((star: HTMLElement) => {
      const starIndex = parseInt(star.getAttribute('data-index') || '0', 10);
      star.classList.toggle('active', starIndex <= rating);
    });
  }
  getRecipeById1(itemId: string) 
  {
    const user = this.UserInterfaces[0];
    if (user) {
    const recipee = this.rs.getRecipeById(itemId);
    recipee.subscribe((data) => {
      const { id,name, Nutritional_benefits, ingredients, preparation_steps, type, Cuisine, Cooking_time, photoUrl } = data;

      // Update HTML elements with recipe details
      const recipeNameElement = document.getElementById('recipeName');
      if (recipeNameElement) recipeNameElement.textContent = name || null;

      /////////////////////////////////////////////checked heart
      if (user.favourites&&id&&user.favourites.includes(id)) {

        // The ID exists in the user's favorites array
      } 

      //////////////////////////////////////////////////////
      // Update nutritional benefits in HTML
      const nutritionalBenefitsElement = document.getElementById('nutritionalBenefits');
      if (nutritionalBenefitsElement) {
        const sentences = (Nutritional_benefits || '').split('.').map(sentence => sentence.trim()).filter(Boolean);
        nutritionalBenefitsElement.innerHTML = sentences.map(sentence => {
          if (sentence.endsWith(',')) {
            return `<li>${sentence}</li><br>`;
          } else {
            return `<li>${sentence}</li>`;
          }
        }).join('');
      }

      // Update ingredients list in HTML
      const ingredientsList = document.getElementById('ingredientsList');
      if (ingredientsList) {
        const ingredientsHTML = (ingredients || '').split(',').map(ingredient => ingredient.trim()).join(', ');
        ingredientsList.textContent = ingredientsHTML;
      }

      // Update preparation steps list in HTML
      const preparationStepsList = document.getElementById('preparationSteps');
      if (preparationStepsList) {
        const sentences = (preparation_steps || '').split('.').map(sentence => sentence.trim()).filter(Boolean);
        preparationStepsList.innerHTML = sentences.map(sentence => {
          if (sentence.endsWith(',')) {
            return `<li>${sentence}</li><br>`;
          } else {
            return `<li>${sentence}</li>`;
          }
        }).join('');
      }

      // Update cooking steps list in HTML
    
      // Update preparation steps list in HTML
      const cookingStepsList = document.getElementById('cookingSteps');
      if (cookingStepsList) {
        const sentences = (preparation_steps || '').split(/[.,]/).map(sentence => sentence.trim()).filter(Boolean);
        cookingStepsList.innerHTML = sentences.map(sentence => `<li>${sentence}</li>`).join('');
      }

      // Update recipe type, cuisine, and cooking time in HTML
      const recipeTypeElement = document.getElementById('recipeType');
      if (recipeTypeElement) recipeTypeElement.innerHTML = `<span>meal: ${type}</span>`;

      const recipeCuisineElement = document.getElementById('recipeCuisine');
      if (recipeCuisineElement) recipeCuisineElement.innerHTML = `<span>Cuisine: ${Cuisine}</span>`;
      Cuisine
      const cookingTimeElement = document.getElementById('cookingTime');
      if (cookingTimeElement) cookingTimeElement.innerHTML = `<span>Time: ${Cooking_time}</span>`;

      // Update photoUrl in HTML
      const photoElement = document.getElementById('recipePhoto');
      if (photoElement) photoElement.setAttribute('src', photoUrl || '');
      const userphotoSpan = document.getElementById('user-photo-num');
        if (userphotoSpan) 
          userphotoSpan.setAttribute('src', user.userphoto || '');
      
    });
  }

  }

getRecipeWithComments(recipeId: string): void {
  this.rs.getRecipeById(recipeId).subscribe((data) => {
    this.recipe = data;
  });

  this.rs.getCommentsForRecipe(recipeId).subscribe({
    next: (comments) => {
      this.comments = comments;
      // Fetch user details for each comment
      this.comments.forEach(comment => {
         console.log(comment.username);
         console.log(comment.userphoto);
         console.log(comment.comment);
      });
    },
    error: (error) => {
      console.error('Error fetching comments:', error);
    }
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
            console.log('Favourites:',favourites); // Log favourites array to check its content
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

likefn(recipe: recipe) {
    
  const addedRecipeFavorite = recipe.id;
  const userId = this.UserInterfaces[0].id;
  const userFavorites = this.UserInterfaces[0].favourites || [];
  const likeslist = this.recipes[0].likes || [];

  if ( this.like != 'blue') {
    
   
   
    if(addedRecipeFavorite)
       if(likeslist.includes(userId))
          console.log('Recipe is already exist .');
        else
           {       
            const likes = [...(this.recipes[0].likes || []), userId];

           
            
            console.log('likes: ',likes);
            // Log favourites array to check its content
            const recipeDocRef = doc(this.fs, 'recipes', addedRecipeFavorite);
            
              updateDoc(recipeDocRef, { likes })
                .then(() => {
                  console.log('Recipe added to likes successfully.');
                })
                .catch((error) => {
                  console.error('Error adding likes to favorites:', error);
                });

             
              this.like="blue";
          }}
else
{
  if ( this.like === 'blue') {

    if(addedRecipeFavorite&&likeslist)
       if(likeslist.includes(userId))
        {     
          let user_id_remove = userId;
          const likes = this.recipes[0].likes?.filter(item => item !== user_id_remove);
          const curr_recipe_document_data = {
            likes
        };

        const curr_recipe_document = doc(this.fs, 'recipes',addedRecipeFavorite);  
    updateDoc(curr_recipe_document, curr_recipe_document_data)
    .then(() => {
      console.log('Document updatedddddd successfully');
    })
    .catch(error => {
      console.error('Error updating document:', error);
    });


     }
  this.like="#ccc";
}
}}

addComment(): void {
  if (!this.newCommentText.trim() || !this.UserInterfaces.length) {
    return;
  }

  const user = this.UserInterfaces[0];
  const newComment: comment = {
    userId: user.id,
    comment: this.newCommentText,
    username: user.username,
    userphoto: user.userphoto,
  };

  if (this.currentRecipe) {
    if (!this.currentRecipe.comments) {
      this.currentRecipe.comments = [];
    }
    this.currentRecipe.comments.push(newComment);
    this.rs.addCommentToRecipe(this.currentRecipe.id!, newComment, user).subscribe(() => {
      console.log('Comment added to recipe successfully.');
    });
  }

  this.usersrv.addCommentToUser(user, newComment).subscribe(() => {
    console.log('Comment added to user successfully.');
  });

  this.newCommentText = '';
}
giverate(recipe: recipe) {
    
  const addedRecipeFavorite = recipe.id;
  const userId = this.UserInterfaces[0].id;
  const rates = this.recipes[0].rates || [];
 
  const is_he_give_rate  = recipe.rates?.some(rate => rate.id === userId);
  if ( addedRecipeFavorite) {
       if(is_he_give_rate)
          {console.log('Recipe is already havd rate .');
           const is_he_give_rate  = recipe.rates?.some(rate => rate.id === userId);

           if(recipe.rates)
            recipe.rates=this.removeRateById(recipe.rates,userId);
          const rates=recipe.rates
  
          const ratedocdata = {
            rates
          };

  const reciperef = doc(this.fs, 'recipes', addedRecipeFavorite);
  updateDoc(reciperef, ratedocdata)
    .then(() => {
      console.log('Document updated successfully');
    })
    .catch(error => {
      console.error('Error updating document:', error);
    });
    console.log('recipe.rates:',recipe.rates);

          }

        else
           {     
            const newRate: Rate = {
              id: userId,
              value: this.inputValue // Assuming the rate value
          };  

            recipe.rates?.push(newRate);
            console.log('recipe.rates:',recipe.rates); // Log favourites array to check its content
            const reciperef = doc(this.fs, 'recipes', addedRecipeFavorite);
            updateDoc(reciperef, { rates })
              .then(() => {
                console.log('Recipe added to favorites successfully.');
              })
              .catch((error) => {
                console.error('Error adding recipe to favorites:', error);
              });
              console.log('recipe.rates:',recipe.rates);

          }}

if(recipe.rates)
  this.inputValue=this.calculateAverage(recipe.rates);



} 
getValue() {
  console.log('Input Value:', this.inputValue);
}

updateStars() {
  // Ensure the inputValue is between 1 and 5
  this.inputValue = Math.max(1, Math.min(5, this.inputValue || 0));
}
 calculateAverage(rates: Rate[]): number {
  if (rates.length === 0) {
      return 0; // Return 0 if there are no rates
  }

  const sum = rates.reduce((accumulator, rate) => {
      // If value is undefined, use 0 as its value
      const value = rate.value !== undefined ? rate.value : 0;
      return accumulator + value;
  }, 0);

  console.log('sssssssssssssssssss',sum / rates.length)
  return sum / rates.length;
}
 removeRateById(rates: Rate[], idToRemove: string): Rate[] {
  return rates.filter(rate => rate.id !== idToRemove);}
}
