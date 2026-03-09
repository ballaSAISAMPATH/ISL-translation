import { Schema,model } from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const userSchema =  new Schema({
      name : {type:String, required:true},
      email : {type:String, required:true, unique:true},
      password : {type:String, required:true}
})

const User =  model("User",userSchema);
export default User;
