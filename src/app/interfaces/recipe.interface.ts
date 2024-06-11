import { comment } from "./comment.interface"
import { Rate } from "./Rate"

export interface recipe {

    id?: string,
    name?: string,
    photoUrl?: string,
    Nutritional_benefits?:string,
    ingredients?:string,
    preparation_steps?:string
    liked: string
    type:string
    Cuisine:string
    Cooking_time:string
    uid:string
    comments?: comment[];
    likes:string[];
    rates?:Rate[]
    

    
}