import "./ml-profile.css";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import { getAuth, updatePassword, signOut } from "firebase/auth";
import {
  updateDoc,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../config/firebase-config";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { FaRegTrashCan } from "react-icons/fa6";
import { BiSolidDetail } from "react-icons/bi";
import { FaSignOutAlt } from "react-icons/fa";
import { FaSave } from "react-icons/fa";

interface MlProfile {
  fullName?: string | null; // Título del modal
  EmailAddress?: string | null;
  photoURL?: string | null; // Descripción opcional
}

interface Item {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: { id: string; description: string; quantity: number; price: number }[]; // Ajusta según tus datos
  states: [];
  total: number;
  lastStatus: any;
  userId: string;
}

export default function MlProfile({ EmailAddress = "" }: MlProfile) {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [fullname, setFullName] = useState<string>("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [updateUser, setUpdateUser] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate(); // Hook de React Router para la navegación
  const currentUser = auth.currentUser;

  useEffect(() => {
    getProfileUser();
    fetchUserOrders();
  }, []);

  useEffect(() => {
    if (updateUser) {
      setTimeout(() => {
        getProfileUser(); // Llamar al método después de un pequeño retraso para evitar sobrescribir
        fetchUserOrders();
      }, 500); // Agrega un retraso de 500ms
      setUpdateUser(false);
    }
  }, [updateUser]);

  const logOut = async () => {
    try {
      await signOut(auth);
      // setUserActive(null);
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const getProfileUser = async () => {
    const userUid = currentUser !== null ? currentUser.uid : "";
    const userDocRef = doc(db, "user", userUid);
    // Obtener el documento del usuario
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Acceder a los datos del documento
      const userData = userDocSnap.data();
      const fullnameData = userData.fullname;
      const phoneData = userData.phone;

      setFullName(fullnameData);
      setPhone(phoneData);

      console.log("Nombre completo:", fullnameData);
      console.log("Teléfono:", phoneData);
    } else {
      console.log("No se encontró el documento del usuario.");
    }
  };

  const onUpdateProfile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Evitar el comportamiento predeterminado del formulario
    setLoading(true); // Activar el estado de carga

    const userUid = currentUser !== null ? currentUser.uid : ""; // Obtén el UID del usuario autenticado
    const userDoc = doc(db, "user", userUid);

    try {
      if (password !== "") await updatePasswordProfile();

      await updateDoc(userDoc, { fullname: fullname, phone: phone });

      // Mostrar SweetAlert al completar la operación con éxito
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your profile has been updated",
        showConfirmButton: false,
        timer: 1500,
      });

      setUpdateUser(true);
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
    } finally {
      setLoading(false); // Desactivar el estado de carga al finalizar
    }
  };

  const updatePasswordProfile = async () => {
    //actualiza el password
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await updatePassword(user, newPassword);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const fetchUserOrders = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("Usuario no autenticado.");
        return;
      }

      const userId = currentUser.uid;
      const ordersRef = collection(db, "orders");
      const userOrdersQuery = query(ordersRef, where("userId", "==", userId));

      const querySnapshot = await getDocs(userOrdersQuery);
      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        items: doc.data().items || [], // Asegúrate de que sea un array
        total: doc.data().total || 0,
        states: doc.data().states || [],
        lastStatus: doc.data().states[doc.data().states.length - 1] || {
          state: "No state",
          date: "No date",
        },
        userId: doc.data().userId || "",
      }));

      setOrderList(orders);
      console.log("Pedidos del usuario:", orders);
      return orders;
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
    }
  };

  const onClickDeleteOrder = (orderId: string) => {
    // Mostrar SweetAlert al completar la operación con éxito
    try {
      Swal.fire({
        position: "center",
        icon: "question",
        title: "Are you sure of delete the order",
        showConfirmButton: true,
        confirmButtonText: "Delete Order",
        confirmButtonColor: "#f80400",
        cancelButtonText: "Cancel",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          // Si se presiona el botón de confirmar
          deleteOrderConfirm(orderId); // Llama a la función para eliminar la orden
        } else if (result.isDismissed) {
          // Si se presiona el botón de cancelar
          console.log("Cancelado por el usuario");
        }
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const deleteOrderConfirm = async (orderId: string) => {
    await deleteDoc(doc(db, "orders", orderId)); // Elimina la orden por su ID
    navigate("/login"); // Redirige al usuario a la página de login
    fetchUserOrders();
  };

  return (
    <form>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="ml-8 text-base/7 font-semibold text-gray-900">
            Profile
          </h2>
          <div className="grid grid-cols-2 gap-1 p-4">
            {/* Columna Izquierda: Información básica */}
            <div className="h-full w-full div-basic-information">
              <div className="p-4 flex grid grid-cols-[30%,70%] gap-1">
                <label
                  htmlFor="username"
                  className="pb-0 flex flex-col-reverse text-sm/6 font-medium text-gray-900"
                >
                  Fullname
                </label>
                <div className="pl-4 h-full w-full">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      className="h-full w-full pb-0 block flex border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                      value={fullname || ""}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 flex grid grid-cols-[30%,70%] gap-1">
                <label
                  htmlFor="username"
                  className="pb-0 flex flex-col-reverse text-sm/6 font-medium text-gray-900"
                >
                  Email Address
                </label>
                <div className="pl-4 h-full w-full">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      disabled
                      id="username"
                      name="username"
                      type="email"
                      placeholder="janesmith@gmail.com"
                      autoComplete="email"
                      className="h-full w-full pb-0 block flex border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                      defaultValue={EmailAddress || ""}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 flex grid grid-cols-[30%,70%] gap-1">
                <label
                  htmlFor="username"
                  className="pb-0 flex flex-col-reverse text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="pl-4 h-full w-full">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      value={newPassword}
                      placeholder="Enter new password"
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="h-full w-full pb-0 block flex border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 flex grid grid-cols-[30%,70%] gap-1">
                <label
                  htmlFor="username"
                  className="pb-0 flex flex-col-reverse text-sm/6 font-medium text-gray-900"
                >
                  Phone
                </label>
                <div className="pl-4 h-full w-full">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <PhoneInput
                      country={"us"} // País predeterminado
                      value={phone}
                      onChange={(e) => setPhone(e)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Espacio adicional o información complementaria */}
            <div className="p-4 flex justify-center align-middle items-center">
              <div className="flex flex-col">
                <div className="mt-2 flex gap-x-3 flex-col">
                  <UserCircleIcon
                    aria-hidden="true"
                    className="size-40 text-gray-300"
                  />
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order List */}
          <div className="flex w-full h-full p-4 flex-col ">
            <h2 className="m-4 text-base/7 font-semibold text-gray-900">
              Order List
            </h2>
            <div className="div-basic-information flex w-full h-full flex-col">
              <table className="table-auto w-full h-full ">
                <thead>
                  <tr>
                    <th className="text-start p-4">Number Order</th>
                    <th className="text-start p-4">State</th>
                    <th className="text-start p-4">Review</th>
                    <th className="text-start p-4">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {orderList.map((order) => (
                    <tr>
                      <td className="pl-4">{order.id}</td>
                      <td className="pl-4">{order.lastStatus["state"]}</td>
                      <td className="pl-4">
                        <Link
                          to="/detail-order"
                          state={{ orderId: order.id }}
                          className="px-6 text-base font-medium cursor-pointer flex flex-row color-button rounded-md border border-transparent w-3/4"
                        >
                          <div>
                            <p>View Detail</p>
                          </div>
                          <div className="pt-1 pl-4 align-middle">
                            <BiSolidDetail />
                          </div>
                        </Link>
                      </td>
                      <td className="cursor-pointer p-4">
                        <FaRegTrashCan
                          onClick={() => onClickDeleteOrder(order.id)}
                        ></FaRegTrashCan>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-6 p-4">
        <button
          type="button"
          className={`rounded-md color-button px-3 py-2 text-sm font-semibold text-white shadow-sm flex flex-row`}
          onClick={logOut}
        >
          Sign Out
          <div className="pt-1 pl-4 align-middle">
            <FaSignOutAlt />
          </div>
        </button>
        <button
          type="button"
          className={`flex flex-row rounded-md color-button px-3 py-2 text-sm font-semibold text-white shadow-sm ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-200"
          }`}
          onClick={onUpdateProfile}
          disabled={loading} // Deshabilitar el botón si está cargando
        >
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C6.477 0 0 6.477 0 12h4z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            <div className="flex flex-row">
              <p>Save</p>
              <div className="pt-1 pl-4 align-middle">
              <FaSave />
              </div>
            </div>
          )}
        </button>
      </div>
    </form>
  );
}
