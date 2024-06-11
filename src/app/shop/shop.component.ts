import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { shopping_items } from '../interfaces/shopItem';
import { RecipesService } from '../services/recipes.service';
import { Observable } from 'rxjs';
import { recipe } from '../interfaces/recipe.interface';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  selectedMeals: { [day: string]: { [mealType: string]: string } } = {};
  recipeList$: Observable<recipe[]> = new Observable<recipe[]>();
  shoppingItems: shopping_items[] = [];
  selectedIngredients: Set<string> = new Set<string>();

  constructor(private route: ActivatedRoute, private rs: RecipesService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedSelections = localStorage.getItem('selectedMeals');
      if (storedSelections) {
        this.selectedMeals = JSON.parse(storedSelections);
        console.log('Selected Meals:', this.selectedMeals);
        this.loadSelectedMealsIngredients();
      }
    }

    this.rs.getallItems().subscribe(items => {
      this.shoppingItems = items;
    });
  }

  // Load selected meal ingredients
  loadSelectedMealsIngredients(): void {
    this.rs.getallrecipes().subscribe(recipes => {
      Object.values(this.selectedMeals).forEach(meals => {
        Object.values(meals).forEach(mealId => {
          const recipe = recipes.find(r => r.id === mealId);
          if (recipe && recipe.ingredients) {
            const ingredientsArray = recipe.ingredients.split(',').map(ingredient => ingredient.trim());
            ingredientsArray.forEach(ingredient => this.selectedIngredients.add(ingredient));
          }
        });
      });
      console.log('Selected Ingredients:', Array.from(this.selectedIngredients));
    });
  }
}
