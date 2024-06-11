import { Component, OnInit } from '@angular/core';
import { FollowServiceService } from '../services/follow-service.service';
import { UserInterface } from '../../services/user_interface';
import { onAuthStateChanged, getAuth } from '@angular/fire/auth';
import { RecipesService } from '../services/recipes.service';
import { recipe } from '../interfaces/recipe.interface';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.css'] 
})
export class FollowingComponent implements OnInit {
  followingUsers: UserInterface[] = [];
  currentUserId: string | null = null;
  UserInterfaces: UserInterface[] = [];
  UserInterfaces2: UserInterface[] = [];
  current_user: UserInterface | undefined;
  uid:string='';
  recipes: recipe[]=[];


  constructor(private followService: FollowServiceService, private rs: RecipesService) {}
  UserInterface: UserInterface | undefined ;

  ngOnInit(): void {
    const auth = getAuth(); 
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uemail = user.email;
        if (uemail) {
          console.log('User id:', uemail); // Ensure that the user email is correct
          this.rs.getallusers().subscribe(data => {
            this.UserInterfaces = data.filter(UserInterface => UserInterface.email.includes(uemail));
            this.current_user=this.UserInterfaces[0];
            this.uid=this.UserInterfaces[0].id;
            const userNameSpan = document.getElementById("user-name");
            const followersSpan  = document.getElementById("user-followers-num");
            const followingSpan = document.getElementById("user-following-num");
            
         if (userNameSpan&&this.current_user.following&&this.current_user.followers) {
          // Set the inner text of the span to the user's name
          userNameSpan.innerText = this.current_user.username;
          if(followersSpan)
          followersSpan.innerText = this.current_user.followers?.length.toString();
          if(followingSpan)
          followingSpan.innerText = this.current_user.following?.length.toString();
          
          const userphotoSpan = document.getElementById('user-photo-num');
          if (userphotoSpan) userphotoSpan.setAttribute('src', this.current_user.userphoto || '');
         
        }
      });
      this.rs.getallrecipes().subscribe(data => {
        this.recipes = data.filter(recipe => recipe.uid.includes(this.uid));
        this.recipes.forEach(recipe => {
          const postsSpan = document.getElementById("user-posts-num");
         
          if (this.recipes && postsSpan) {
// Set the inner text of the span to the length of the recipes array as a string
            postsSpan.innerText = this.recipes.length.toString();
          }
        });
        
     });

          console.log('User id:', uemail); // Ensure that the user email is correct
          this.rs.getallusers().subscribe(data => {
            this.UserInterfaces = data.filter(UserInterface => UserInterface.email.includes(uemail));
            this.currentUserId = this.UserInterfaces[0]?.id; // Use optional chaining to access id
            if (this.currentUserId) {
              // Call getFollowings() here
              this.getFollowings();
            }
          });
        }
        this.rs.getallusers().subscribe(data => {
          this.UserInterfaces2 = data;
          this.UserInterfaces2 = [...this.UserInterfaces2];
        });
      }
    });
  }

  getFollowings(): void {
    if (!this.currentUserId) {
      console.error('Current user ID is null');
      return;
    }

    this.followService.setCurrentUserId(this.currentUserId);
    this.followService.getFollowings().subscribe((followingUsers: UserInterface[]) => {
      this.followingUsers = followingUsers;
    });
  }

  toggleFollow(userId: string, event: MouseEvent): void {
    if (!this.currentUserId) {
      console.error('Current user ID is null');
      return;
    }
  
    const button = event.target as HTMLButtonElement;
    if (!button) {
      console.error('Button element not found');
      return;
    }
  
    if (button.textContent === 'Follow') {
      this.followService.followUser(this.currentUserId, userId) // Pass both userIds to followUser method
        .subscribe(() => {
          button.textContent = 'Unfollow';
          button.style.backgroundColor = '#ccc';
          button.style.color = 'black';
        }, error => {
          console.error('Error following user:', error);
        });
    } else {
      this.followService.unfollowUser(this.currentUserId, userId) // Pass both userIds to unfollowUser method
        .subscribe(() => {
          // Remove the unfollowed user from the UI
          this.followingUsers = this.followingUsers.filter(user => user.id !== userId);
          button.textContent = 'Follow';
          button.style.backgroundColor = 'rgb(0, 132, 255)';
          button.style.color = 'white';
        }, error => {
          console.error('Error unfollowing user:', error);
        });
    }
  }
  
  isFollowing(userId: string): boolean {
    const currentUser = this.UserInterfaces[0];
    if (currentUser && currentUser.following) {
      return currentUser.following.includes(userId);
    }
    return false;
  }
}
