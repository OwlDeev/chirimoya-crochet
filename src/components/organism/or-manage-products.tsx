import { useEffect } from "react";
import useState from "react-usestateref";
import { db } from "../../config/firebase-config"; // Importa tu configuración de Firebase
import "./or-manage-products.css";
import { getDocs, collection } from "firebase/firestore";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import OrModalManageProduct from "./or-modal-add-product";

interface IManageProducts {}

const typeProduct = [
  {
    id: 0,
    name: "All",
  },
  {
    id: 1,
    name: "Clothes",
  },
  {
    id: 2,
    name: "Amigorumi",
  },
  {
    id: 3,
    name: "Totebag",
  },
];

export default function OrManageProducts({}: IManageProducts) {
  // Número de productos por página
  const productsPerPage = 4;
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para la página actual
  const [currentPage, setCurrentPage] = useState(1);
  const productCollectionRef = collection(db, "productos");
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
  const [selected, setSelected] = useState(typeProduct[0]);

  // Calcular índices para hacer slice al arreglo
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productList.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Calcular el total de páginas
  const totalPages = Math.ceil(productList.length / productsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  useEffect(() => {
    getProductList();
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
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    getProductList();
  };

  return (
    <div className="div-main-manage-products">
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="div-search-manage-product">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Search product
            </h2>
            <div className="div-filter-search">
              <div className="w-full h-full">
                <label
                  htmlFor="username"
                  className="pb-0 flex flex-col-reverse text-sm/6 font-medium text-gray-900"
                >
                  Name
                </label>
                <div className="relative mt-2">
                  <input
                    id="productNameAdmin"
                    name="productNameAdmin"
                    type="text"
                    className="input-name-product flex bg-transparent py-2.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                    placeholder="Ej: Totebag cute"
                    // value={"fullname" || ""}
                    // onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full h-full pl-2">
                <Listbox value={selected} onChange={setSelected}>
                  <Label className="block text-sm/6 font-medium text-gray-900">
                    Type
                  </Label>
                  <div className="relative mt-2">
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
                      {typeProduct.map((type) => (
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
          </div>

          <div className="div-button-action">
            <button className="button-cart" onClick={toggleModal}>Add product</button>
            <button className="button-cart">Search</button>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Products
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {currentProducts.map((product) => (
              <div key={product.id} className="group relative">
                <img
                  alt={product.imageAlt}
                  src={product.srcImage}
                  className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                />
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <a href={String(product.href) || ""}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.desc}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Back
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <OrModalManageProduct isOpen={isModalOpen} onClose={toggleModal} />
      )}
    </div>
  );
}
