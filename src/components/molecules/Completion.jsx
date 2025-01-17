import useState from "react-usestateref";
import { useEffect } from "react";
import { useCart } from "../context/cart-context";
import { auth, db } from "../../config/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./completion.css";

function Completion(props) {
  const { cleanCart } = useCart();
  const [currentUser, setCurrentUser, refCurrentUser] = useState(null); // Estado para el usuario actual
  const navigate = useNavigate(); // Hook de React Router para la navegación

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Guardar el usuario autenticado
      } else {
        setCurrentUser(null); // Usuario no autenticado
      }
    });

    return () => unsubscribeAuth(); // Limpiar el listener al desmontar
  }, []);

  useEffect(() => {
    try {
      if (!refCurrentUser.current) {
        localStorage.setItem("guestCart", JSON.stringify([]));
      } else {
        const cartRef = doc(db, "carts", currentUser["uid"]); // Referencia al carrito del usuario

        // Actualizar los items en Firebase
        updateDoc(cartRef, {
          items: [], // Enviar la lista de productos actualizada
        });
      }
    } catch (error) {}
  }, [currentUser]);

  return (
    <div className="div-main-completion">
      <h1>Thank you for your purchase! 🎉</h1>
      <p>Your order has been successfully processed.</p>
      <div className="div-resumen-cart">
        <h2>Order Summary</h2>
        <ul>
          <li>Product 1: 2 units - $20</li>
          <li>Product 2: 1 unit - $15</li>
        </ul>
        <p>
          <strong>Total: $35</strong>
        </p>
      </div>
      <div className="div-info-envio">
        <h2>Shipping Information</h2>
        <p>Name: Juan Pérez</p>
        <p>Address: 123 Fake Street, City</p>
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
        <button onClick="window.location.href='/orders'">
          View Order History
        </button>
      </div>
    </div>
  );
}

export default Completion;
