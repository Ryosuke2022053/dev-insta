import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { db } from "../../firebase";
import firebase from "firebase/app";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { AppDispatch } from "../../app/store";

import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Divider, Checkbox , Button} from "@material-ui/core";
import { Favorite, FavoriteBorder } from "@material-ui/icons";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import { boolean } from "yup";
import { applyMiddleware } from "@reduxjs/toolkit";

// propsのデータ型（feedから取れる投稿されたデータ全て）
interface PROPS {
    postId: string;
    uid:string;
    avatar: string;
    image: any;
    text: string;
    timestamp: any;
    username: string;
  }
  
interface COMMENT {
    id: string;
    avatar: string;
    text: string;
    timestamp: any;
    username: string;
  }

interface LIKE {
    id: string;
    uid: string;
    avatar: string;
    like:boolean,
    timestamp: any;
    username: string;
    updatedate: any;
  }
  
// コメントの中のアバターの画像を一回り小さくする
const useStyles = makeStyles((theme) => ({
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      marginRight: theme.spacing(1),
    },
  }));

const WebButton = makeStyles({
    root:{
      textTransform: 'none',
    }
  });
  
const Post: React.FC<PROPS> = (props) => {
  console.log(props);
    const classes = useStyles();
    const webbutton = WebButton();
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector(selectUser);
    // コメントが多くなったときに省略できるようにする
    const [openComments, setOpenComments] = useState(false);
    const [comment, setComment] = useState("");
    const [Like, setLike] = useState<boolean>(true);
    // firebaseから取得したコメント一覧（配列として）
    const [comments, setComments] = useState<COMMENT[]>([
      {
        id: "",
        avatar: "",
        text: "",
        username: "",
        timestamp: null,
      },
    ]);

    const [likes, setLikes] = useState<LIKE[]>([
      {
        id: "",
        uid:"",
        avatar: "",
        like:false,
        username: "",
        timestamp: null,
        updatedate: null,
      }
    ])
    // console.log(likes);
  
    // commentsに格納
    useEffect(() => {
      const unSub = db
      // firebaseのpostsの内容を全て取得
        .collection("posts")
        .doc(props.postId)
        // 内容を降順にコメントのオブジェクトを取得→Reactのcommentsに格納
        .collection("comments")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              avatar: doc.data().avatar,
              text: doc.data().text,
              username: doc.data().username,
              timestamp: doc.data().timestamp,
            }))
          );
        });
      return () => {
        unSub();
      };
      // 投稿が違う内容になった場合は再度実行
    }, [props.postId]);

    useEffect(() => {
      const unlike = db
        .collection("posts")
        .doc(props.postId)
        .collection("likes")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setLikes(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              uid:doc.data().uid,
              avatar: doc.data().avatar,
              like: doc.data().like,
              username: doc.data().username,
              timestamp: doc.data().timestamp,
              updatedate: doc.data().timestamp,
            }))
          );
        });
      return () => {
        unlike();
      };
    },[props.postId]);
  
    const newComment = (e: React.FormEvent<HTMLFormElement>) => {
      // リフレッシュを防ぐ
      e.preventDefault();
      // postsのコレクションのどの投稿に対するものかを指定（postIDを指定）→　commentsに追加していく
      db.collection("posts").doc(props.postId).collection("comments").add({
        avatar: user.photoUrl,
        text: comment,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
      // 初期化
      setComment("");
    };
    
    const decidelike = (e:any) => {
      let isoverlapped = false;
      likes.some((value) => {
      if (value.uid === user.uid ) {
        e.preventDefault();
        // postsのコレクションのどの投稿に対するものかを指定（postIDを指定）→　commentsに追加していく
        db.collection("posts").doc(props.postId).collection("likes").doc(value.id).update({
          like:Like,
          updatedate: firebase.firestore.FieldValue.serverTimestamp(),
        });
        // 初期化
        isoverlapped = true;
        console.log(Like);
        if (Like === true) {
          setLike(false);
        } else {
          setLike(true);
        }
      }
      })
      if (!isoverlapped) {
        e.preventDefault();
        // postsのコレクションのどの投稿に対するものかを指定（postIDを指定）→　commentsに追加していく
        db.collection("posts").doc(props.postId).collection("likes").add({
          uid:user.uid,
          avatar: user.photoUrl,
          like:Like,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          username: user.displayName,
          updatedate: firebase.firestore.FieldValue.serverTimestamp(),
        });
        // 初期化
        console.log(Like);
        if (Like === true) {
          setLike(false);
        } else {
          setLike(true);
        }
      }
    }

    return (
      <div className={styles.post}>
        <div className={styles.post_header}>
        {/* // 投稿したユーザーのプロフィール画像とニックネーム取得 */}
          <Avatar className={styles.post_avatar} src={props.avatar} />
          <Button className={webbutton.root}>
            <h3>{props.username}</h3>
          </Button>
        </div>
        {/* 実際に投稿された画像 */}
        <img className={styles.post_image} src={props.image} alt="" />

        <h4 className={styles.post_text}>
            {/* いいねのチェックボックス */}
          <Checkbox
            className={styles.post_checkBox}
            icon={ <FavoriteBorder />}
            checkedIcon={<Favorite />}
            // onClick={() => 
            //   Like ? setLike(false) : setLike(true)}
            // onChange={decidelike}
            onClick={decidelike}
            
            // ログインしているユーザーと同じときにチェックボタンを有効にする
            checked={likes.some((liked) => liked.like && liked.uid === user.uid)}
          />
          {/* ニックネームを表示 */}
          {/* <strong> {props.username}</strong> */}
            {props.text}
          <AvatarGroup max={7} >
              {/* likedに入っているユーザーのアバター画像を全て表示 */}
              {likes.map((like) => 
              like.like &&
              <Avatar
                src={
                  like.avatar
                }
                key = {like.id}
                className={styles.post_avatarGroup}
              />
              )}
          </AvatarGroup>
        </h4>

        {/* // コメントの一覧を表示 */}
        <Divider />
        <div className={styles.post_comments}>
            {/* commentsOnPostに投稿されたコメントが全て入っているのでmapで一つ一つ取り出す */}
          {comments.map((com) => (
            <div key={com.id} className={styles.post_comment}>
              <Avatar
                src={com.avatar}
                className={classes.small}
              />
              <p>
                <strong className={styles.post_strong}>
                    {com.username}
                </strong>
                {com.text}
              </p>
            </div>
          ))}
        </div>

        {/* // 投稿フォーム */}
        <form className={styles.post_commentBox} onSubmit={newComment}>
          <input
            className={styles.post_input}
            type="text"
            placeholder="add a comment"
            value={comment}
            // ユーザーがなにか書くたびにsetTextを呼び出す（text stateを書き換える）
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setComment(e.target.value)
            }
          />
          <button
            // なにも書かれていないときは投稿できないようにする
            disabled={!comment}
            className={styles.post_button}
            type="submit"
            // postCommentを呼び出す
            // onClick={postComment}
          >
            Post
          </button>
        </form>
      </div>
    );
  };
  
export default Post;