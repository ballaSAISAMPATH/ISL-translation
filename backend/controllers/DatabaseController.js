import mongoose from "mongoose";
import History from "../models/History.js";
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI)

export const text_to_isl_store = async (req,res)=>{
      try{
            console.log(req.body);
            
            console.log(req.body.user_id, req.body.phrase);
            
            const response = await History.create({user_id:req.body.user_id,type:'text-to-isl',phrase:req.body.phrase});
            console.log(response);
            
            res.json({success:true,message:"History stored successfully"});     
      }
      catch(err){
            res.json({success:false,error:"Server error"});
      }
}

export const isl_to_text_store = async (req,res)=>{
       try{
            console.log(req.body);
            
            console.log(req.body.user_id, req.body.phrase);
            
            const response = await History.create({user_id:req.body.user_id,type:'isl-to-text',phrase:req.body.phrase});
            console.log(response);
            
            res.json({success:true,message:"History stored successfully"});     
      }
      catch(err){
            res.json({success:false,error:"Server error"});
      }
}

export const get_history = async (req,res)=>{
      try{
            const response = await History.find({user_id:req.body.user_id}).sort({time:-1});
            res.json({success:true,history:response});
      }
      catch(err){
            res.json({success:false,error:"Server error"});
      }
}