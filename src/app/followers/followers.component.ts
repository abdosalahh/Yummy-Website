import { Component, OnInit } from '@angular/core';
import { FollowServiceService } from '../services/follow-service.service';
import { UserInterface } from '../../services/user_interface';
import { onAuthStateChanged, getAuth } from '@angular/fire/auth';
import { RecipesService } from '../services/recipes.service';
import { recipe } from '../interfaces/recipe.interface';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.css'] 
})
export class FollowersComponent implements OnInit {
  followerUsers: UserInterface[] = [];
  currentUserId: string | null = null;
  UserInterfaces: UserInterface[] = [];
  UserInterfaces2: UserInterface[] = [];
  current_user: UserInterface | undefined;
  uid:string='';
  recipes: recipe[]=[];

  constructor(private followService: FollowServiceService , private rs: RecipesService) {}

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
              this.getFollowers();
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

  getFollowers(): void {
    if (!this.currentUserId) {
      console.error('Current user ID is null');
      return;
    }

    this.followService.setCurrentUserId(this.currentUserId);
    this.followService.getFollowers().subscribe((followerUsers: UserInterface[]) => {
      this.followerUsers = followerUsers || []; // Ensure followerUsers is initialized
    });
  }

  toggleFollow(userIdToFollow: string, event: MouseEvent): void {
    if (!this.currentUserId) {
      console.error('Current user ID is null');
      return;
    }
  
    const button = event.target as HTMLButtonElement;
    if (!button || button.tagName !== 'BUTTON') {
      console.error('Button element not found');
      return;
    }
  
    const isFollowingUser = this.isFollowing(userIdToFollow);
  
    if (isFollowingUser) {
      // Unfollow the user
      this.followService.unfollowUser(this.currentUserId, userIdToFollow)
        .subscribe(() => {
          button.textContent = 'Follow';
          button.classList.remove('solid-btn');
          button.classList.add('outline-btn');
          // Update the followerUsers list in UI
          this.followerUsers = this.followerUsers.filter(user => user.id !== userIdToFollow);
        }, error => {
          console.error('Error unfollowing user:', error);
        });
    } else {
      // Follow the user
      this.followService.followUser(this.currentUserId, userIdToFollow)
        .subscribe(() => {
          button.textContent = 'Unfollow';
          button.classList.remove('outline-btn');
          button.classList.add('solid-btn');
        }, error => {
          console.error('Error following user:', error);
        });
    }
  }
  

  isFollower(userId: string): boolean {
    return this.followerUsers.some(user => user.id === userId);
  }

  isFollowing(userId: string): boolean {
    const currentUser = this.UserInterfaces[0];
    if (currentUser && currentUser.following) {
      return currentUser.following.includes(userId);
    }
    return false;
  }

  updateButtonStatus(): void {
    this.followerUsers.forEach(follower => {
        const isFollowingFollower = this.UserInterfaces[0]?.following?.includes(follower.id);
        if (isFollowingFollower) {
            const index = this.followerUsers.findIndex(user => user.id === follower.id);
            if (index !== -1) {
                this.followerUsers[index].isFollowing = true;
            }
        }
    });
  }
}