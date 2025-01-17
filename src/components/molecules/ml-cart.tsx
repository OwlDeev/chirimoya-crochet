"use client";

import "./ml-cart.css";
import useState from "react-usestateref";
import { useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/cart-context"; // Importa el hook del contexto
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineShoppingCartCheckout } from "react-icons/md";

interface Product {
  id: string; // Identificador único del producto
  title: string; // Nombre del producto
  description: string; // Descripción del producto
  price: number; // Precio del producto
  quantity: number; // Cantidad del producto en el carrito
  srcImage: string; // URL de la imagen del producto
}

export default function Example() {
  const navigate = useNavigate(); // Hook de React Router para la navegación
  const [count, setCount] = useState(1);
  const { isCartOpen, closeCart, cart } = useCart(); // Usa el contexto para controlar la visibilidad del carrito
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario actual
  const [subTotal, setSubTotal] = useState(0);
  const [productList, setProductList, refProductList] = useState<
    {
      id: string;
      desc: string;
      href: number;
      description: string;
      title: string;
      price: number;
      srcImage: string;
      quantity: number;
    }[]
  >([]);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setCurrentUser(user); // Guardar el usuario autenticado
      } else {
        setCurrentUser(null); // Usuario no autenticado
      }
    });

    return () => unsubscribeAuth(); // Limpiar el listener al desmontar
  }, []);

  const getProductList = async () => {
    try {
      if (!currentUser) {
        // Obtener los productos desde localStorage
        const storedProducts = JSON.parse(
          localStorage.getItem("guestCart") || "[]"
        );

        // Agrupar los productos por ID y sumar sus cantidades
        const productMap = storedProducts.reduce((acc: any, item: any) => {
          if (acc[item.id]) {
            // Si el producto ya existe, sumar la cantidad
            acc[item.id].quantity += item.quantity;
          } else {
            // Si no existe, agregar al mapa
            acc[item.id] = { ...item };
          }
          return acc;
        }, {});

        // Convertir el mapa a un array y formatear los datos
        const formattedItems = Object.values(productMap).map((item: any) => ({
          id: String(item.id), // Convertir a string si es necesario
          desc: item.desc || "", // Valor predeterminado si no existe
          href: item.href || 0, // Valor predeterminado si no existe
          description: item.description || "",
          title: item.title || "",
          price: item.price || 0,
          quantity: item.quantity || 0,
          srcImage: item.srcImage || "",
        }));

        // Calcular el subtotal
        const totalSubTotal = formattedItems.reduce(
          (sum: any, item: any) => sum + item.price * item.quantity,
          0
        );

        // Actualizar el estado
        setSubTotal(totalSubTotal);
        setProductList(formattedItems);

        return; // Salir si no hay usuario autenticado
      } else {
        const cartRef = doc(db, "carts", currentUser["uid"] || ""); // Referencia al carrito del usuario

        // Suscribirse a cambios en tiempo real en el documento del carrito
        const unsubscribeCart = onSnapshot(cartRef, (docSnap) => {
          if (docSnap.exists()) {
            const cartData = docSnap.data();
            const items = cartData.items || []; // Asegurarse de que sea un array

            // Actualizar la lista de productos con los datos del carrito
            const formattedItems = items.map((item: any) => ({
              id: item.id,
              description: item.description || "",
              title: item.title || "",
              price: item.price || 0,
              quantity: item.quantity || 0,
              srcImage: item.srcImage || "",
            }));

            const totalSubTotal = items.reduce(
              (sum: any, item: any) => sum + item.price * item.quantity,
              0
            );
            setSubTotal(totalSubTotal);
            setProductList(formattedItems);
          } else {
            console.log("No se encontró el carrito para este usuario.");
            setProductList([]); // Vaciar el carrito si no existe
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!currentUser) {
        console.error("No hay usuario autenticado" + cart);

        return;
      }

      const cartRef = doc(db, "carts", currentUser["uid"]); // Referencia al carrito del usuario

      // Actualizar los items en Firebase
      await updateDoc(cartRef, {
        items: productList, // Enviar la lista de productos actualizada
      });

      console.log("Carrito actualizado en Firebase");
    } catch (error) {
      console.error("Error al actualizar el carrito:", error);
    }
  };

  useEffect(() => {
    getProductList();
  }, [currentUser]);

  const updateQuantity = (id: string, action: "increment" | "decrement") => {
    if (!currentUser) {
      console.error("No hay usuario autenticado" + cart);
      var varTotalSubTotal = 0;

      setProductList((prev) =>
        prev.map((producto) => {
          if (producto.id === id) {
            if (action === "increment") {
              producto.quantity++;
            } else {
              producto.quantity--;
            }
            varTotalSubTotal = producto.quantity * producto.price;
            setSubTotal(varTotalSubTotal);
            return producto;
          }
          return producto;
        })
      );

      // Guardar los productos actualizados en localStorage
      localStorage.setItem("guestCart", JSON.stringify(refProductList.current));
    } else {
      var varTotalSubTotal = 0;
      setProductList((prev) =>
        prev.map((product) => {
          if (product.id === id) {
            varTotalSubTotal = product.quantity * product.price;
            setSubTotal(varTotalSubTotal);
            return {
              ...product,
              quantity:
                action === "increment"
                  ? product.quantity + 1
                  : Math.max(product.quantity - 1, 1),
            };
          }

          return product;
        })
      );
    }
  };

  const handleRemoveItem = async (id: any) => {
    try {
      if (!currentUser) {
        console.error("No hay usuario autenticado");

        // Filtrar los productos para excluir el producto con el id especificado
        const updatedItems = refProductList.current.filter(
          (product: any) => product.id !== id
        );

        const totalSubTotal = updatedItems.reduce(
          (sum: any, item: any) => sum + item.price * item.quantity,
          0
        );
        setSubTotal(totalSubTotal);

        // Guardar los productos actualizados en localStorage
        localStorage.setItem(
          "guestCart",
          JSON.stringify(updatedItems)
        );
        setProductList(updatedItems);

        return;
      }

      const cartRef = doc(db, "carts", currentUser["uid"]); // Referencia al carrito del usuario

      // Filtrar los productos para excluir el producto con el id especificado
      const updatedItems = productList.filter((product) => product.id !== id);

      // Actualizar los items en Firebase
      await updateDoc(cartRef, {
        items: updatedItems,
      });

      // Actualizar la lista de productos en el estado
      setProductList(updatedItems);

      navigate("/boutique"); // Redirige al usuario a la página de login
    } catch (error) {
      console.error("Error al eliminar el producto del carrito:", error);
    }
  };

  return (
    <Dialog open={isCartOpen} onClose={closeCart} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      Shopping cart
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={closeCart}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
                      <ul
                        role="list"
                        className="-my-6 divide-y divide-gray-200"
                      >
                        {refProductList.current.map((product) => (
                          <li key={product.id} className="flex py-6">
                            <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                alt={product.description}
                                src={product.srcImage}
                                className="size-full object-cover object-center"
                              />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>
                                    <a href={""}>{product.title}</a>
                                  </h3>
                                  <p className="ml-4">{product.price + "€"}</p>
                                </div>
                                {/* <p className="mt-1 text-sm text-gray-500">
                                  {product.color}
                                </p> */}
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <div className="flex items-center justify-center space-x-4 rounded-full border border-gray-300 p-2 w-24">
                                    {/* Botón de disminuir */}
                                    <button
                                      onClick={() =>
                                        updateQuantity(product.id, "decrement")
                                      }
                                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                      -
                                    </button>

                                    {/* Valor del contador */}
                                    <span className="text-lg font-medium text-gray-900">
                                      {product.quantity}
                                    </span>

                                    {/* Botón de aumentar */}
                                    <button
                                      onClick={() =>
                                        updateQuantity(product.id, "increment")
                                      }
                                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="flex flex-row">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveItem(product.id)
                                      }
                                      className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                      Remove{" "}
                                    </button>
                                    <FaRegTrashCan
                                      className="cursor-pointer mt-1 ml-2"
                                      onClick={() => {
                                        handleRemoveItem(product.id);
                                      }}
                                    ></FaRegTrashCan>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>{subTotal + "€"}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <Link
                      to={productList.length > 0 ? "/buy" : "#"}
                      onClick={() => {
                        closeCart();
                        handleCheckout(); // Actualizar el carrito en Firebase al hacer checkout
                      }}
                      className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                      Checkout
                      <MdOutlineShoppingCartCheckout className="ml-4"></MdOutlineShoppingCartCheckout>
                    </Link>
                  </div>
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or{" "}
                      <Link
                        type="button"
                        onClick={closeCart}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                        to={"/boutique"}
                      >
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
