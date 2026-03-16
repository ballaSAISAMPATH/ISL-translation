import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    user_email:localStorage.getItem("email") || '',
    user_id:localStorage.getItem("user_id") || '',
    user_name:localStorage.getItem("name") || '',
    
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