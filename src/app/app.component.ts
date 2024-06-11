import { Component, OnInit, inject } from '@angular/core';
import { authService } from '../services/auth.service';
import { UserService } from '../services/UserService';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent implements OnInit{

  userservice = inject(UserService);
  authService = inject(authService)
  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if(user){
        this.authService.currentUserSig.set({
          email : user.email!,
          username : user.displayName!,
          id: user.uid
        });
      } else{
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    });
  }
  
  title = 'Yummy';
}
