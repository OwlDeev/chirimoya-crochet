import { db, auth, googleProvider } from "../../config/firebase-config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import MlProfile from "./ml-profile";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import "./ml-login.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface MlLoginProps {
  media: any;
}

const MlLogin: React.FC<MlLoginProps> = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // Hook de React Router para la navegación
  const [password, setPassword] = useState("");
  const [userActive, setUserActive] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // El usuario está registrado
        console.log("ID del Usuario:", user.uid);
        console.log("Email del Usuario:", user.email);
        setUserActive(user);
      } else {
        // No hay un usuario en sesión
        console.log("No hay usuario activo");
        setUserActive(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const createUser = async () => {
    navigate("/create-account"); // Redirige al usuario a la página de login
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "A problem occurred while logging in ",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Iniciar sesión con Google
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Referencia al documento del usuario en Firestore
      const userDocRef = doc(db, "user", user.uid);

      // Comprobar si el documento ya existe
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Si no existe, crear el documento
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          fullname: user.displayName || "", // Usa el nombre de Google si está disponible
          phone: user.phoneNumber || "", // Asegúrate de que no sea null
        });

        console.log("Documento de usuario creado en Firestore.");
      } else {
        console.log(
          "El documento del usuario ya existe. No se creó uno nuevo."
        );
      }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <>
      {userActive ? (
        <div className="div-login-main-profile">
          <MlProfile
            EmailAddress={userActive.email}
            fullName={userActive.displayName}
            photoURL={userActive.photoURL}
          ></MlProfile>
        </div>
      ) : (
        <div className="div-login-main">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault(); // Evita que el formulario se envíe
                signIn();
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Password
                  </label>
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
              <div className="div-google-login">
                <img
                  src="/assets/imgs/swg.jpg"
                  alt="Login width Google"
                  className="img-responsive"
                  onClick={signInWithGoogle}
                />
              </div>
            </form>
            <p className="mt-10 text-center text-xl text-gray-500">
              Not a member?{" "}
              <a
                href="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
                onClick={createUser}
              >
                Create account
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default MlLogin;
