import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./or-shipping.css";
import ReactFlagsSelect from "react-flags-select";
import PhoneInput from "react-phone-input-2";
import Swal from "sweetalert2";
import { IoBagCheck } from "react-icons/io5";


interface MlShippingProps {
  onSubmit: (values: {
    address: string;
    apartment: string;
    country: string;
    city: string;
    phone: string;
    postalCode: string;
  }) => void;
}

const MlShipping: React.FC<MlShippingProps> = ({ onSubmit }) => {
  // Esquema de validación con Yup
  const validationSchema = Yup.object({
    address: Yup.string().required("Address is required"),
    apartment: Yup.string().required("Apartment is required"),
    country: Yup.string().required("Country is required"),
    city: Yup.string().required("City is required"),
    phone: Yup.string()
      .required("Phone is required")
      .matches(/^\d+$/, "Phone must be a valid number"),
    postalCode: Yup.string()
      .required("Postal code is required")
      .matches(/^\d+$/, "Postal code must be numeric"),
  });

  // Inicializar Formik
  const formik = useFormik({
    initialValues: {
      address: "",
      apartment: "",
      country: "",
      city: "",
      phone: "",
      postalCode: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Enviar los datos al componente padre
      onSubmit(values);

      // Mensaje de éxito con SweetAlert
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Shipping details validated successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="pl-80 pr-80 pt-20">
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-900">
          Address
        </label>
        <div className="mt-2">
          <input
            id="address"
            name="address"
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            placeholder="Example: Saint Vincent 1414, Lyon"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.address && formik.errors.address && (
            <div className="text-red-500 text-sm">{formik.errors.address}</div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="apartment" className="block text-sm font-medium text-gray-900">
          Apartment, suite, etc.
        </label>
        <div className="mt-2">
          <input
            id="apartment"
            name="apartment"
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            placeholder="Example: Apartment 1B"
            value={formik.values.apartment}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.apartment && formik.errors.apartment && (
            <div className="text-red-500 text-sm">{formik.errors.apartment}</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-row">
        <div className="w-full">
          <label htmlFor="country" className="block text-sm font-medium text-gray-900">
            Country
          </label>
          <ReactFlagsSelect
            selected={formik.values.country}
            onSelect={(value) => formik.setFieldValue("country", value)}
            searchable
            searchPlaceholder="Search countries 🔎"
            className="w-full"
          />
          {formik.touched.country && formik.errors.country && (
            <div className="text-red-500 text-sm">{formik.errors.country}</div>
          )}
        </div>
        <div className="w-full ml-4">
          <label htmlFor="city" className="block text-sm font-medium text-gray-900">
            City
          </label>
          <div className="mt-2">
            <input
              id="city"
              name="city"
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              placeholder="Example: Lyon"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.city && formik.errors.city && (
              <div className="text-red-500 text-sm">{formik.errors.city}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-row">
        <div className="w-full">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
            Phone
          </label>
          <PhoneInput
            country="us"
            value={formik.values.phone}
            onChange={(value) => formik.setFieldValue("phone", value)}
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className="text-red-500 text-sm">{formik.errors.phone}</div>
          )}
        </div>
        <div className="w-full ml-4">
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-900">
            Postal code
          </label>
          <div className="mt-2">
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              placeholder="Example: 65003"
              value={formik.values.postalCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.postalCode && formik.errors.postalCode && (
              <div className="text-red-500 text-sm">{formik.errors.postalCode}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-row-reverse">
        <button
          type="submit"
          className="flex flex-row color-button rounded-md border border-transparent px-6 py-3 text-base font-medium"
        >
          Buy
          <IoBagCheck className="mt-1 ml-2"/>
        </button>
      </div>
    </form>
  );
};

export default MlShipping;
