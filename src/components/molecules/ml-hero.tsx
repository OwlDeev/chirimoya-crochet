import React from "react";
import "./ml-hero.css";
import { Link, useNavigate } from "react-router-dom";
import { GiClothes } from "react-icons/gi";

const MlHero: React.FC = () => {
  const navigate = useNavigate(); // Hook de React Router para la navegación

  return (
    <div className="div-main relative w-full h-full">
      {/* Contenedor Principal */}
      <div className="relative w-full h-full">
        <img
          src="/assets/imgs/hero-test.jpg"
          alt="Hero Test"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => {
            navigate("/boutique"); // Redirige al usuario a la página de login
          }}
        />
        {/* Botón Centrado Horizontalmente y Abajo */}
        <button
          onClick={() => {
            navigate("/boutique"); // Redirige al usuario a la página de login
          }}
          className="absolute button-cart-hero bottom-4 text-white px-3 py-3 rounded mb-28"
        >
          {
            <div className="flex flex-row">
              GALLERY<GiClothes className="mt-2 ml-2"></GiClothes>
            </div>
          }
        </button>
      </div>
    </div>
  );
};

export default MlHero;
