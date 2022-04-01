import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

// createslice reducer関数とaction creatorを含むオブジェクト
// アクションがどのように状態を変更するかを「Reducer」で行う



// 追加した表示名と画像をコンポーネントするために型を作る
interface USER {
  displayName: string;
  photoUrl: string;
}

export const userSlice = createSlice({
  // 今回扱いたい形（id, url, name）
  name: "user",
  // store.tsで使いたい型を定義
  initialState: {
    openNewPost: false,
    user: { uid: "", photoUrl: "", displayName: "" },
  },
  reducers: {
    // アプリの状態を書き換えることが唯一できるもの
    // ログイン（firebaseから取得したユーザーの情報をactionのpayloadに格納する）stateに格納するするので更新される
    login: (state, action) => {
    // firebaseから得た情報をstateに反映させる
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = { uid: "", photoUrl: "", displayName: "" };
    },
    // アップデート用のアクション
    // reactのコンポーネントからdispatchするときに受け取る
    updateUserProfile: (state, action: PayloadAction<USER>) => {
      // initailStateに更新していく
      state.user.displayName = action.payload.displayName;
      state.user.photoUrl = action.payload.photoUrl;
    },
    setOpenNewPost(state) {
        state.openNewPost = true;
    },
    resetOpenNewPost(state) {
        state.openNewPost = false;
    },
  },
});

export const { login, logout, updateUserProfile, resetOpenNewPost, setOpenNewPost } = userSlice.actions;

// reduxのstoreのstateをreactのコンポーネントから参照する時にuseSelecterを使って参照するそのときに指定する関数
// ユーザーのstateを返してくれるもの
export const selectUser = (state: RootState) => state.user.user;

export const selectOpenNewPost = (state: RootState) => state.user.openNewPost;

export default userSlice.reducer;