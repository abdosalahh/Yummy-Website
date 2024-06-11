import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MenusComponent } from './menus/menus.component';
import { PlaningComponent } from './planing/planing.component';
import { FavouriteComponent } from './favourite/favourite.component';
import { ShopComponent } from './shop/shop.component';
import { ProfileComponent } from './profile/profile.component';
import { FollowersComponent } from './followers/followers.component';
import { FollowingComponent } from './following/following.component';
import { RegisterComponent } from './register/register.component';
import { PostComponent } from './post/post.component';
import { RecipesComponent } from './recipes/recipes.component';
import { MarketComponent } from './market/market.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'menus', component: MenusComponent },
  { path: 'favourite', component: FavouriteComponent },
  { path: 'planing', component: PlaningComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'followers', component: FollowersComponent },
  { path: 'following', component: FollowingComponent},
  { path: 'post/:id', component: PostComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'market', component: MarketComponent},
  { path: 'recipes', component: RecipesComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/menus' } // Redirect to 'menus' component if route not found

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
