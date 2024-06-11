import { comment } from "../app/interfaces/comment.interface";

export interface UserInterface
{
    email: string;
    username: string;
    id: string;
    favourites?: string[] ;
    following?:string[];
    followers?:string[];
    userphoto?:string;
    isFollowed?: boolean;
    isFollowing?: boolean;
    likes?: string[];   
    comments?: comment[]; 
 
}