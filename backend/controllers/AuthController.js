import jwt from 'jsonwebtoken';     
import dotenv from 'dotenv';
dotenv.config();

export const createAccessToken = (req,res)=>{
      console.log(req.body);
      
}