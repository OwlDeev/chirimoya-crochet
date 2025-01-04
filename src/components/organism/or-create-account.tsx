import React, { useState } from "react";
import "./or-create-account.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import Swal from "sweetalert2";

interface OrCreateAccountProps {}

const OrCreateAccount: React.FC<OrCreateAccountProps> = () => {
  const navigate = useNavigate(); // Hook de React Router para la navegación
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name must have at least 2 characters"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  // Inicialización de Formik
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      setPassword(values.password);
      setEmail(values.email);
      setName(values.name);
      createUser(values.name, values.email, values.password);
    },
  });

  const createUser = async (
    parName: string,
    parEmail: string,
    parPassword: string
  ) => {
    try {
      Swal.fire({
        title: "Creating User...",
        html: "Please wait while we create your account.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(); // Inicia la animación de carga
        },
      });

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        parEmail,
        parPassword
      );
      const user = userCredential.user;

      // Crear un documento en la colección `user` con el UID del usuario
      await setDoc(
        doc(db, "user", user.uid),
        {
          uid: user.uid,
          email: user.email,
          fullname: parName, // Puedes dejar campos vacíos o requerir información adicional
          phone: phone,
        },
        { merge: true }
      );
      // Cerrar el SweetAlert2 de carga
      Swal.close();

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "Success!",
        text: "User created successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (error: any) {
      // Cerrar el SweetAlert2 de carga en caso de error
      Swal.close();

      // Mostrar error con SweetAlert2
      Swal.fire({
        title: "Error",
        text: `${error.message}`,
        icon: "error",
        confirmButtonText: "Try Again",
        timer: 4000,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6 text-center">Create User</h1>
      <form onSubmit={formik.handleSubmit}>
        {/* Input para Nombre */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={`mt-1 block w-full rounded-md border ${
              formik.touched.name && formik.errors.name
                ? "border-red-500"
                : "border-gray-300"
            } p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Enter your name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.name}</p>
          )}
        </div>

        {/* Input para Correo Electrónico */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`mt-1 block w-full rounded-md border ${
              formik.touched.email && formik.errors.email
                ? "border-red-500"
                : "border-gray-300"
            } p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
          )}
        </div>

        {/* Input para numero telefonico*/}
        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <PhoneInput
            country={"fr"} // País predeterminado
            value={phone}
            isValid
            onChange={(e) => setPhone(e)}
          />
        </div>

        {/* Input para Password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={`mt-1 block w-full rounded-md border ${
              formik.touched.password && formik.errors.password
                ? "border-red-500"
                : "border-gray-300"
            } p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Enter your name"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {formik.errors.password}
            </p>
          )}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create User
        </button>
      </form>
      <p className="mt-10 text-center text-xl text-gray-500">
        Already a member?{" "}
        <a
          href="#"
          onClick={() => {
            navigate("/login"); // Redirige al usuario a la página de login
          }}
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Login
        </a>
      </p>
    </div>
  );
};
export default OrCreateAccount;
