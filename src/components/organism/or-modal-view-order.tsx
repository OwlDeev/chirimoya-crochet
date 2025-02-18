import React, { useState } from "react";
import "./or-modal-view-order.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const OrModalViewOrder = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [orderId, setOrderId] = useState("");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="div-main-modal-view-order">
          <div className="h-full items-center whitespace-nowrap inline-block w-max">
            <h1>Search order: </h1>
          </div>
          <div className="h-full w-full flex items-center div-input-modal-view-order">
            <input
              id="orderId"
              name="orderId"
              placeholder="EJ: 123456789"
              type="text"
              autoComplete="orderId"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              value={orderId || ""}
              onChange={(e) => setOrderId(e.target.value)}
            />
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

          <div className="div-button-right-mvo">
            <Link
              to="/detail-order"
              state={{ orderId: orderId }}
              className="color-button flex items-center justify-center rounded-md border border-transparent px-3 py-3 text-base font-medium"
              onClick={onClose}
            >
              Search
              <FaSearch className="mt-1 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrModalViewOrder;
