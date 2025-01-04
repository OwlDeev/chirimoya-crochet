import { useEffect, useState } from "react";
import "./or-view-detail.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase-config";
import { deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { BsInfoSquare } from "react-icons/bs";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";

interface MlViewDetailProps {}

const MlViewDetail: React.FC<MlViewDetailProps> = () => {
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario actual
  const [subTotal, setSubTotal] = useState(0);
  const [personalDetailData, setPersonalDetailData] = useState();
  const [shippingData, setShippingData] = useState();
  const [statesData, setStatesData] = useState<any[]>([]);
  const navigate = useNavigate(); // Hook de React Router para la navegación
  const [productList, setProductList] = useState<
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
  const location = useLocation();
  const { orderId } = location.state || {}; // Recupera el dato enviado por `state`

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
      if (!currentUser) return; // Salir si no hay usuario autenticado

      const orderRef = doc(db, "orders", orderId || ""); // Referencia al carrito del usuario

      // Suscribirse a cambios en tiempo real en el documento del carrito
      const unsubscribeCart = onSnapshot(orderRef, (docSnap) => {
        if (docSnap.exists()) {
          const cartData = docSnap.data();
          setPersonalDetailData(cartData.personalDetail);
          setShippingData(cartData.shipping);
          setStatesData(cartData.states);
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
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getProductList();
  }, [currentUser]);

  const deleteOrderConfirm = async (orderId: string) => {
    await deleteDoc(doc(db, "orders", orderId)); // Elimina la orden por su ID
    navigate("/login"); // Redirige al usuario a la página de login
  };

  const cancelOrder = async (idOrder: any) => {
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
          deleteOrderConfirm(idOrder); // Llama a la función para eliminar la orden
        } else if (result.isDismissed) {
          // Si se presiona el botón de cancelar
          console.log("Cancelado por el usuario");
        }
      });
    } catch (error) {
      console.error("Error al eliminar la orden:", error);
      alert("No se pudo eliminar la orden.");
      navigate("/login"); // Redirige al usuario a la página de login
    }
  };

  const returnDetail = () => {
    navigate("/login"); // Redirige al usuario a la página de login
  };

  return (
    <div className="mt-8">
      <div className="pl-20 pr-20 pt-20 border-b border-gray-900/10 pb-12">
        <ul role="list" className="-my-6 divide-y divide-gray-200">
          {productList.map((product: any, index: any) => (
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
                    <p className="ml-4">{product.price}</p>
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <p className="text-gray-500">Quantity {product.quantity}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-row-reverse">{"Subtotal: " + subTotal}</div>
      </div>

      <div className="div-basic-information pl-5 pr-5 pt-5 border-b border-gray-900/10 pb-5 m-10">
        <table className="table-auto w-full rounded">
          <thead>
            <tr>
              <th className="text-start p-2">Address</th>
              <th className="text-start p-2">Apartment</th>
              <th className="text-start p-2">City</th>
              <th className="text-start p-2">Country</th>
              <th className="text-start p-2">Phone</th>
              <th className="text-start p-2">Postal Code</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">{shippingData && shippingData["address"]}</td>
              <td className="p-2">
                {shippingData && shippingData["apartment"]}
              </td>
              <td className="p-2">{shippingData && shippingData["city"]}</td>
              <td className="p-2">{shippingData && shippingData["country"]}</td>
              <td className="p-2">{shippingData && shippingData["phone"]}</td>
              <td className="p-2">
                {shippingData && shippingData["postalCode"]}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-row w-full">
        <div className="div-basic-information pl-5 pr-5 pt-5 border-b border-gray-900/10 pb-5 m-10 w-full">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="text-start p-2">Email</th>
                <th className="text-start p-2">Name</th>
                <th className="text-start p-2">Surname</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">
                  {personalDetailData && personalDetailData["email"]}
                </td>
                <td className="p-2">
                  {personalDetailData && personalDetailData["name"]}
                </td>
                <td className="p-2">
                  {personalDetailData && personalDetailData["surname"]}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* State */}
        <div className="flex flex-col div-basic-information pl-5 pr-5 pt-5 border-b border-gray-900/10 pb-5 m-10 w-full">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="text-start p-2">State</th>
                <th className="text-start p-2">Date</th>
                <th className="text-start p-2">Info</th>
              </tr>
            </thead>
            <tbody>
              {statesData &&
                statesData.length > 0 &&
                statesData.map((value: any) => (
                  <tr key={value.state}>
                    <td className="text-start p-2">{value.state}</td>
                    <td className="text-start p-2">{value.date}</td>
                    <td className="text-start p-2">
                      <BsInfoSquare />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pl-20 pr-20 mt-6 mb-6 flex items-center justify-between gap-x-6">
        <button
          type="button"
          className={`color-button rounded-md px-3 py-2 text-sm font-semibold shadow-sm flex flex-row`}
          onClick={() => returnDetail()}
        >
          Return
          <IoMdArrowRoundBack className="mt-1 ml-2" />
        </button>

        <button
          type="button"
          className={`rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm flex flex-row`}
          onClick={() => cancelOrder(orderId)}
        >
          Cancel Order
          <MdOutlineCancel className="mt-1 ml-2"/>
        </button>
      </div>
    </div>
  );
};

export default MlViewDetail;
