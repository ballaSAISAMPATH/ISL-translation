import { model, Schema } from "mongoose";

const historySchema = new Schema({
      user_id:{type:String, required:true},
      type:{type:String, required:true, enum:['text-to-isl', 'isl-to-text']},
      phrase:{type:String, required:true},
      time:{type:Date, default:Date.now}
})

const history = model("History",historySchema);
export default history;