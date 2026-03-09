import axios from "axios"

export function useAuth() {

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

      if(!data.userExists){
        return {success:false,error:"User not found"};
      }

      if(!data.password_matched){
        return {success:false,error:"Incorrect password"};
      }

      // store token
      localStorage.setItem("token",data.token);
      localStorage.setItem("user",JSON.stringify({
        name:data.name,
        email:data.email,
        user_id:data.user_id
      }));

      return {
        success:true,
        token:data.token,
        name:data.name,
        email:data.email
      };

    }catch(err){
      return {success:false,error:"Server error"};
    }
  }

  return {register,login};
}