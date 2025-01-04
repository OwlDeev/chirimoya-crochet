import React from "react";
import "./ml-footer.css";
import { FaInstagramSquare, FaFacebookSquare } from "react-icons/fa";

interface MlFooterProps {
  media: any;
}

const MlFooter: React.FC<MlFooterProps> = () => {
  return (
    <div className="flex h-full w-full divMainFooter">
      <div className="flex h-full w-full mlFooterIzq">
        <p className="textRsFooter">FOLLOW US !</p>
        <a
          href="https://www.instagram.com/chirimoya.crochet/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagramSquare className="iconRsFooter" />
        </a>
        <a
          href="https://www.facebook.com/chirimoya.crochet"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebookSquare className="iconRsFooter" />
        </a>
      </div>
      <div className="flex h-full w-full mlFooterDer">
        <div className="flex h-full w-full justify-center items-center">
          <p className="textRsFooterDer">
            © 2024 OwlDeev. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MlFooter;
