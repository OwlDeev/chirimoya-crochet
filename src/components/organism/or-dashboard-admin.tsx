import { useEffect } from "react";
import useState from "react-usestateref";
import { db } from "../../config/firebase-config"; // Importa tu configuración de Firebase
import { doc, getDoc } from "firebase/firestore";
import { getAuth, updatePassword, signOut } from "firebase/auth";
import "./or-dashboard-admin.css";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./or-dashboard-admin.css"

interface IDashboardAdmin {}

export default function OrDashboardAdmin({}: IDashboardAdmin) {
  const navigate = useNavigate(); // Hook de React Router para la navegación
  const auth = getAuth();

  const logOut = async () => {
    try {
      await signOut(auth);
      // setUserActive(null);
      console.log("Sesión cerrada correctamente");
      navigate("/home");
      window.location.reload(); // Recarga la página
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  return (
    <div className="div-main-dashboard-admin">
      <button
        type="button"
        className={`rounded-md color-button px-3 py-2 text-sm font-semibold text-white shadow-sm flex flex-row`}
        onClick={logOut}
      >
        Sign Out
        <div className="pt-1 pl-4 align-middle">
          <FaSignOutAlt />
        </div>
      </button>
    </div>
  );
}
