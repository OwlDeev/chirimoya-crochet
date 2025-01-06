"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel
} from "@headlessui/react";
import './ml-modal-product.css'

//product overview
import MlProductOverview from "./ml-product-overview";

interface MlModalProductProps {
  idProduct:string;
  isOpen: boolean; // Controla si el modal está abierto
  onClose: () => void; // Función para cerrar el modal
  title?: string; // Título del modal
  imageAlt?: string;
  description?: string; // Descripción opcional
  srcImage?: string; // Icono opcional para el encabezado
  price?: number;
}

export default function MlModalProduct({
  idProduct = "",
  isOpen,
  onClose,
  title = "Modal Title",
  description = "Modal description goes here.",
  imageAlt = "imageAlt",
  srcImage = "srcImage",
  price = 0
}: MlModalProductProps) {

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto modal-container">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-4/5 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 modal-content"
          >
            <MlProductOverview
              isOpen={true}
              // product={selectedProduct}
              onClose={onClose}
              title={title}
              description={description}
              imageAlt={imageAlt}
              srcImage={srcImage}
              price={price}
              idProduct={idProduct}
            ></MlProductOverview>

          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
