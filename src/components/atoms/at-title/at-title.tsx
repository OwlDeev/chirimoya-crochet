import React from "react";
import "./at-title.css";

interface AtTitleProps {
  textTitle: string;
}

const Attitle: React.FC<AtTitleProps> = ({ textTitle }) => {
  return <p className="titleText">{textTitle}</p>;
};

export default Attitle;
