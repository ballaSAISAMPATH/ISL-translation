import axios from "axios"
import {useSelector, useDispatch} from 'react-redux'
import { setUserDetails } from "../../app/counterSlice";
export function useAuth() {
  const dispatch = useDispatch();
  async function register(name,email,password){
    try{
      const response = await axios.post(
        "http://localhost:4000/auth/register",
        {name,email,password}
      );

      if(response.data.userExists){
        return {success:false,error:"User already exists"};
      }

      return {success:true,message:"Registration successful"};

    }catch(err){
      return {success:false,error:"Server error"};
    }
  }

  async function login(email,password){
    try{
      const response = await axios.post(
        "http://localhost:4000/auth/login",
        {email,password}
      );

      const data = response.data;
      console.log(data);
      
      if(!data.userExists){
        return {success:false,error:"User not found"};
      }

      if(!data.password_matched){
        return {success:false,error:"Incorrect password"};
      }

      // store token
      localStorage.setItem("token",data.token);
      // localStorage.setItem("user",JSON.stringify({
      //   name:data.name,
      //   email:data.email,
      //   user_id:data.user_id
      // }));
      dispatch(setUserDetails(
        {name:data.name,
        email:data.email,
        user_id:data.user_id}
    ))
      return {success:true}
    }catch(err){
      console.log(err);
      return {success:false,error:"Server error"};
    }
  }
  async function logout(){
    localStorage.setItem("token",'')
    dispatch(setUserDetails(
        {name:'',
        email:'',
        user_id:'',}
    ))
  }
  return {register,login,logout};
}