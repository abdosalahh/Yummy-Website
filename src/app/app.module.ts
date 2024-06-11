import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { MenusComponent } from './menus/menus.component';
import { FavouriteComponent } from './favourite/favourite.component';
import { PlaningComponent } from './planing/planing.component';
import { ShopComponent } from './shop/shop.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PostComponent } from './post/post.component';
import { ProfileComponent } from './profile/profile.component';
import { FollowersComponent } from './followers/followers.component';
import { FollowingComponent } from './following/following.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {getAuth,provideAuth} from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component'; 
import { RecipesComponent } from './recipes/recipes.component';   //////////////////////
import {provideStorage,getStorage} from '@angular/fire/storage';
import { MarketComponent } from './market/market.component';

const firebaseConfig = {
  apiKey: "AIzaSyAjsW_XtscMGvW-wef0mQ1xf9O1iMRZgIM",
  authDomain: "yummy-b9648.firebaseapp.com",
  databaseURL: "https://yummy-b9648-default-rtdb.firebaseio.com",
  projectId: "yummy-b9648",
  storageBucket: "yummy-b9648.appspot.com",
  messagingSenderId: "764647430075",
  appId: "1:764647430075:web:1a02881d726dc03b9c169e",
  measurementId: "G-JXZYH5ZJFM"
};

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    HomeComponent,
    MenusComponent,
    FavouriteComponent,
    PlaningComponent,
    ShopComponent,
    LoginComponent,
    RegisterComponent,
    PostComponent,
    ProfileComponent,
    FollowersComponent,
    FollowingComponent,
    RecipesComponent,
    MarketComponent
  ],
  imports: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
   
    provideStorage(() => getStorage())

  ],
  providers: [
    provideClientHydration(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([
      provideFirebaseApp(()=>initializeApp(firebaseConfig)),
      provideAuth(() => getAuth())
    ]),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
