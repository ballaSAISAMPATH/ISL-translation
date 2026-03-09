import axios from "axios"

export function useAuth() {

  async function register(name, email, password){
    console.log(email);
    const response = await axios.post('http://localhost:4000/auth/register', {name,email,password});
    console.log(response);
    
  }

  async function login(email,password){
      const response = await axios.post('http://localhost:4000/auth/login', {email,password});
      console.log(response);
  }

  return {register,login};
}