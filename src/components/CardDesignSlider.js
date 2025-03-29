import React, { useState } from "react";
import Slider from "react-slick";
import CardGenerator from "./CardGenerator";
import CardGeneratorBg from "./CardGeneratorBg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CardDesignSlider = ({
  selectedProducts = [],
  selectedQuota,
  customQuotaValue,
  selectedBanks,
  titleColor,
  selectedFont,
  titleFontSize,
  quotaFontSize,
  backgroundImage
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current) => setActiveSlide(current),
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <Slider {...settings}>
        <div>
          <CardGenerator
            selectedProducts={selectedProducts}
            selectedQuota={selectedQuota}
            customQuotaValue={customQuotaValue}
            selectedBanks={selectedBanks}
            titleColor={titleColor}
            selectedFont={selectedFont}
            titleFontSize={titleFontSize}
            quotaFontSize={quotaFontSize}
          />
        </div>
        <div>
          <CardGeneratorBg
            selectedProducts={selectedProducts}
            selectedQuota={selectedQuota}
            customQuotaValue={customQuotaValue}
            selectedBanks={selectedBanks}
            titleColor={titleColor}
            selectedFont={selectedFont}
            titleFontSize={titleFontSize}
            quotaFontSize={quotaFontSize}
            backgroundImage={backgroundImage}
          />
        </div>
      </Slider>
      <p style={{ textAlign: "center", marginTop: 12 }}>
        Vista {activeSlide === 0 ? "Clásica" : "Con Imagen de Fondo"}
      </p>
    </div>
  );
};

export default CardDesignSlider;
