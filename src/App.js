import "./App.css";
// import AtImage from './components/atoms/at-image/at-image.tsx';
// import AtButton from './components/atoms/at-button/at-button.tsx'
import MlHero from "./components/molecules/ml-hero";
import MlNavbar from "./components/molecules/ml-navbar";
const imageUrl = "/assets/imgs/hero-test.jpg";

function App() {
  const imgProps = {
    urlAction: "",
    title: "",
    media: imageUrl,
    altText: "",
  };

  const buttonProps = {
    text: "prueba",
  };

  console.log(imgProps);
  return (
    <div className="h-screen">
      <MlNavbar></MlNavbar>
      <MlHero></MlHero>
    </div>
  );
}

export default App;
