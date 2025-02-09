import { PaymentElement } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { Link } from "react-router-dom";
import "./checkoutform.css";
import Swal from "sweetalert2";

interface CheckoutFormProps {
  amount: number; // Define el tipo de la prop que recibirá
  productlist: [];
  shippingData: {};
  personalDetailData: {};
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  productlist,
  shippingData,
  personalDetailData,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const userLanguage = navigator.language;
  const lang = userLanguage.startsWith("es") ? "es" : "en"; // Si no es español, usa inglés

  const errorTranslations: { [key: string]: { [key: string]: string } } = {
    "Tu tarjeta no tiene fondos suficientes; prueba con otra tarjeta.": {
      en: "Your card has insufficient funds; try another card.",
      es: "Tu tarjeta no tiene fondos suficientes; prueba con otra tarjeta.",
    },
    "Tu tarjeta fue rechazada.": {
      en: "Your card was declined.",
      es: "Tu tarjeta fue rechazada.",
    },
    "La fecha de expiración de la tarjeta es incorrecta.": {
      en: "The card's expiration date is incorrect.",
      es: "La fecha de expiración de la tarjeta es incorrecta.",
    },
    "El código de seguridad de la tarjeta es incorrecto.": {
      en: "The card's security code is incorrect.",
      es: "El código de seguridad de la tarjeta es incorrecto.",
    },
    "El número de tarjeta es inválido.": {
      en: "The card number is invalid.",
      es: "El número de tarjeta es inválido.",
    },
  };

  const getTranslatedMessage = (errorMessage: string): string => {
    return errorTranslations[errorMessage]?.[lang] || errorMessage; // Si no hay traducción, devuelve el original
  };

  const handlePaymentError = (error: any) => {
    return getTranslatedMessage(error.message);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);
    sessionStorage.setItem("orderId", amount.toString());
    sessionStorage.setItem("productList", JSON.stringify(productlist));
    sessionStorage.setItem("amount", amount.toString());
    sessionStorage.setItem("shippingData", JSON.stringify(shippingData));
    sessionStorage.setItem(
      "personalDetailData",
      JSON.stringify(personalDetailData)
    );
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/completion?from=session`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An error occurred");
      let translatedMessage = handlePaymentError(error);

      // Mensaje de éxito con SweetAlert
      Swal.fire({
        position: "center",
        icon: "error",
        title: translatedMessage,
        showConfirmButton: true,
        confirmButtonText: "Try again",
      });
    } else {
      setMessage("An unexpected error occured.");
    }

    setIsProcessing(false);
  };

  return (
    <div>
      <div></div>
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        <div className="div-button-payment">
          <Link to="/buy" className="span-button-text pl-3">
            Return
          </Link>
          <button
            disabled={isProcessing || !stripe || !elements}
            id="submit"
            className="span-button-text"
          >
            <span id="button-text">
              {isProcessing ? "Processing ... " : "Pay now"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
