import { PaymentElement } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { Link } from "react-router-dom";
import "./checkoutform.css";

interface CheckoutFormProps {
  amount: number; // Define el tipo de la prop que recibirá
  productlist: [];
  shippingData: {};
  personalDetailData: {};
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, productlist, shippingData, personalDetailData }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);
    sessionStorage.setItem("productList", JSON.stringify(productlist));
    sessionStorage.setItem("amount", amount.toString());
    sessionStorage.setItem("shippingData", JSON.stringify(shippingData));
    sessionStorage.setItem("personalDetailData", JSON.stringify(personalDetailData));
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/completion?from=session`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An error occurred");
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
}

export default CheckoutForm;
