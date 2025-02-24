import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./ml-carrousel.css";
import { Navigation, Pagination } from "swiper/modules";
import { db } from "../../config/firebase-config";
import { getDocs, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import MlModalProduct from "./ml-modal-product";
import { GrFormNextLink } from "react-icons/gr";
import { GrLinkPrevious } from "react-icons/gr";

export default function Example() {
  const productCollectionRef = collection(db, "productos");
  const [isModalOpen, setModalOpen] = useState(false);
  const [titleCard, setTitleCard] = useState("");
  const [idProduct, setIdProduct] = useState("");
  const [descCard, setDescCard] = useState("");
  const [imageAltCard, setImageAltCard] = useState("");
  const [price, setPrice] = useState(0);
  const [srcImage, setScrImage] = useState("");
  const closeModal = () => setModalOpen(false);
  const [productList, setProductList] = useState<
    {
      id: string;
      desc: string;
      href: number;
      imageAlt: string;
      name: string;
      price: number;
      srcImage: string;
    }[]
  >([]);

  useEffect(() => {
    getProductList();
  }, []);

  const getProductList = async () => {
    try {
      const data = await getDocs(productCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        desc: doc.data().desc || "", // Descripción del producto
        href: doc.data().href || 0, // Enlace del producto (predeterminado a "#")
        imageAlt: doc.data().imageAlt || "", // Texto alternativo de la imagen
        name: doc.data().name || "", // Nombre del producto
        price: doc.data().price || 0, // Precio del producto
        srcImage: doc.data().srcImage || "", // URL de la imagen
        type: doc.data().type || 0, // Tipo de producto
      }));
      setProductList(filteredData);
    } catch (error) {
      console.log(error);
    }
  };

  const openModal = (product: {
    title: string;
    description: string;
    imageAlt: string;
    srcImage: string;
    price: number;
    idProduct: string;
  }) => {
    setIdProduct(product.idProduct);
    setTitleCard(product.title);
    setDescCard(product.description);
    setImageAltCard(product.imageAlt);
    setScrImage(product.srcImage);
    setPrice(product.price);
    setModalOpen(true);
  };

  return (
    <div className="flex h-full w-full divCarousel p-10">
      <Swiper
        spaceBetween={16}
        slidesPerView={3}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        allowSlideNext
        allowSlidePrev
        pagination={{ clickable: true }}
        autoplay={{ delay: 500 }}
        modules={[Navigation, Pagination]}
        className="w-full"
      >
        {productList.map((product) => (
          <SwiperSlide key={product.id} className="cursor-pointer">
            <div className="group relative">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                <img
                  src={product.srcImage}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a
                      onClick={() =>
                        openModal({
                          idProduct: product.id,
                          title: product.name,
                          description: product.desc,
                          imageAlt: product.imageAlt,
                          srcImage: product.srcImage,
                          price: product.price,
                        })
                      }
                    >
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.desc}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {product.price + "€"}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Botones de navegación */}
      <div className="swiper-button-next">
        <GrFormNextLink />
      </div>
      <div className="swiper-button-prev">
        <GrLinkPrevious />
      </div>

      <MlModalProduct
        isOpen={isModalOpen}
        onClose={closeModal}
        title={titleCard}
        description={descCard}
        imageAlt={imageAltCard}
        srcImage={srcImage}
        price={price}
        idProduct={idProduct}
      ></MlModalProduct>
    </div>
  );
}
