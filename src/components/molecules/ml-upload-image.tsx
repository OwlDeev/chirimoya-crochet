import React, { useState } from "react";
import Swal from "sweetalert2";
import "./ml-upload-image.css";

const UploadImage = ({ onImageUpload }: { onImageUpload: (url: string) => void }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.chirimoyacrochet.com:5253/upload-image",
        {
          //   const response = await fetch("http://localhost:5253/upload-image", {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setImageUrl(data.url);
      console.log("Image uploaded:", data.url);

      // 📌 Pasamos la URL de la imagen al padre
      onImageUpload(data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  const loadingModal = () => {
    Swal.fire({
      title: "Upload image",
      didOpen: () => {
        Swal.showLoading();
      },
    });
    return <></>;
  };

  return (
    <div className="div-main-upload-image">
      {imageUrl && <img src={imageUrl} alt="Uploaded" width="100%" className="imageAddProducto" />}
      <input
        type="file"
        onChange={handleImageUpload}
        placeholder="Ex: image1.jpg"
        className="pt-2"
      />
      {loading && loadingModal()}
    </div>
  );
};

export default UploadImage;
