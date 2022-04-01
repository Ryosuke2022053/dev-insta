// firebaseのimport
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";


// 環境変数の割当
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};


// 引数にパラメーターを設定　firebaseをイニシャライズする
const firebaseApp = firebase.initializeApp(firebaseConfig);


// エクスポートしとく(他のところで使えるようにする)
export const db = firebaseApp.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();


// googleの認証を使う
export const provider = new firebase.auth.GoogleAuthProvider();