import React, { useEffect, useState } from "react";
import "./or-modal-add-product.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaRegTrashCan } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { FaSave } from "react-icons/fa";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase-config";
import Swal from "sweetalert2";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import MlUploadImage from "../molecules/ml-upload-image";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";

interface ITypeProduct {
  id: string;
  href: number;
  name: string;
}


const OrModalManageProduct = ({
  isOpen,
  onClose,
  productSelected,
}: {
  isOpen: boolean;
  onClose: () => void;
  productSelected: {
    id: string;
    desc: string;
    href: number;
    imageAlt: string;
    name: string;
    price: number;
    srcImage: string;
  };
}) => {
  const [nameProduct, setNameProduct] = useState("");
  const [priceProduct, setPriceProduct] = useState(0);
  const [highlightsProduct, setHighlightsProduct] = useState("");
  const [detailsProduct, setDetailsProduct] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // 📌 Estado para la imagen
  const [selected, setSelected] = useState<ITypeProduct>({ id: "", href: 0, name: "All" });
  const typeProductCollecionRef = collection(db, "tipoProducto");
  const [typeProductList, setTypeProductList] = useState<ITypeProduct[]>([]);

  useEffect(() => {
    getTypeProductList()
    if (productSelected.id !== "") {
      setNameProduct(productSelected.name);
      setPriceProduct(productSelected.price);
      setHighlightsProduct(productSelected.desc);
      setDetailsProduct(productSelected.imageAlt);
      setImageUrl(productSelected.srcImage);
    } else {
      toggleHidden()
    }
  }, []);

  useEffect(() => {
    if (typeProductList) {
      definedTypeProduct();
    }
  }, [typeProductList])

  const definedTypeProduct = () => {
    for (let typeProd of typeProductList) {
      if (productSelected.href  === typeProd.href) {
        setSelected(typeProd);
      }
    }
  };

  const addProductWithCustomId = async () => {
    try {
      if (productSelected.id !== "") {
        await updateDoc(doc(db, "productos", productSelected.id), {
          desc: highlightsProduct,
          imageAlt: detailsProduct,
          name: nameProduct,
          name_lower: nameProduct.toLowerCase(),
          tokens: nameProduct.toLowerCase().split(" "),
          price: priceProduct,
          href: selected.href,
          srcImage: imageUrl,
        });
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Product update",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        await addDoc(collection(db, "productos"), {
          desc: highlightsProduct,
          imageAlt: detailsProduct,
          name: nameProduct,
          name_lower: nameProduct.toLowerCase(),
          tokens: nameProduct.toLowerCase().split(" "),
          price: priceProduct,
          href: selected.href,
          srcImage: imageUrl,
        });
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Product added",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error agregando producto:", error);
    }
  };

  if (!isOpen) return null;

  const saveNewProduct = () => {
    addProductWithCustomId();
    onClose();
  };

  const onDeleteProduct = async () => {
    const productSelectedRef = doc(db, "productos", productSelected.id);
    // Eliminar el carrito después de crear el pedido
    await deleteDoc(productSelectedRef);
    onClose();
  };

  function toggleHidden() {
    const elemento = document.getElementById("button-delete-add-product");
    // Si el elemento tiene la clase 'hidden', la quitamos; si no, la agregamos.
    if (elemento) {
      elemento.classList.toggle("hidden");
    }
  }

  const getTypeProductList = async () => {
    try {
      const data = await getDocs(typeProductCollecionRef);
      const filteredData = data.docs.map((doc: any) => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: docData.name ?? "", // Asegúrate de que exista o usar array vacío
          href: docData.href ?? "",
        } as ITypeProduct; // Forzamos a que coincida con la interfaz
      });
      setTypeProductList(filteredData);
    } catch (error) { }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="div-main-modal-manage-product">
          <div className="w-full h-full div-image-modal-manage-product">
            <MlUploadImage
              onImageUpload={setImageUrl}
              srcImageModify={productSelected.srcImage}
            />
          </div>

          <div className="w-full h-full flex flex-col pl-4">
            <div className="div-input-modal-manage-product">
              <label className="label-add-product">Name</label>
              <div className="h-full w-full flex items-center div-input-modal-view-order">
                <input
                  id="nameProduct"
                  name="nameProduct"
                  placeholder="EJ: Peter Rabbit"
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  value={nameProduct || ""}
                  onChange={(e) => setNameProduct(e.target.value)}
                />
              </div>
            </div>
            <div className="div-input-modal-manage-product pt-2">
              <label className="label-add-product">Highlights</label>
              <div className="h-full w-full flex items-center div-input-modal-view-order">
                <input
                  id="highlightsProduct"
                  name="highlightsProduct"
                  placeholder="EJ: Este producto es 100% lana y weno"
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  value={highlightsProduct || ""}
                  onChange={(e) => setHighlightsProduct(e.target.value)}
                />
              </div>
            </div>
            <div className="div-input-modal-manage-product pt-2">
              <label className="label-add-product">Details</label>
              <div className="h-full w-full flex items-center div-input-modal-view-order">
                <input
                  id="detailsProduct"
                  name="detailsProduct"
                  placeholder="EJ: Hermoso peluche que es hecho por una persona mas hermosa aun"
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  value={detailsProduct || ""}
                  onChange={(e) => setDetailsProduct(e.target.value)}
                />
              </div>
            </div>
            <div className="div-input-modal-manage-product pt-2">
              <label className="label-add-product">Type</label>
              <div className="h-full w-full flex items-center div-input-modal-view-order">
                <Listbox value={selected} onChange={setSelected}>
                  <div className="h-full w-full relative mt-2">
                    <ListboxButton className="list-box-button-mp grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                      <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                        <span className="block truncate">{selected.name}</span>
                      </span>
                      <ChevronUpDownIcon
                        aria-hidden="true"
                        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-slate-50 py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                    >
                      {typeProductList.map((type: any) => (
                        <ListboxOption
                          key={type.id}
                          value={type}
                          className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                        >
                          <div className="flex items-center">
                            <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">
                              {type.name}
                            </span>
                          </div>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
            </div>
            <div className="div-input-modal-manage-product pt-2">
              <label className="label-add-product">Price</label>
              <div className="h-full w-full flex items-center div-input-modal-view-order">
                <input
                  id="price"
                  name="price"
                  placeholder="EJ: 30"
                  type="number"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  value={priceProduct || ""}
                  onChange={(e) => setPriceProduct(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pl-5 flex justify-between">
          <div className="w-full h-full flex">
            <button
              onClick={onClose}
              className="color-button flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium"
            >
              Back
              <IoMdArrowRoundBack className="mt-1 ml-2" />
            </button>
          </div>

          <div id="button-delete-add-product" className="w-full h-full flex">
            <button
              onClick={onDeleteProduct}
              className="color-button-delete flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium"
            >
              Delete
              <FaRegTrashCan className="mt-1 ml-2" />
            </button>
          </div>

          <div className="div-button-right-mvo">
            <button
              className="color-button flex items-center justify-center rounded-md border border-transparent px-3 py-3 text-base font-medium"
              onClick={saveNewProduct}
            >
              Save
              <FaSave className="mt-1 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrModalManageProduct;
