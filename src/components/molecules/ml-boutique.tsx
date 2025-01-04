"use client";

import { useEffect, useState } from "react";
import { db } from "../../config/firebase-config";
import { getDocs, collection } from "firebase/firestore";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  FunnelIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import "./ml-boutique.css";
import MlModalProduct from "./ml-modal-product";

const sortOptions = [
  { name: "Most Popular", href: "#", current: true },
  { name: "Price: Low to High", href: "#", current: false },
  { name: "Price: High to Low", href: "#", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [productList, setProductList] = useState<
    {
      id: string;
      desc: string;
      href: number;
      imageAlt: string;
      name: string;
      price: number;
      srcImage: string;
    }[]
  >([]);
  const [typeList, setTypeList] = useState<
    {
      id: string;
      name: string;
      href: number;
    }[]
  >([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [titleCard, setTitleCard] = useState("")
  const [idProduct, setIdProduct] = useState("")
  const [descCard, setDescCard] = useState("")
  const [imageAltCard,setImageAltCard] =useState("")
  const [srcImage, setScrImage] = useState("")
  const [price, setPrice] = useState(0)

  const productCollectionRef = collection(db, "productos");
  const typeProductRef = collection(db, "tipoProducto");

  useEffect(() => {
    const getTypeProductList = async () => {
      try {
        const data = await getDocs(typeProductRef);
        const filteredData = data.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "", // Nombre del producto
          href: doc.data().href,
        }));
        setTypeList(filteredData);
      } catch (error) {
        console.log(error);
      }
    };
    getProductList();
    getTypeProductList();
  }, []);

  const getProductList = async () => {
    try {
      const data = await getDocs(productCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        desc: doc.data().desc || "", // Descripción del producto
        href: doc.data().href || 0, // Enlace del producto (predeterminado a "#")
        imageAlt: doc.data().imageAlt || "", // Texto alternativo de la imagen
        name: doc.data().name || "", // Nombre del producto
        price: doc.data().price || 0, // Precio del producto
        srcImage: doc.data().srcImage || "", // URL de la imagen
        type: doc.data().type || 0, // Tipo de producto
      }));
      setProductList(filteredData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (filterActive) {
      // getProductList();
      switch (nameFilter) {
        case "Most Popular":
          // Lógica para "Most Popular"
          const sortedProductList = productList.sort(
            (a, b) => b.price - a.price
          );
          setProductList(sortedProductList);
          break;

        case "Price: Low to High":
          // Lógica para ordenar por "Precio: de menor a mayor"
          const sortedProductListAsc = productList.sort(
            (a, b) => a.price - b.price
          );
          setProductList(sortedProductListAsc);
          break;

        case "Price: High to Low":
          // Lógica para ordenar por "Precio: de mayor a menor"
          const sortedProductListDesc = productList.sort(
            (a, b) => b.price - a.price
          );
          setProductList(sortedProductListDesc);
          break;

        default:
          break;
      }
      setFilterActive(false);
    }
  }, [filterActive]);

  const filterClick = (name: string) => {
    setNameFilter(name);
    setFilterActive(true);
  };

  const categoryOnClik = async (href: number) => {
    await getProductList(); // Espera a que se complete la obtención de datos
    if (href !== 0) {
      setProductList((prevList) =>
        prevList.filter((product) => product.href === href)
      );
    }
  };

  const openModal = (product: { title: string; description: string; imageAlt:string; srcImage:string; price:number; idProduct:string }) => {
    setIdProduct(product.idProduct)
    setTitleCard(product.title)
    setDescCard(product.description)
    setImageAltCard(product.imageAlt)
    setScrImage(product.srcImage)
    setPrice(product.price)
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <Dialog
          open={mobileFiltersOpen}
          onClose={setMobileFiltersOpen}
          className="relative z-40 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 z-40 flex">
            <DialogPanel
              transition
              className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="-mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>

              {/* Filters */}
              <form className="mt-4 border-t border-gray-200">
                <h3 className="sr-only">Categories</h3>
                <ul role="list" className="px-2 py-3 font-medium text-gray-900">
                  {typeList.map((category) => (
                    <li key={category.name}>
                      <a className="block px-2 py-3">{category.name}</a>
                    </li>
                  ))}
                </ul>
              </form>
            </DialogPanel>
          </div>
        </Dialog>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Products
            </h1>

            <div className="flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                    />
                  </MenuButton>
                </div>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <MenuItem key={option.name}>
                        <a
                          href={option.href}
                          onClick={() => filterClick(option.name)}
                          className={classNames(
                            option.current
                              ? "font-medium text-gray-900"
                              : "text-gray-500",
                            "block px-4 py-2 text-sm data-[focus]:bg-gray-100 data-[focus]:outline-none"
                          )}
                        >
                          {option.name}
                        </a>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>

              <button
                type="button"
                className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7"
              >
                <span className="sr-only">View grid</span>
                <Squares2X2Icon aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
              >
                <span className="sr-only">Filters</span>
                <FunnelIcon aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              {/* Filters */}
              <form className="hidden lg:block">
                <h3 className="sr-only">Categories</h3>
                <ul
                  role="list"
                  className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900"
                >
                  {typeList.map((category) => (
                    <li key={category.name}>
                      <a href="#" onClick={() => categoryOnClik(category.href)}>
                        {category.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </form>

              {/* Product grid */}
              {productList && (
                <div className="lg:col-span-3">
                  {
                    /* Your content */
                    <div className="bg-white">
                      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                        {/* <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customers also purchased</h2> */}

                        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                          {productList.map((product: any) => (
                            <div
                              key={product.id}
                              className="group relative cursor-pointer"
                              onClick={() =>
                                openModal({
                                  idProduct:product.id,
                                  title: product.name,
                                  description:product.desc,
                                  imageAlt: product.imageAlt,
                                  srcImage: product.srcImage,
                                  price: product.price
                                })
                              }
                            >
                              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                                <img
                                  alt={product.imageAlt}
                                  src={product.srcImage}
                                  className="size-full object-cover object-center lg:size-full"
                                />
                              </div>
                              <div className="mt-4 flex justify-between">
                                <div>
                                  <h3 className="text-sm text-gray-700">
                                    <a>
                                      <span
                                        aria-hidden="true"
                                        className="absolute inset-0"
                                      />
                                      {product.name}
                                    </a>
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {product.desc}
                                  </p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  {product.price + "€"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      <MlModalProduct
        isOpen={isModalOpen}
        // product={selectedProduct}
        onClose={closeModal}
        title={titleCard}
        description={descCard}
        imageAlt={imageAltCard}
        srcImage={srcImage}
        price={price}
        idProduct={idProduct}
      ></MlModalProduct>
    </div>
  );
}
