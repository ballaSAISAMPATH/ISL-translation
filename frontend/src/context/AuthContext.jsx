import axios from "axios"

export function useAuth() {

  function register(name, email, password){
    console.log(email);
  }

  return { register };
}