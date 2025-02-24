import { FaSave } from "react-icons/fa";
import { TiCancel } from "react-icons/ti";
import { IoMdArrowRoundBack } from "react-icons/io";
import "./or-modal-manage-orders.css";
import { useEffect, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { db } from "../../config/firebase-config";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
const typeProduct = [
  {
    id: 0,
    name: "All",
  },
];

interface IStateOrder {
  id: string;
  name: string;
  desc: string;
}

const OrModalManageOrders = ({
  isOpen,
  onClose,
  orderSelected,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderSelected: {
    id: number;
    name: string;
  };
}) => {
  const [selected, setSelected] = useState(typeProduct[0]);
  const [stateOrderList, setStateOrderList] = useState<IStateOrder[]>([]);
  const stateOrderCollecionRef = collection(db, "stateOrders");

  useEffect(() => {
    getStateList();
    setSelected(orderSelected);
  }, []);

  const onDeleteOrder = async () => {
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
        deleteOrderConfirm(); // Llama a la función para eliminar la orden
      } else if (result.isDismissed) {
        // Si se presiona el botón de cancelar
        console.log("Cancelado por el usuario");
      }
    });
  };

  const deleteOrderConfirm = async () => {
    const orderSelectedRef = doc(db, "orders", String(orderSelected.id));
    // Eliminar el carrito después de crear el pedido
    await deleteDoc(orderSelectedRef);
    onClose();
  };

  const saveModifyOrder = () => {
    updateOrderState(orderSelected.id);
  };

  async function updateOrderState(orderId: any) {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      let arrayUpdateStates = [];

      let updatedStates = {
        date: data.states[0].date,
        state: selected.name,
      };

      arrayUpdateStates.push(updatedStates);
      // Guardamos el nuevo arreglo en Firestore
      await updateDoc(docRef, {
        states: arrayUpdateStates,
      });

      Swal.fire({
        position: "center",
        icon: "success",
        title: "State update",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      console.log("No existe un documento con ese ID");
    }
  }

  const getStateList = async () => {
    try {
      const data = await getDocs(stateOrderCollecionRef);
      const filteredData = data.docs.map((doc: any) => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: docData.name ?? "", // Asegúrate de que exista o usar array vacío
          desc: docData.desc ?? "",
        } as IStateOrder; // Forzamos a que coincida con la interfaz
      });
      setStateOrderList(filteredData);
    } catch (error) {}
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-modal-manage-orders" onClick={(e) => e.stopPropagation()}>
        <div className="div-main-modal-manage-orders">
          <div className="div-input-modal-manage-product pt-2">
            <label className="label-add-product">State</label>
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
                    {stateOrderList.map((type: any) => (
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
              onClick={onDeleteOrder}
              className="color-button-delete flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium"
            >
              Canceled
              <TiCancel className="mt-1 ml-2" />
            </button>
          </div>

          <div className="div-button-right-mvo">
            <button
              className="color-button flex items-center justify-center rounded-md border border-transparent px-3 py-3 text-base font-medium"
              onClick={saveModifyOrder}
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
export default OrModalManageOrders;
