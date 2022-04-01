import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../features/userSlice";
import styles from "./Auth.module.css";
import { auth, provider, storage } from "../firebase";

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Grid,
  Typography,
  makeStyles,
  Modal,
  IconButton,
  Box,
} from "@material-ui/core";

import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      // カード自体が画面の真ん中に表示されるようにする
      transform: `translate(-${top}%, -${left}%)`,
    };
  }


const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  modal: {
    outline: "none",
    position: "absolute",
    width: 400,
    borderRadius: 10,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  },
  image: {
    backgroundImage: 'url(https://images.unsplash.com/photo-1646324764398-8f0164497aa8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=715&q=80)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Auth: React.FC = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  // アバター画像
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  // ログインしているのかしていないのかの確認
  const [isLogin, setIsLogin] = useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [resetEmail, setResetEmail] = useState("");


  // 選択されたファイルのオブジェクトを取得する
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      // １つの画像を選択 !を外すとnullの場合もあるのでエラーとなる
    if (e.target.files![0]) {
      // useStateの更新
      setAvatarImage(e.target.files![0]);
      // 初期化
      e.target.value = "";
    }
  };

  // パスワード忘れた場合の処理
  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
      // firebaseのauthモジュールにあるもの
    await auth
    // リセットしたいemailの内容を入れる
      .sendPasswordResetEmail(resetEmail)
      .then(() => {
        setOpenModal(false);
        // 空の文字列で初期化
        setResetEmail("");
      })
      .catch((err) => {
        alert(err.message);
        setResetEmail("");
      });
  };

  // firebaseのsigninモジュールの機能
  const signInEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password);
  };
  
  const signUpEmail = async () => {
    // 代入できるようにする
    const authUser = await auth.createUserWithEmailAndPassword(email, password);
    // ここからfirebaseのstorageに画像を保存していく
    // 画像データがどこにあるかを識別
    let url = "";
    if (avatarImage) {
      // ランダムでファイル名を作成する用
      // ランダムで文字を作る候補
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      // 生成したいランダムな文字数
      const N = 16;
      // 乱数を生成する
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + avatarImage.name;
      // 画像ファイルを格納していく（storageにアップロード）
      await storage.ref(`avatars/${fileName}`).put(avatarImage);
      // 先程格納したファイルのURLがどこにあるかを取得
      url = await storage.ref("avatars").child(fileName).getDownloadURL();
    }
    // display nameとフォトURLを更新していく
    await authUser.user?.updateProfile({
      displayName: username,
      photoURL: url,
    });
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  // 非同期関数(終わるまで待ってくれる)
  const signInGoogle = async () => {
      // firebase.tsのproviderのgoogleのサインインを表示する
    await auth.signInWithPopup(provider).catch((err) => alert(err.message));
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
          {isLogin ? "Login" : "Register"}
          </Typography>
          <form className={classes.form} noValidate>
          {/* // レジスターモードのときだけじっこうされるもの */}
          {!isLogin && (
              <>
              {/* usernameの内容 */}
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  // ユーザーがタイピングするたびに更新
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                  }}
                />
                {/* // アバター画像の設定 */}
                <Box textAlign="center">
                  <IconButton>
                      {/* // ラベルで囲うことでアイコンを押したときにinputのファイルのダイアログが起動する */}
                    <label>
                      <AccountCircleIcon
                        fontSize="large"
                        className={
                            // 選択している場合と選択していない場合でアイコンの色を変える
                          avatarImage
                            ? styles.login_addIconLoaded
                            : styles.login_addIcon
                        }
                      />
                      <input
                        className={styles.login_hiddenIcon}
                        type="file"
                        // ファイルを選択する関数
                        onChange={onChangeImageHandler}
                      />
                    </label>
                  </IconButton>
                </Box>
              </>
            )}
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              // ユーザーがタイピングした内容をその都度useStateに反映する
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value)
                }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              // パスワードもタイピングした内容がuseStateに反映される
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
            />

            <Button
              disabled={
                isLogin
                // ログインモード＝＞emailがない場合、パスワードが６文字以上ではない時
                  ? !email || password.length < 6
                // どれか１つでも空の場合は無効
                  : !username || !email || password.length < 6 || !avatarImage
              }
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              // emailアイコン
              startIcon={<EmailIcon />}
              onClick={
                isLogin
                // ログインモードで入ってきたときはsignInEmailを実行
                  ? async () => {
                      try {
                        await signInEmail();
                        // エラーの場合はエラーメッセージを表示
                      } catch (err:any) {
                        alert(err.message);
                      }
                    }
                    //　レジスターモードの場合
                  : async () => {
                      try {
                        await signUpEmail();
                      } catch (err:any) {
                        alert(err.message);
                      }
                    }
              }
            >
              {isLogin ? "Login" : "Register"}
            </Button>
            
            {/* // パスワードを忘れた場合の処理 */}
            <Grid container>
                {/* // xsにより等間隔に配置できる */}
                <Grid item xs>
                    <span
                    className={styles.login_reset}
                    // クリックしたときにモーダルが開くようになる
                    onClick={() => setOpenModal(true)}
                    >
                    Forgot password ?
                    </span>
                </Grid>
                <Grid item>
                    <span
                    className={styles.login_toggleMode}
                    // 登録していない場合はflaseにする
                    onClick={() => setIsLogin(!isLogin)}
                    >
                    {isLogin ? "Create new account ?" : "Back to login"}
                    </span>
                </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={signInGoogle}
              startIcon={<CameraIcon />}
            >
              SignIn with Google
            </Button>
          </form>

          {/* // モーダルが開く、閉まるはopenによる onClose<= 他の箇所を押すと閉じる */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <div style={getModalStyle()} className={classes.modal}>
              <div className={styles.login_modal}>
                  {/* //ユーザーがリセット用のemailを打てるように */}
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="email"
                  name="email"
                  label="Reset E-mail"
                  // useStateのreset
                  value={resetEmail}
                  //  リセットemailの内容を随時更新する
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value);
                  }}
                />
                <IconButton onClick={sendResetEmail}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Modal>
        </div>
      </Grid>
    </Grid>
  );
}

export default Auth;