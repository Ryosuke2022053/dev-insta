import React, { useState } from 'react'
import { storage, db, auth } from "../../firebase";
// timestampを取得するため
import firebase from "firebase/app";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { AppDispatch } from "../../app/store";
import Modal from "react-modal";
import styles from "./Core.module.css";
import {
  setOpenNewPost,
  resetOpenNewPost,
  selectOpenNewPost
} from '../../features/userSlice';

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";

const customStyles = {
  content: {
    top: "55%",
    left: "50%",

    width: 280,
    height: 220,
    padding: "50px",

    transform: "translate(-50%, -50%)",
  },
};

const NewPost: React.FC = () => {
    const user = useSelector(selectUser);
    const dispatch: AppDispatch = useDispatch();
    const openNewPost = useSelector(selectOpenNewPost);
    // 初期値をnullとする
    const [tweetImage, setTweetImage] = useState<File | null>(null);
    const [tweetMsg, setTweetMsg] = useState("");

    // 選択された画像のオブジェクトを取得する
    const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        // １つの画像を選択 !を外すとnullの場合もあるのでエラーとなる
        if (e.target.files![0]) {
          setTweetImage(e.target.files![0]);
          e.target.value = "";
        }
      };

    const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
        // submitで実行したいがブラウザがリフレッシュされてしまうのでそれを防ぐ
        e.preventDefault();
        // もし画像があれば
        if (tweetImage) {
          // ランダムでファイルネームを作成する
          const S =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          const N = 16;
          const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
            .map((n) => S[n % S.length])
            .join("");
          const fileName = randomChar + "_" + tweetImage.name;
          
          // strageにファイルデータを保存していく(putでファイルオブジェクトを指定)
          const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImage);
          // strageになんらなかの変化があった場合に実行される後処理
          uploadTweetImg.on(
            // 
            firebase.storage.TaskEvent.STATE_CHANGED,
            // 進捗に関しての関数
            () => {},
            // エラーハンドリング（エラーを検知した場合にアラートで知らせる）
            (err) => {
              alert(err.message);
            },
            // 正常終了した場合（アップロードした画像のURLを取得→URLを使ってcouldのfirestoreに投稿データをアップロード）
            async () => {
              await storage
                .ref("images")
                .child(fileName)
                .getDownloadURL()
                .then(async (url) => {
                  await db.collection("posts").add({
                    uid:user.uid,
                    avatar: user.photoUrl,
                    image: url,
                    text: tweetMsg,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    username: user.displayName,
                  });
                });
            }
          );
          // 画像がなければ文字だけ
        } else {
            // データベース
          db.collection("posts").add({
            uid:user.uid,
            // オブジェクトとして追加して管理する属性
            avatar: user.photoUrl,
            image: "",
            // stateの内容をあてる
            text: tweetMsg,
            // firebaseのサーバータイムスタンプ
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            // ログインしているdisplayname
            username: user.displayName,
          });
        }
        setTweetImage(null);
        setTweetMsg("");
        dispatch(resetOpenNewPost());
      };

    return (
        <>
          <Modal 
            isOpen={openNewPost}
            onRequestClose={async () => {
              await dispatch(resetOpenNewPost());
            }} 
            style={customStyles}>
          <form className={styles.core_signUp} onSubmit={sendTweet}>
            <h1 className={styles.core_title}>insta clone</h1>
            <br />
            <TextField
              placeholder="Please enter caption"
              type="text"
              onChange={(e) => setTweetMsg(e.target.value)}
            />

            {/* <input
              type="file"
              id="imageInput"
              hidden={true}
              onChange={onChangeImageHandler}
            /> */}
            <br />
            <IconButton>
                <label>
                    <AddAPhotoIcon
                        // className={
                        // tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                        // }
                    />
                    <input
                        className={styles.tweet_hiddenIcon}
                        type="file"
                        hidden={true}
                        onChange={onChangeImageHandler}
                    />
                </label>
            </IconButton>
            <br />
            <Button
              type='submit'
              disabled={!tweetMsg || !tweetImage}
              variant="contained"
              color="primary"
            >
              New post
            </Button>
          </form>
        </Modal>
        </>
    )
}

export default NewPost
