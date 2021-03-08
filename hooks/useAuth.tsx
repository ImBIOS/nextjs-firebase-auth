import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { auth, db } from "config/firebase";
import { User } from '@firebase/auth-types';
const authContext = createContext({ user: {} });
const { Provider } = authContext;
export function AuthProvider(props: { children: ReactNode }): JSX.Element {
  const auth = useAuthProvider();
  return <Provider value={auth}>{props.children}</Provider>;
}
export const useAuth: any = () => {
  return useContext(authContext);
};
// Provider hook that creates an auth object and handles it's state
const useAuthProvider = () => {
  const [user, setUser] = useState(null);
  const createUser = (user) => {
    return db
      .collection("users")
      .doc(user.uid)
      .set(user)
      .then(() => {
        setUser(user);
        return user;
      })
      .catch((error) => {
        return { error };
      });
  };
  const signUp = ({ name, email, password }) => {
    return auth
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        auth.currentUser.sendEmailVerification();
        return createUser({ uid: response.user.uid, email, name });
      })
      .catch((error) => {
        return { error };
      });
  };

  const signIn = ({ email, password }) => {
    return auth
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        setUser(response.user);
        getUserAdditionalData(user);
        return response.user;
      })
      .catch((error) => {
        return { error };
      });
  };

  const signOut = () => {
    return auth.signOut().then(() => setUser(false));
  };

  const getUserAdditionalData = (user: User) => {
    return db
      .collection("users")
      .doc(user.uid)
      .get()
      .then((userData) => {
        if (userData.data()) {
          setUser(userData.data());
        }
      });
  };

  const sendPasswordResetEmail = (email) => {
    return auth.sendPasswordResetEmail(email).then((response) => {
      return response;
    });
  };

  useEffect(() => {
    if (user?.uid) {
      // Subscribe to user document on mount
      const unsubscribe = db
        .collection("users")
        .doc(user.uid)
        .onSnapshot((doc) => setUser(doc.data()));
      return () => unsubscribe();
    }
  }, []);

  return {
    user,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
  };
};
