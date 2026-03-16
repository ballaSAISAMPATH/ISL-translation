import jwt from 'jsonwebtoken';     
import dotenv from 'dotenv';
import mongoose, { mongo } from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcrypt'
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
export const register = async (req,res)=>{
      console.log(req.body);
      const response = await User.findOne({email:req.body.email});
      if (response){
            return res.status(200).json({userExists:true});
      }
      else {
            const saltRounds = 10;
            const hashedpassword = await bcrypt.hash(req.body.password,saltRounds)
            const user = await User.create({name:req.body.name,email:req.body.email,password:hashedpassword});
            return res.status(200).json({userExists:false});
      }     
      
}

export const login = async (req,res)=>{
      const user = await User.findOne({email:req.body.email});
      if(!user){
            return res.json({userExists:false});
      }
      const result = await bcrypt.compare(req.body.password,user.password);
      if(!result){
            return res.json({userExists:true,password_matched:false});
      }
      const token =jwt.sign({email:req.body.email},process.env.JWT_SECRET,{expiresIn:'1h'});
      return res.json({userExists:true,password_matched:true,token,name:user.name,email:user.email,user_id:user._id});
}

export const verify = async (req,res)=>{
      try{
            
            const decoded =jwt.verify(req.body.token,process.env.JWT_SECRET);
            console.log(decoded);            
            
            if (req.body.email==decoded.email){
                  return res.json({tokenExpired:false, userMatched: true})
            }
            else{
                  return res.json({tokenExpired:false, userMatched: false})
                  
            }
      }
      catch(err){
            return res.json({tokenExpired:true})
      }
      
}