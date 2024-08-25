import React from "react";
import AtButton from "../atoms/at-button/at-button";
import "./ml-hero.css"

interface MlHeroProps {
  media: any;
}

const MlHero: React.FC<MlHeroProps> = () => {
  return (
    <div className="flex h-full w-full">
      <div className="bg-hero-image flex h-full w-full">
        <div className="flex h-full w-full justify-center items-center">
          <AtButton
            text="Revisar productos"
            color="red"
            urlAction="click"
          ></AtButton>
        </div>
      </div>
    </div>
  );
};

export default MlHero;
