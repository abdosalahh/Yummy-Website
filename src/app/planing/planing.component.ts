import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecipesService } from '../services/recipes.service';
import { recipe } from '../interfaces/recipe.interface';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { shopping_items } from '../interfaces/shopItem';

@Component({
  selector: 'app-planing',
  templateUrl: './planing.component.html',
  styleUrls: ['./planing.component.css']
})
export class PlaningComponent implements OnInit, OnDestroy {
  breakfastRecipes: recipe[] = [];
  lunchRecipes: recipe[] = [];
  dinnerRecipes: recipe[] = [];
  snacksRecipes: recipe[] = [];
  subscription: Subscription = new Subscription();
  selectedMeals: { [day: string]: { [mealType: string]: string } } = {};
  shoppingItems: shopping_items[] = [];
  allSelectedMealsIngredients: { [category: string]: string[] } = {}; // Object to store ingredients of all selected meals by category

  constructor(private recipesService: RecipesService, private router: Router) {}

  ngOnInit(): void {
    this.recipesService.getallItems().subscribe(items => {
      this.shoppingItems = items;
    });
    this.loadRecipes();

    // Load saved selections from localStorage
    const storedSelections = localStorage.getItem('selectedMeals');
    if (storedSelections) {
      this.selectedMeals = JSON.parse(storedSelections);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Unsubscribe from all subscriptions to avoid memory leaks
  }

  // Function to handle selection of meals
  selectMeal(event: Event, day: string, mealType: string): void {
    const selectElement = event.target as HTMLSelectElement;
    const meal = selectElement.value;

    if (!this.selectedMeals[day]) {
      this.selectedMeals[day] = {};
    }
    this.selectedMeals[day][mealType] = meal;
    console.log(`Selected meal for ${day} ${mealType}:`, meal);
    console.log('Current selected meals:', this.selectedMeals);
  }

  // Function to handle submission of entire form
  onSubmit(): void {
    // Extract ingredients by category for selected meals
    this.extractIngredientsByCategory();

    // Store selected meals in local storage
    localStorage.setItem('selectedMeals', JSON.stringify(this.selectedMeals));
    console.log('Selected meals stored in local storage:', this.selectedMeals);

    // Navigate to the shop page
    this.router.navigate(['/shop']);
  }

  // Function to load recipes
  loadRecipes(): void {
    this.subscription.add(
      this.recipesService.getBreakfastRecipes().subscribe({
        next: (recipes: recipe[]) => {
          this.breakfastRecipes = recipes;
        },
        error: (error) => {
          console.error('Error fetching breakfast recipes:', error);
        }
      })
    );

    this.subscription.add(
      this.recipesService.getLunchRecipes().subscribe({
        next: (recipes: recipe[]) => {
          this.lunchRecipes = recipes;
        },
        error: (error) => {
          console.error('Error fetching lunch recipes:', error);
        }
      })
    );

    this.subscription.add(
      this.recipesService.getDinnerRecipes().subscribe({
        next: (recipes: recipe[]) => {
          this.dinnerRecipes = recipes;
        },
        error: (error) => {
          console.error('Error fetching dinner recipes:', error);
        }
      })
    );

    this.subscription.add(
      this.recipesService.getSnacksRecipes().subscribe({
        next: (recipes: recipe[]) => {
          this.snacksRecipes = recipes;
        },
        error: (error) => {
          console.error('Error fetching snacks recipes:', error);
        }
      })
    );
  }

  // Extract ingredients by category for selected meals
  extractIngredientsByCategory(): void {
    Object.values(this.selectedMeals).forEach(meals => {
      Object.values(meals).forEach(mealId => {
        const recipe = this.findRecipeById(mealId);
        if (recipe?.ingredients) {
          // Split the ingredients string into an array
          const ingredientsArray = recipe.ingredients.split(',').map(ingredient => ingredient.trim());
          ingredientsArray.forEach(ingredient => {
            const category = this.getIngredientCategory(ingredient);
            if (!this.allSelectedMealsIngredients[category]) {
              this.allSelectedMealsIngredients[category] = [];
            }
            if (!this.allSelectedMealsIngredients[category].includes(ingredient)) {
              this.allSelectedMealsIngredients[category].push(ingredient);
            }
          });
        }
      });
    });
  }

  // Find recipe by ID
  findRecipeById(recipeId: string): recipe | undefined {
    return [...this.breakfastRecipes, ...this.lunchRecipes, ...this.dinnerRecipes, ...this.snacksRecipes].find(recipe => recipe.id === recipeId);
  }

  // Get ingredient category
  getIngredientCategory(ingredient: string): string {
    // Add your logic to determine the category of the ingredient
    const categoryMap: { [key: string]: string } = {
      'tomato': 'Vegetables',
      'apple': 'Fruits',
      'chicken': 'Proteins',
      // Add more mappings as needed
    };
    return categoryMap[ingredient.toLowerCase()] || 'Other';
  }
}
