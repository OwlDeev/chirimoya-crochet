import { useSearchParams } from "react-router-dom";
import "./or-manage-orders.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase-config";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import OrModalManageOrders from "./or-modal-manage-orders";
import Swal from "sweetalert2";

interface IManageOrders { }

interface IOrderItem {
  description: string;
  id: string;
  price: number;
  quantity: number;
  srcImage: string;
  title: string;
}

interface IPersonalDetail {
  email: string;
  name: string;
  surname: string;
}

interface IShipping {
  address: string;
  apartment: string;
  city: string;
  country: string;
  phone: string;
  postalCode: string;
}

interface IOrderState {
  date: string;
  state: string;
  timestamp: any; // o Date, si lo conviertes a Date
}

export interface IOrder {
  id: string;
  items: IOrderItem[];
  personalDetail: IPersonalDetail;
  shipping: IShipping;
  states: IOrderState[];
  total: number;
  userId: string;
}

interface IStateOrder {
  id: number;
  name: string;
  desc: string;
}

export default function OrManageOrders({ }: IManageOrders) {
  const [ordersList, setOrdersList] = useState<IOrder[]>([]);
  const [stateOrderList, setStateOrderList] = useState<IStateOrder[]>([]);
  const ordersCollectionRef = collection(db, "orders");
  const stateOrderCollecionRef = collection(db, "stateOrders");
  const [selected, setSelected] = useState<IStateOrder>();
  const [orderIdAdmin, setOrderIdAdmin] = useState("");
  const [orderSelected, setOrderSelected] = useState({
    id: 0,
    name: "",
  });

  // Número de productos por página
  const productsPerPage = 3;
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para la página actual
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular índices para hacer slice al arreglo
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentOrders = ordersList.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Calcular el total de páginas
  const totalPages = Math.ceil(ordersList.length / productsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    getOrdersList();
    getStateList();
  }, []);

  const getStateList = async () => {
    try {
      const data = await getDocs(stateOrderCollecionRef);
      const filteredData = data.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: docData.id,
          name: docData.name ?? "", // Asegúrate de que exista o usar array vacío
          desc: docData.desc ?? "",
        } as IStateOrder; // Forzamos a que coincida con la interfaz
      });
      setStateOrderList(filteredData);
    } catch (error) { }
  };

  const getOrdersList = async () => {
    try {
      const data = await getDocs(ordersCollectionRef);
      const filteredData = data.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          items: docData.items ?? [], // Asegúrate de que exista o usar array vacío
          personalDetail: docData.personalDetail ?? {},
          shipping: docData.shipping ?? {},
          states: docData.states ?? [],
          total: docData.total ?? 0,
          userId: docData.userId ?? "",
        } as IOrder; // Forzamos a que coincida con la interfaz
      });
      setOrdersList(filteredData);
    } catch (error) {
      console.log(error);
    }
  };

  const openOrders = (id: number, name: string) => {
    setOrderSelected({ id, name });
    toggleModal();
  };

  const searchOrders = async () => {
    try {
      // 1. Si se ingresa un ID, se obtiene directamente ese documento:
      if (orderIdAdmin.trim() !== "") {
        const docRef = doc(db, "orders", orderIdAdmin.trim());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() } as IOrder;
          setOrdersList([orderData]);
        } else {
          console.log("No existe un documento con ese ID");
          setOrdersList([]);
        }
        return; // Salimos de la función, pues ya se realizó la búsqueda por ID
      }

      // 2. Si no hay ID, construimos la query con los filtros disponibles:
      const ordersRef = collection(db, "orders");
      const queryConstraints: any[] = [];

      // Filtro por estado (suponiendo que 'currentState' es un campo en tus órdenes)
      if (selected && selected.id !== 0) {
        // Aquí, por ejemplo, se compara con el nombre del estado.
        queryConstraints.push(where("state", "==", selected.name));
      }

      // Filtro por rango de fechas usando el campo "timestamp"
      if (startDate && endDate) {
        const startTs = Timestamp.fromDate(startDate);
        const endTs = Timestamp.fromDate(endDate);
        queryConstraints.push(where("timestamp", ">=", startTs));
        queryConstraints.push(where("timestamp", "<=", endTs));
      }

      // Si no se aplican filtros, se obtienen todas las órdenes.
      const q = query(ordersRef, ...queryConstraints);

      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as IOrder[];
      setOrdersList(orders);
    } catch (error) {
      console.error("Error al buscar órdenes:", error);
    }
  };

  // const searchOrders = async () => {
  //   if (
  //     (orderIdAdmin === "" || orderIdAdmin === " ") &&
  //     (selected == undefined || selected?.id == 0) &&
  //     (startDate == null && endDate == null)
  //   ) {
  //     getOrdersList();
  //   } else if (
  //     (orderIdAdmin !== "") &&
  //     (selected == undefined || selected?.id == 0) &&
  //     (startDate == null && endDate == null)) {
  //     const docRef = doc(db, "orders", orderIdAdmin);
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       const orderData = docSnap.data();
  //       if (orderData) {
  //         orderData.id = orderIdAdmin;
  //         setOrdersList([orderData as IOrder]);
  //       } else {
  //         setOrdersList([]);
  //       }
  //     } else {
  //       console.log("No existe un documento con ese ID");
  //     }
  //   }else if(
  //     (orderIdAdmin === "" || orderIdAdmin === " ") &&
  //     (selected !== undefined && selected.id !== 0) &&
  //     (startDate == null && endDate == null)
  //   ){
  //     const docRef = doc(db, "orders", orderIdAdmin);
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       const orderData = docSnap.data();
  //       if (orderData) {
  //         orderData.id = orderIdAdmin;
  //         setOrdersList([orderData as IOrder]);
  //       } else {
  //         setOrdersList([]);
  //       }
  //     } else {
  //       console.log("No existe un documento con ese ID");
  //     }
  //   }
  // };

  const deleteOrders = (orderId: any) => {
    Swal.fire({
      position: "center",
      icon: "question",
      title: "Are you sure of delete the order",
      showConfirmButton: true,
      confirmButtonText: "Delete Order",
      confirmButtonColor: "#f80400",
      cancelButtonText: "Cancel",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Si se presiona el botón de confirmar
        deleteOrderConfirm(orderId); // Llama a la función para eliminar la orden
      } else if (result.isDismissed) {
        // Si se presiona el botón de cancelar
        console.log("Cancelado por el usuario");
      }
    });
  };

  const deleteOrderConfirm = async (orderId: string) => {
    await deleteDoc(doc(db, "orders", orderId)); // Elimina la orden por su ID
    getOrdersList();
  };

  const toggleModal = () => {
    // resetProduct();
    setIsModalOpen(!isModalOpen);
    getOrdersList();
  };

  return (
    <div className="div-main-manage-orders">
      <div className="grid-container">
        <div className="grid-item">
          <div className="div-search-manage-orders">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Search Orders
            </h2>
            <div className="div-filter-search">
              <div className="w-full h-full">
                <label
                  htmlFor="username"
                  className="pb-0 flex flex-col-reverse text-sm/6 font-medium text-gray-900"
                >
                  Number Order
                </label>
                <div className="relative mt-2">
                  <input
                    id="orderIdAdmin"
                    name="orderIdAdmin"
                    type="text"
                    className="input-name-product flex bg-transparent py-2.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                    placeholder="Ej: 123ASDASD123123"
                    value={orderIdAdmin || ""}
                    onChange={(e) => setOrderIdAdmin(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full h-full div-listbox-manage-products">
                <Listbox value={selected} onChange={setSelected}>
                  <Label className="block text-sm/6 font-medium text-gray-900">
                    State
                  </Label>
                  <div className="relative mt-2">
                    <ListboxButton className="list-box-button-mp grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                      <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                        <span className="block truncate">
                          {selected?.name || "All"}
                        </span>
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
                      {stateOrderList.map((type: any) => (
                        <ListboxOption
                          key={type.id}
                          value={type}
                          className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                        >
                          <div className="flex items-center">
                            <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">
                              {type?.name || ""}
                            </span>
                          </div>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
              <div className="mt-2 pl-2">
                <label
                  htmlFor="username"
                  className="pb-0 flex flex-col-reverse text-sm/6 font-medium text-gray-900"
                >
                  Date
                </label>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update: any) => {
                    setDateRange(update);
                  }}
                  isClearable={true}
                  placeholderText="Selecciona el rango de fechas"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="div-button-action-manage-orders">
            <div></div>
            <button className="button-cart" onClick={searchOrders}>
              Search
            </button>
          </div>
        </div>
        <div className="grid-item grid-item-order">
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {currentOrders.map((order: any) => (
              <div className="card-order">
                <div className="property-card-order">
                  <div className="w-full h-full flex">
                    <label className="w-1/2">Number:</label>
                    <label className="w-full">{order.id}</label>
                  </div>
                  <div className="w-full h-full flex">
                    <label className="w-1/2">Client:</label>
                    <label className="w-full">
                      👤{order.personalDetail.name}{" "}
                      {order.personalDetail.surname}
                    </label>
                  </div>
                  <div className="w-full h-full flex">
                    <label className="w-1/2">Date:</label>
                    <label className="w-full">📅{order.states[0].date} </label>
                  </div>
                  <div className="w-full h-full flex">
                    <label className="w-1/2">Total:</label>
                    <label className="w-full">💰{order.total}</label>
                  </div>
                  <div className="w-full h-full flex">
                    <label className="w-1/2">State:</label>
                    <label className="w-full">
                      🚦
                      {order.states[0].state == "Pending"
                        ? "🔴 " + order.states[0].state
                        : order.states[0].state == "In Progress"
                          ? "🟡 " + order.states[0].state
                          : "🟢 " + order.states[0].state}
                    </label>
                  </div>
                  <div className="w-full h-full flex">
                    <label className="w-1/2">Products:</label>
                    <label className="w-full">
                      <ul className="list-none pl-0">
                        {order.items.map((product: any, index: number) => (
                          <li key={index}>
                            {product.quantity}x {product.title}
                          </li>
                        ))}
                      </ul>
                    </label>
                  </div>

                  <div className="w-full h-full flex">
                    <label className="w-1/2">Shipping:</label>
                    <label className="w-full">
                      📦{order.shipping.address} , {order.shipping.city}
                    </label>
                  </div>
                  <div className="flex flex-row justify-between">
                    <button
                      name="deleteButton"
                      className="button-cart-delete-add-product"
                      onClick={() => {
                        deleteOrders(order.id);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      name="modifyButton"
                      className="button-cart"
                      onClick={() => {
                        openOrders(order.id, order.states[0].state);
                      }}
                    >
                      Modify
                    </button>
                  </div>
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
                className={`px-4 py-2 rounded ${currentPage === i + 1
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
        <OrModalManageOrders
          isOpen={isModalOpen}
          onClose={toggleModal}
          orderSelected={orderSelected}
        />
      )}
    </div>
  );
}
