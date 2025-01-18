import { useEffect } from "react";
import useState from "react-usestateref";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useLocation } from "react-router-dom";
import "./payment.css";

interface MlPayment {}

export default function Payment({}: MlPayment) {
  const [stripePromise, setStripePromise, refStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret, refClientSecret] = useState("");
  const location = useLocation();
  const { amount, currency } = location.state || {}; // Valores pasados desde navigate

  useEffect(() => {
    fetch("https://www.chirimoyacrochet.com:5253/config").then(async (r) => {
    // fetch("http://localhost:5253/config").then(async (r) => {
      // fetch("http://192.168.1.66:5253/config").then(async (r) => {
      const { publishableKey } = await r.json();
      setStripePromise(loadStripe(publishableKey));
    });
  }, []);

  useEffect(() => {

    const option = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }), // Usa el monto dinámico
    }
    fetch("https://www.chirimoyacrochet.com:5253/create-payment-intent", option)
      .then(async (result) => {
        if (!result.ok) {
          throw new Error("Error en la creación del PaymentIntent");
        }
        var { clientSecret } = await result.json();
        setClientSecret(clientSecret);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []); // Asegúrate de incluir amount como dependencia

  return (
    <>
      <div className="div-payment">
         {refClientSecret.current && refStripePromise.current && (
          <Elements
            stripe={refStripePromise.current}
            options={{ clientSecret: refClientSecret.current }}
          >
            <div className="div-payment-info">
              <p className="pr-3 pb-6">Amount</p>
              <p>{'€' + amount}</p>
            </div>
            <CheckoutForm />
          </Elements>
       )}
      </div>
    </>
  );
}
