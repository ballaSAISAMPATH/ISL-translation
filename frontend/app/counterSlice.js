import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    user_email:'none',
    user_id:'',
    user_name:'',
    
  },
  reducers: {
    setUserDetails: (state,payload) => {
      console.log(payload);
      state.user_email = payload.payload.email;
      state.user_name = payload.payload.name;
      state.user_id = payload.payload.user_id;      
    },
    
  },
})

export const { setUserDetails } = counterSlice.actions

export default counterSlice.reducer