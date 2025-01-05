import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import "./ml-navbar.css";
import { useCart } from "../context/cart-context";
import { FaHouse } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { FaStore } from "react-icons/fa";
import { auth, db } from "../../config/firebase-config";
import {
  doc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const MlNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleCart, productCount } = useCart(); // Usa el contexto para controlar el carrito
  const [itemCar, setItemCar] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // Estado para guardar el usuario actual
  const [nameUser, setNameUser] = useState("");

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación del usuario
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setCurrentUser(user); // Guardar el usuario autenticado
      } else {
        setCurrentUser(null); // No hay usuario autenticado
        // Obtener los productos desde el localStorage
        const cart =
          JSON.parse(localStorage.getItem("guestCart") || "[]") || [];

        // Contar los productos
        const productCount = cart.length;
        setItemCar(productCount);
      }
    });

    return () => unsubscribeAuth(); // Limpiar el listener al desmontar el componente
  }, []);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación del usuario
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (!user) {
        setItemCar(productCount);
      }
    });
    return () => unsubscribeAuth(); // Limpiar el listener al desmontar el componente
  }, [productCount]);

  useEffect(() => {
    const fetchCartItems = () => {
      // Obtener el usuario actual
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("Usuario no autenticado.");

        // Obtener los productos desde el localStorage
        const cart =
          JSON.parse(localStorage.getItem("guestCart") || "[]") || [];

        // Contar los productos
        const productCount = cart.length;
        setItemCar(productCount);
        return;
      }

      const cartRef = doc(db, "carts", currentUser.uid); // Referencia al documento del carrito del usuario

      const fetchUserFullname = async () => {
        const uid = currentUser.uid; // Reemplaza con el UID del usuario que quieras buscar
        const fullname = await getFullNameByUid(uid);
        if (fullname) {
          setNameUser(fullname);
        } else {
          setNameUser("");
        }
      };

      fetchUserFullname();

      // Suscribirse a los cambios en tiempo real del documento del carrito
      const unsubscribe = onSnapshot(cartRef, (docSnap) => {
        if (docSnap.exists()) {
          const cartData = docSnap.data();
          const items = cartData.items || []; // Asegúrate de que sea un array

          // Sumar la cantidad total de ítems en el carrito
          const totalQuantity = items.reduce(
            (total: any, item: any) => total + item.quantity,
            0
          );

          setItemCar(totalQuantity); // Actualizar el estado con la cantidad total
        } else {
          console.log("El carrito no existe.");
        }
      });

      // Limpiar la suscripción al desmontar el componente
      return () => unsubscribe();
    };

    fetchCartItems();
  }, [currentUser]); // Solo se ejecuta al montar el componente

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const getFullNameByUid = async (uid: string) => {
    try {
      // Referencia a la colección 'user'
      const userCollectionRef = collection(db, "user");

      // Crear una consulta para buscar por uid
      const q = query(userCollectionRef, where("uid", "==", uid));

      // Ejecutar la consulta
      const querySnapshot = await getDocs(q);

      // Verificar si hay documentos en el resultado
      if (!querySnapshot.empty) {
        // Obtener el fullname del primer documento
        const userDoc = querySnapshot.docs[0];
        const { fullname } = userDoc.data();
        return fullname; // Retorna el fullname
      } else {
        console.log("No se encontró ningún usuario con el uid proporcionado.");
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo el fullname:", error);
      throw error;
    }
  };

  return (
    <div className="flex w-full">
      <header>
        {/* <!-- lg+ (Escritorio) --> */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 mx-auto sm:px-6 lg:px-8">
            <nav className="relative flex items-center justify-between h-16 lg:h-20">
              {/* Menú de escritorio */}
              <div className="hidden lg:flex lg:items-center lg:space-x-10">
                <Link
                  to="/login"
                  className="whitespace-nowrap text-base font-medium text-white cursor-pointer items-center button-cart"
                >
                  {currentUser ? nameUser : "LOGIN"}
                  <FaUser className="iconNavbar" />
                </Link>

                <Link
                  to="/home"
                  className="h-full w-full text-base font-medium text-white cursor-pointer items-center button-cart"
                >
                  HOME
                  <FaHouse className="iconNavbar" />
                </Link>
              </div>

              {/* Logo */}
              <div className="lg:absolute lg:-translate-x-1/2 lg:inset-y-5 lg:left-1/2">
                <div className="flex-shrink-0">
                  <Link to="/home" className="flex">
                    <img
                      className="imagenLogo"
                      src={`${process.env.PUBLIC_URL}/assets/imgs/logo2.png`}
                      alt="Logo"
                    />
                  </Link>
                </div>
              </div>

              {/* Menú de escritorio y carrito */}
              <div className="hidden lg:flex lg:items-center lg:space-x-10">
                <Link
                  to="/boutique"
                  className="text-base font-medium text-white cursor-pointer items-center button-cart"
                >
                  STORE
                  <FaStore className="iconNavbar" />
                </Link>

                {/* Icono del carrito */}
                <div
                  onClick={toggleCart}
                  className="cursor-pointer flex items-center button-cart"
                >
                  <span className="text-base font-medium text-white">CART</span>
                  <FaCartShopping className="iconNavbar"></FaCartShopping>
                  <span className="text-base font-medium text-white pl-2">
                    {itemCar}
                  </span>
                </div>
              </div>

              {/* Ícono de hamburguesa para móvil */}
              <div className="lg:hidden flex items-center">
                <div className="hamburger-icon" onClick={toggleMenu}>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className="bg-white lg:hidden">
            <nav className="px-4 py-4 mx-auto sm:px-6 lg:px-8">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/boutique"
                  className="py-2 text-base font-medium text-black"
                >
                  Store
                </Link>
                <Link
                  to="/home"
                  className="py-2 text-base font-medium text-black"
                >
                  Home
                </Link>

                <div
                  onClick={toggleCart}
                  className="cursor-pointer flex items-center button-cart"
                >
                  <span className="text-base font-medium text-white">CART</span>
                  <FaCartShopping className="iconNavbar"></FaCartShopping>
                  <span className="text-base font-medium text-white pl-2">
                    {itemCar}
                  </span>
                </div>
              </div>
              <hr className="my-4 border-gray-200" />
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="py-2 text-base font-medium text-black"
                >
                  Sign in
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
};

export default MlNavbar;
