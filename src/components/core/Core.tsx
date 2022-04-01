import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { AppDispatch } from "../../app/store";
import { db, auth } from "../../firebase";
import { makeStyles } from "@material-ui/core/styles";
import { StylesContext } from '@material-ui/styles';
import {
  Button,
  Grid,
  Avatar,
  Badge,
  CircularProgress,
} from "@material-ui/core";

import styles from "./Core.module.css";
import NewPost from './NewPost';
import Post from '../post/Post'

import { MdAddAPhoto } from "react-icons/md";
import { setOpenNewPost } from '../../features/userSlice';

const WebButton = makeStyles({
  root:{
    textTransform: 'none',
  }
})

const Core: React.FC = () => {
  const user = useSelector(selectUser);
  const webbutton = WebButton();
  const dispatch: AppDispatch = useDispatch();
  // 投稿の際に必要になるもの
  const [posts, setPosts] = useState([
    {
      id: "",
      uid:"",
      avatar: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  const returnTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 最初の一度のみ実行される処理（posts_stateに送る）
  useEffect(() => {
      const unSub = db
      // コレクションの名前
        .collection("posts")
        // データの並び順（降順）
        .orderBy("timestamp", "desc")
        // データベースになんらかのデータが有る場合に走る処理
        .onSnapshot((snapshot) =>
          setPosts(
              // postsの中にあるドキュメントを全て取得
            snapshot.docs.map((doc) => ({
              id: doc.id,
              uid:doc.data().uid,
              avatar: doc.data().avatar,
              image: doc.data().image,
              text: doc.data().text,
              timestamp: doc.data().timestamp,
              username: doc.data().username,
            }))
          )
        );
      // クリーンアップ関数（アンマウントされるときの処理）
      return () => {
        unSub();
      };
    }, []);
  return (
    <div>
      <NewPost />
      <div className={styles.core_header}>
        <Button className={webbutton.root} onClick={returnTop}>
          <h1 className={styles.core_title}>insta clone</h1>
        </Button>
          <>
          {/* // 投稿ボタン（カメラアイコン） */}
            <button
              className={styles.core_btnModal}
              onClick={() => {
                dispatch(setOpenNewPost());
                
              }}
            >
              <MdAddAPhoto />
            </button>
            <div className={styles.core_logout}>
              <Button onClick={() => auth.signOut()}>
                Logout
              </Button>
              <button
                className={styles.core_btnModal}
                // ボタンがクリックされたときに編集用のモーダルが開くようにする
                onClick={() => {
                  // dispatch(setOpenProfile());
                  // dispatch(resetOpenNewPost());
                }}
              >
                {/* <StyledBadge
                  overlap="circle"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                > */}
                  <Avatar alt="who?" src={user.photoUrl} />{" "}
                {/* </StyledBadge> */}
              </button>
            </div>
          </>
      </div>
      {posts[0]?.id && (
                <>
                {posts.map((post) => (
                    <Post
                    // ユニークkey
                    key={post.id}
                    postId={post.id}
                    uid={post.uid}
                    avatar={post.avatar}
                    image={post.image}
                    text={post.text}
                    timestamp={post.timestamp}
                    username={post.username}
                    />
                ))}
                </>
            )}
    </div>
  )
}

export default Core