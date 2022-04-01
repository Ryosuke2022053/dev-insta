import React, {useEffect} from 'react';
// コンポーネントとcssを一対一に対応することができる
import styles from './App.module.css';
import { useSelector, useDispatch } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";
import Core from './components/core/Core';
import Auth from './components/Auth';

const App:React.FC = () => {
  // userSliceのuserステートを参照したいので、カスタムの関数を呼び出す
  const user = useSelector(selectUser)
  // ログインとログアウトをdispacthする
  const dispatch = useDispatch();

  useEffect(() => {
    // firebaseのauthのもの（firebaseのユーザーに何らかの変化があった場合に毎回呼び出される（ログイン、ログアウト、userchangeなど））
    const unSub = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // authUserで受けた情報をuserstateの内容に情報をアップデートする
        dispatch(
          // 実行
          login({
            // firebaseにあるuid
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
        // authユーザーが存在しない場合
      } else {
        dispatch(logout());
      }
    });
    // クリーンアップ関数(２回目のレンダリング時に前回の副作用を取り除く)
    return () => {
      unSub();
    };
  }, [dispatch]);
  return (
    <>
    {/* // ユーザーのIDが存在する時 */}
      {user.uid ? (
        <div className={styles.app}>
          <Core />
        </div>
      ) : (
        <Auth />
      )}
    </>
  )
}

export default App
