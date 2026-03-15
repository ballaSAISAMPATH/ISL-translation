import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    user_name:'none',
    
  },
  reducers: {
    setUserName: (state,payload) => {
      console.log(payload);
      
      state.user_name = payload
    },
    
  },
})

export const { setUserName } = counterSlice.actions

export default counterSlice.reducer