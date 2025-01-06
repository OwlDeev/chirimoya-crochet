import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "swiper/less";
import "swiper/less/navigation";
import "swiper/less/pagination";
import MlBuy from "./components/molecules/ml-buy";
import MlHero from "./components/molecules/ml-hero";
import MlNavbar from "./components/molecules/ml-navbar";
import MlCarrousel from "./components/molecules/ml-carrousel";
import AtTitle from "./components/atoms/at-title/at-title.tsx";
import MlFooter from "./components/molecules/ml-footer";
import MlBoutique from "./components/molecules/ml-boutique";
import MlCart from "./components/molecules/ml-cart";
import MlLogin from "./components/molecules/ml-login";
import MlViewDetail from "./components/organism/or-view-detail";
import OrCreateAccount from "./components/organism/or-create-account"
import { CartProvider, useCart } from "./components/context/cart-context"; // Importa el contexto y el hook

const imageUrl = "/assets/imgs/hero-test.jpg";

function AppContent() {
  const imgProps = {
    urlAction: "",
    title: "",
    media: imageUrl,
    altText: "",
  };

  const { isCartOpen } = useCart(); // Usa el hook para acceder a `isCartOpen`

  return (
    <div className="flex flex-col min-h-screen">
      <MlNavbar />
      {isCartOpen && <MlCart />}
      <div className="flex-grow mt-16">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <MlHero />
                <div className="flex h-full w-full divCarouselMain">
                  <AtTitle textTitle="BOUTIQUE" />
                  <MlCarrousel />
                </div>
              </>
            }
          />
          <Route
            path="/hacer-pedido"
            element={<AtTitle textTitle="Hacer Pedido" />}
          />
          <Route path="/buy" element={<MlBuy textTitle="Compra" />} />
          <Route
            path="/home"
            element={
              <>
                <MlHero />
                <div className="flex h-full w-full divCarouselMain">
                  <AtTitle textTitle="BOUTIQUE" />
                  <MlCarrousel />
                </div>
              </>
            }
          />
          <Route path="/boutique" element={<MlBoutique />} />
          <Route path="/login" element={<MlLogin />} />
          <Route path="/detail-order" element={<MlViewDetail />} />
          <Route path="/create-account" element={<OrCreateAccount />} />
        </Routes>
      </div>
      <MlFooter />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
