import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { usersEndpoints } from "../apis/usersEndpoints";
import { chatsEndpoints } from "../apis/chatsEndpoints";

import { User } from "../../types/userTypes";
import { Chat } from "../../types/chatTypes";
import { authEndpoints } from "../apis/authEndpoints";

interface AppState {
  user: User | null;
  chat: Chat | null;
}

const initialState: AppState = {
  user: null,
  chat: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setChat: {
      reducer: (state, action: PayloadAction<Chat | null>) => {
        state.chat = action.payload;
      },
      prepare: (chat: Chat | null) => ({ payload: chat }),
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(usersEndpoints.endpoints.registerUser.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addMatcher(usersEndpoints.endpoints.loginUser.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addMatcher(authEndpoints.endpoints.googleAuth.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addMatcher(authEndpoints.endpoints.githubAuth.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addMatcher(usersEndpoints.endpoints.authUser.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addMatcher(chatsEndpoints.endpoints.accessChat.matchFulfilled, (state, action) => {
        // accessChat returns an object with property "chat"
        state.chat = action.payload.chat;
      })
      .addMatcher(chatsEndpoints.endpoints.createGroupChat.matchFulfilled, (state, action) => {
        // createGroupChat returns an object with property "chat"
        state.chat = action.payload.chat;
      });
  },
});

export const { setUser, setChat } = appSlice.actions;

export default appSlice.reducer;
