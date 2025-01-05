import React, { useEffect } from "react";
import useState from "react-usestateref";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./or-personal-detail.css";
import Swal from "sweetalert2";
import { GiConfirmed } from "react-icons/gi";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebase-config";

interface MlPersonalDetailProps {
  media: any;
  onSubmit: (values: { name: string; surname: string; email: string }) => void; // Función para pasar datos al componente padre
}

const MlPersonalDetail: React.FC<MlPersonalDetailProps> = ({ onSubmit }) => {
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario actual

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setCurrentUser(user); // Guardar el usuario autenticado
      } else {
        setCurrentUser(null); // Usuario no autenticado
      }
    });

    return () => unsubscribeAuth(); // Limpiar el listener al desmontar
  }, []);

  // Esquema de validación con Yup
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    surname: Yup.string().required("Surname is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });

  // Formik para manejar el formulario
  const formik = useFormik({
    initialValues: {
      name: "",
      surname: "",
      email: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (!currentUser) {
        // Guardar los productos actualizados en localStorage
        localStorage.setItem("guestPersonalDetail", JSON.stringify(values));
        onSubmit(values);
      } else {
        // Enviar los datos al componente padre
        onSubmit(values);

        // Mensaje de éxito con SweetAlert
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Details validated successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="pl-80 pr-80 pt-20">
      <div className="flex flex-row">
        <div className="w-full mr-4">
          <label
            htmlFor="name"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Name
          </label>
          <div className="mt-2">
            <input
              id="name"
              name="name"
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              placeholder="Example: John"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm">{formik.errors.name}</div>
            )}
          </div>
        </div>
        <div className="w-full ml-4">
          <label
            htmlFor="surname"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Surname
          </label>
          <div className="mt-2">
            <input
              id="surname"
              name="surname"
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              placeholder="Example: Snow"
              value={formik.values.surname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.surname && formik.errors.surname && (
              <div className="text-red-500 text-sm">
                {formik.errors.surname}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="email"
          className="block text-sm/6 font-medium text-gray-900"
        >
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
            placeholder="Example: john.snow@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-sm">{formik.errors.email}</div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-row-reverse">
        <button
          type="submit"
          className="flex flex-row color-button rounded-md border border-transparent px-6 py-3 text-base font-medium"
        >
          Confirm and Next
          <GiConfirmed className="mt-1 ml-2" />
        </button>
      </div>
    </form>
  );
};

export default MlPersonalDetail;
