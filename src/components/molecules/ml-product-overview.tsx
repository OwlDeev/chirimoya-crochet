"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { Radio, RadioGroup } from "@headlessui/react";
import { FaCartPlus } from "react-icons/fa";
import "./ml-product-overview.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { auth, db } from "../../config/firebase-config"; // Asegúrate de importar Firebase
import { doc, collection, setDoc, getDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useCart } from "../context/cart-context";

const reviews = { href: "#", average: 4, totalCount: 117 };

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

interface MlProductOverviewProps {
  isOpen: boolean; // Controla si el modal está abierto
  onClose: () => void; // Función para cerrar el modal
  title: string;
  description: string;
  imageAlt: string;
  srcImage: string;
  price: number;
  idProduct: string;
}

export default function MlProductOverview({
  onClose,
  title,
  description,
  imageAlt,
  srcImage,
  price,
  idProduct = "",
}: MlProductOverviewProps) {
  const { addToCartInvited } = useCart();

  const onAddItemCart = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        if (!currentUser) {
          let cart = JSON.parse(localStorage.getItem("guestCart") || "[]"); // Si es null, usa un array vacío por defecto

          cart.push({
            id: idProduct,
            title: title,
            description: description,
            price: price,
            quantity: 1,
            srcImage: srcImage,
          });

          localStorage.setItem("guestCart", JSON.stringify(cart)); // Guarda el carrito actualizado
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Product added to cart",
            showConfirmButton: false,
            timer: 1500,
          });

          addToCartInvited()
          return;
        }
      }

      const cartRef = doc(db, "carts", currentUser.uid); // Referencia al carrito del usuario
      const cartSnap = await getDoc(cartRef);

      let items = [];

      if (!cartSnap.exists()) {
        // Crear un nuevo carrito si no existe
        console.log(
          "El carrito del usuario no existe. Creando un nuevo carrito..."
        );
        await setDoc(cartRef, { items: [] });
      } else {
        // Si el carrito ya existe, obtenemos los datos actuales
        const cartData = cartSnap.data();
        items = cartData.items || [];
      }

      // Verificar si el producto ya existe en el array `items`
      const existingItemIndex = items.findIndex((e: any) => e.id === idProduct);

      if (existingItemIndex >= 0) {
        // Si el producto ya existe, incrementa la cantidad
        items[existingItemIndex].quantity += 1;

        // Mostrar SweetAlert al completar la operación con éxito
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Product added to cart",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        // Si no existe, agrégalo con una cantidad inicial de 1
        items.push({
          id: idProduct,
          title: title,
          description: description,
          price: price,
          quantity: 1,
          srcImage: srcImage,
        });

        // Mostrar SweetAlert al completar la operación con éxito
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Product added to cart",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      // Actualizar el campo `items` en Firestore
      await updateDoc(cartRef, { items });

      console.log("Producto añadido o actualizado en el carrito.");
    } catch (error) {
      console.error("Error al manejar el carrito:", error);
    }
  };

  return (
    <div className="bg-white">
      <div className="pt-6">
        {/* Product info */}
        <div className="div-content-module mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {title}
            </h1>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">
              {price + "€"}
            </p>

            {/* Reviews */}
            <div className="mt-6">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      aria-hidden="true"
                      className={classNames(
                        reviews.average > rating
                          ? "text-gray-900"
                          : "text-gray-200",
                        "size-5 shrink-0"
                      )}
                    />
                  ))}
                </div>
                <p className="sr-only">{reviews.average} out of 5 stars</p>
                <a
                  href={reviews.href}
                  className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {reviews.totalCount} reviews
                </a>
              </div>
            </div>

            <form>
              <div className="div-button-product-overview">
                <button
                  type="button"
                  className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onAddItemCart}
                >
                  Add to car
                  <FaCartPlus className="iconNavbar" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 flex w-full items-center justify-center rounded-md border border-indigo-600 bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Continue shopping
                  <IoMdArrowRoundBack className="iconNavbarContinue" />
                </button>
              </div>
            </form>
          </div>

          <div className="div-main-card-module py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
            {/* Description and details */}
            <div className="div-main-card-module-izq">
              <h3 className="sr-only">Description</h3>

              <div className="h-full w-full ">
                <img
                  alt={imageAlt}
                  src={srcImage}
                  className="imageCardModal object-cover object-center h-full w-full"
                />
              </div>
            </div>
            <div className="div-main-card-module-der">
              <div className="mt-10">
                <h3 className="text-sm font-medium text-gray-900">
                  Highlights
                </h3>

                <div className="mt-4">
                  <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                    <li key={description} className="text-gray-400">
                      <span className="text-gray-600">{description}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Details</h2>

                <div className="mt-4 space-y-6">
                  <p className="text-sm text-gray-600">{imageAlt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
