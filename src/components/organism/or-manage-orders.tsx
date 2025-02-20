import { useSearchParams } from "react-router-dom";
import "./or-manage-orders.css";
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase-config";

interface IManageOrders {}

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

export default function OrManageOrders({}: IManageOrders) {
  const [ordersList, setOrdersList] = useState<IOrder[]>([]);
  const ordersCollectionRef = collection(db, "orders");

  // Número de productos por página
  const productsPerPage = 4;
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

  useEffect(() => {
    getOrdersList();
  }, []);

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

  const openOrders = () => {
    return true
  };

  return (
    <div className="div-main-manage-orders">
      <div className="grid-container">
        <div className="grid-item">
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {currentOrders.map((order: any) => (
              <div
                className="card-order"
                onClick={() => {
                  openOrders()
                }}
              >
                <div className="property-card-order">
                  <label>State: {order.id} </label>
                  <label>Total: {order.total}</label>
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
    </div>
  );
}
