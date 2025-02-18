import useState from "react-usestateref";
import { useEffect } from "react";
import { auth, db } from "../../config/firebase-config";
import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./completion.css";
import Swal from "sweetalert2";
import { useCart } from "../context/cart-context";

interface CompletionProps {
  // clientSecret: string; // Define el tipo de la prop que recibirá
}

const Completion: React.FC<CompletionProps> = ({}) => {
  const location = useLocation();
  const [currentUser, setCurrentUser, refCurrentUser] = useState<null | User>(
    null
  ); // Estado para el usuario actual
  const navigate = useNavigate(); // Hook de React Router para la navegación
  const [productList, setProductList] = useState([]);
  const [amountTotal, setAmountTotal] = useState(0);
  const [dataWrite, setDataWrite] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(false);
  const [docRefOrder, setDocRefOrder, refDocRefOrder] = useState("");
  const { cleanCart } = useCart();

  interface PersonalDetailData {
    name: string;
    surname: string;
    email: string;
  }

  interface ShippingData {
    country: string;
    postalCode: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    // Add other properties as needed
  }

  const [personalDetailData, setPersonalDetailData] =
    useState<PersonalDetailData | null>(null);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Guardar el usuario autenticado
        setCurrentUserData(true);
      } else {
        setCurrentUser(null); // Usuario no autenticado
        setCurrentUserData(true);
      }
    });
    setDocRefOrder("");
    return () => unsubscribeAuth(); // Limpiar el listener al desmontar
  }, []);

  const ViewOrderHistor = () => {
    navigate("/detail-order");
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const from = queryParams.get("from");

    let products = [];
    if (from === "session") {
      // Recuperar los datos almacenados en sessionStorage
      const storedProducts = sessionStorage.getItem("productList");
      products = storedProducts ? JSON.parse(storedProducts) : [];
      setProductList(products);

      const storedAmount = sessionStorage.getItem("amount");
      const amount = storedAmount ? JSON.parse(storedAmount) : 0;
      setAmountTotal(amount);

      const storedShippingData = sessionStorage.getItem("shippingData");
      const shippingData = storedShippingData
        ? JSON.parse(storedShippingData)
        : {};
      setShippingData(shippingData);

      const storedPersonalDetailData =
        sessionStorage.getItem("personalDetailData");
      const personalDetailData = storedPersonalDetailData
        ? JSON.parse(storedPersonalDetailData)
        : {};
      setPersonalDetailData(personalDetailData);
    }
    setDataWrite(true);
  }, []);

  useEffect(() => {
    if (
      refCurrentUser.current &&
      dataWrite === true &&
      currentUserData === true
    ) {
      if (!refCurrentUser.current) {
        createOrderInvited();
      } else {
        createOrder();
      }
      setCurrentUserData(false);
      setDataWrite(false);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Order created successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      sendEmail();
    } else if (
      refCurrentUser.current == null &&
      dataWrite === true &&
      currentUserData === true
    ) {
      if (!refCurrentUser.current) {
        createOrderInvited();
      } else {
        createOrder();
      }
      setCurrentUserData(false);
      setDataWrite(false);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Order created successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      sendEmail();
    }
  }, [refCurrentUser.current, dataWrite, currentUserData]);

  const createOrderInvited = async () => {
    const cart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const personalDetail = JSON.parse(
      localStorage.getItem("guestPersonalDetail") || "[]"
    );
    const shipping = JSON.parse(localStorage.getItem("guestShipping") || "[]");
    const total = JSON.parse(localStorage.getItem("guestTotal") || "[]");

    const uidInvited = `invited-${new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")}`;
    const orderRef = doc(db, "orders", uidInvited); // ID único
    setDocRefOrder(uidInvited);
    await setDoc(orderRef, {
      userId: uidInvited,
      items: cart,
      total: total,
      timestamp: serverTimestamp(),
      personalDetail: personalDetail, // Datos del paso personalDetail
      shipping: shipping, // Datos del paso shipping
      states: [
        {
          state: "Pending",
          date: new Date().toLocaleDateString(), // Fecha actual
        },
      ],
    });

    // console.log("Pedido creado exitosamente.");
    // localStorage.setItem("guestCart", JSON.stringify([]));
    // localStorage.setItem("guestPersonalDetail", "{}");
    // localStorage.setItem("guestShipping", "{}");
    // cleanCart();
  };

  const createOrder = async () => {
    try {
      // Obtener el usuario actual
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("Usuario no autenticado.");
        return;
      }

      const uid = currentUser.uid;

      // Referencia al carrito del usuario
      const cartRef = doc(db, "carts", uid);

      // Obtener datos del carrito (esto supone que los datos están almacenados localmente o se obtienen directamente del carrito en tiempo real)
      const cartData = {
        items: productList,
        total: 100, // Reemplaza con el total calculado
      };

      // Crear un nuevo pedido
      const uidNewOrder = `${Date.now()}`;
      const orderRef = doc(db, "orders", uidNewOrder); // ID único
      setDocRefOrder(uidNewOrder);
      await setDoc(orderRef, {
        userId: uid,
        items: cartData.items,
        total: cartData.total,
        timestamp: serverTimestamp(),
        personalDetail: personalDetailData, // Datos del paso personalDetail
        shipping: shippingData, // Datos del paso shipping
        states: [
          {
            state: "Pending",
            date: new Date().toLocaleDateString(), // Fecha actual
          },
        ],
      });

      console.log("Pedido creado exitosamente.");

      // Eliminar el carrito después de crear el pedido
      await deleteDoc(cartRef);

      //limpia variables
      // setSubTotal(0);
    } catch (error) {
      console.error("Error al crear el pedido o eliminar el carrito:", error);
    }
  };

  const sendEmail = async () => {
    try {
      const guestCart = localStorage.getItem("guestCart");
      const cartItems = JSON.parse(guestCart || "[]"); // Convierte el string a un objeto/array
      console.log(cartItems); // Esto debe mostrar los datos de tu carrito

      const orderItems = cartItems.map((item: any) => ({
        name: item.title, // Toma el título como el nombre del producto
        quantity: item.quantity, // Cantidad
        price: item.price, // Precio por unidad
      }));

      const total = cartItems.reduce(
        (acc: any, item: any) => acc + item.price * item.quantity,
        0
      ); // Calcula el total

      localStorage.setItem("guestTotal", JSON.stringify(0));
      localStorage.setItem("guestCart", JSON.stringify([]));
      localStorage.setItem("guestPersonalDetail", "{}");
      localStorage.setItem("guestShipping", "{}");
      cleanCartProducts(); // Limpia el carrito
      cleanCart();

      // const response = await fetch("https://chirimoyacrochet.com:5253/send-email", {
      const response = await fetch("https://localhost:5253/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: personalDetailData ? personalDetailData.email : "", // Correo del destinatario
          order: {
            id: refDocRefOrder.current, // Puedes usar un ID fijo o generar uno dinámicamente
            total: total, // Total calculado
            items: orderItems, // Los productos del carrito
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Error en el envío del correo");
      }
      const data = await response.json();
      // cleanCartProducts(); // Limpia el carrito
      // cleanCart();
      console.log("Respuesta del servidor:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cleanCartProducts = () => {
    try {
      if (!refCurrentUser.current) {
        localStorage.setItem("guestCart", JSON.stringify([]));
      } else {
        const cartRef = doc(db, "carts", currentUser?.uid || ""); // Referencia al carrito del usuario

        // Actualizar los items en Firebase
        updateDoc(cartRef, {
          items: [], // Enviar la lista de productos actualizada
        });
      }
    } catch (error) {}
  };

  return (
    <div className="div-main-completion">
      <h1>Thank you for your purchase! 🎉</h1>
      <p>Your order has been successfully processed.</p>
      <div className="div-resumen-cart">
        <h2>Order Summary</h2>
        <ul>
          {productList.map((product: any) => {
            return (
              <li>
                {product.title}: {product.quantity} units - ${product.price}
              </li>
            );
          })}
        </ul>
        <p>
          <strong>Total: {amountTotal} € </strong>
        </p>
      </div>
      <div className="div-info-envio">
        <h2>Shipping Information</h2>
        {shippingData && (
          <div>
            <p>
              Name: {personalDetailData?.name} {personalDetailData?.surname}
            </p>
            <p>Email: {personalDetailData?.email}</p>
            <p>
              Address: {shippingData.address}, {shippingData.city},{" "}
              {shippingData.country}, {shippingData.postalCode}
            </p>
            <p>Phone: {shippingData.phone}</p>
          </div>
        )}
      </div>
      <div className="div-info-pago">
        <h2>Payment Details</h2>
        <p>Payment Method: Credit Card</p>
      </div>
      <div className="div-next">
        <h2>What's Next?</h2>
        <p>
          You will receive an email with the details of your purchase. Your
          order will be delivered within 3-5 business days.
        </p>
      </div>
      <div className="div-buttons">
        <button
          onClick={() => {
            navigate("/boutique");
          }}
        >
          Continue Shopping
        </button>
        <Link
          className="link-completion"
          to="/detail-order"
          state={{ orderId: refDocRefOrder.current }}
        >
          View Order History
        </Link>
      </div>
    </div>
  );
};

export default Completion;
