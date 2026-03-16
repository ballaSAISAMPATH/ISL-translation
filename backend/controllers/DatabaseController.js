import mongoose from "mongoose";
import History from "../models/History.js";
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI)

export const text_to_isl_store = async (req,res)=>{
      try{

            const response = await History.create({user_id:req.body.user_id,type:'text-to-isl',phrase:req.body.phrase});
            res.json({success:true,message:"History stored successfully"});     
      }
      catch(err){
            res.json({success:false,error:"Server error"});
      }
}