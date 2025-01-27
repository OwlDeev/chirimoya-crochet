import useState from "react-usestateref";
import React, { useEffect } from "react";
import "./ml-buy.css";
import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase-config";
import { Link, useNavigate } from "react-router-dom";
import OrPersonalDetail from "../organism/or-personal-detail";
import OrShipping from "../organism/or-shipping";
import { IoMdArrowRoundBack } from "react-icons/io";
import { GiConfirmed } from "react-icons/gi";
import { FaRegTrashCan } from "react-icons/fa6";

const Stepper = () => {
  const navigate = useNavigate(); // Hook de React Router para la navegación
  const [currentStep, setCurrentStep] = useState(1);
  const [personalDetailData, setPersonalDetailData] = useState({});
  const [shippingData, setShippingData] = useState({});
  const [subTotal, setSubTotal, refSubTotal] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario actual
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
        localStorage.setItem("guestTotal", JSON.stringify(totalSubTotal));
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

  useEffect(() => {
    getProductList();
  }, [currentUser]);

  useEffect(() => {
    if (currentStep === steps.length + 1) {
      setCurrentStep(1);
      // /boutique
      navigate("/payment", {
        state: {
          amount: subTotal, // Por ejemplo, el monto que necesitas pasar
          currency: "EUR",
          productList: productList,
          personalDetailData: personalDetailData,
          shippingData: shippingData,
        },
      });
    }
  }, [currentStep]);

  const changeStep = (action: string) => {
    if (action === "preview") setCurrentStep(currentStep - 1);

    if (action === "next") setCurrentStep(currentStep + 1);
  };

  const steps = [
    { id: 1, label: "Shopping Cart" },
    { id: 2, label: "Personal Details" },
    { id: 3, label: "Shipping" },
  ];

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
        localStorage.setItem("guestTotal", JSON.stringify(totalSubTotal));

        // Guardar los productos actualizados en localStorage
        localStorage.setItem("guestCart", JSON.stringify(updatedItems));
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
      if(refSubTotal.current === 0){
        navigate("/boutique"); // Redirige al usuario a la página de login
      }
      
    } catch (error) {
      console.error("Error al eliminar el producto del carrito:", error);
    }
  };

  return (
    <div className="div-main-buy">
      {/* <div className="flex items-start div-main-progress-bar pt-10 pl-48">
        {steps.map((step, index) => (
          <div className="flex w-full h-fullborder" key={step.id}>
            
            <div className="flex items-start">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step.id < currentStep
                    ? "option-one-step"
                    : step.id === currentStep
                    ? "border-2 option-two-step"
                    : "border-2 option-tree-step"
                }`}
              >
                {step.id < currentStep ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`ml-2 ${
                  step.id <= currentStep
                    ? "color-text-primary font-medium"
                    : "color-text-primary"
                }`}
              >
                {step.label}
              </span>
            </div>
           
            {index < steps.length - 1 && (
              <div
                className={`mt-5 flex-auto border-t-2 mx-4 ${
                  step.id < currentStep
                    ? "color-text-primary"
                    : "border-gray-300"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div> */}

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={step.id} className={`step-item ${step.id === currentStep ? 'active' : ''}`}>
            {/* Step */}
            <div className={`flex items-start`}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step.id < currentStep
                    ? "option-one-step"
                    : step.id === currentStep
                    ? "border-2 option-two-step"
                    : "border-2 option-tree-step"
                }`}
              >
                {step.id < currentStep ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`ml-2 ${
                  step.id <= currentStep
                    ? "color-text-primary font-medium"
                    : "color-text-primary"
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={`step-connector ${
                  step.id < currentStep
                    ? "color-text-primary"
                    : "border-gray-300"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Tabla con productos */}
      {currentStep === 1 && (
        <div className="pl-20 pr-20 pt-20">
          <ul role="list" className="-my-6 divide-y divide-gray-200">
            {productList.map((product) => (
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
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <p className="text-gray-500">
                      Quantity: {product.quantity}
                    </p>

                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(product.id)}
                        className="flex flex-row font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Remove
                        <FaRegTrashCan className="cursor-pointer mt-1 ml-2"></FaRegTrashCan>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between text-base font-medium text-gray-900 pl-20 pr-20 pt-20">
            <p>Subtotal</p>
            <p>${subTotal}</p>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <OrPersonalDetail
          media="some-media-value"
          onSubmit={(values: any) => {
            setPersonalDetailData(values);
            changeStep("next"); // Avanza al siguiente paso
          }}
        />
      )}

      {currentStep === 3 && (
        <OrShipping
          onSubmit={(values: any) => {
            setShippingData(values);
            changeStep("next"); // Avanzar al siguiente paso
          }}
        />
      )}

      {/* Botones */}
      {currentStep !== 4 ? (
        <div className="div-buttons-buy flex flex-row h-full w-full justify-between p-20">
          <div className="flex flex-row h-full w-full">
            {currentStep === 1 ? (
              <Link
                to="/boutique"
                className="color-button flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium"
              >
                Back
                <IoMdArrowRoundBack className="mt-1 ml-2" />
              </Link>
            ) : (
              <button
                onClick={() => changeStep("preview")}
                className={`color-button flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium ${
                  currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={currentStep === 1}
              >
                Back
                <IoMdArrowRoundBack className="mt-1 ml-2" />
              </button>
            )}
          </div>
          <div className="flex flex-row h-full w-full justify-end">
            {currentStep === 1 ? (
              <button
                onClick={() => changeStep("next")}
                className={`color-button flex justify-end rounded-md border border-transparent px-6 py-3 text-base font-medium`}
              >
                Confirm
                <GiConfirmed className="mt-1 ml-2" />
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Stepper;
