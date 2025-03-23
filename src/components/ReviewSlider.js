import React from "react";
import Slider from "react-slick";
import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const reviews = [
  {
    name: "Mejia Jara",
    review: "Me encantó! Es mi mejor aliado desde que tengo la app! Práctica y funcional.",
    rating: 5,
  },
  {
    name: "Elizabeth Martínez",
    review: "Un mil! Súper sencillo poder asesorar al cliente con toda la info a un solo toque.",
    rating: 4.5,
  },
  {
    name: "ig: Decretotuessen",
    review: "Rápida, clara y útil para todos. Solo faltaría ver toda la financiación en un solo link.",
    rating: 4.5,
    },
  {
    name: "Solu de Essen",
    review: "Holaa!! Increíble!! Me encanta.",
    rating: 4.5,
  },
  {
    name: "Marisel Chamorro",
    review: "La app está buenísima. Lo mejor: la calculadora de cuotas. También le sumaría poder elegir color de fondo en las placas.",
    rating: 5,
  },
];

const ReviewSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 600,
    centerMode: true,
    slidesToShow: 2,
    arrows: false,
    responsive: [
      {
        breakpoint: 960, // tablet
        settings: {
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 600, // mobile
        settings: {
          centerMode: false,
          slidesToShow: 1,
        },
      },
    ],
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;

    return (
      <>
        {Array(fullStars)
          .fill()
          .map((_, i) => (
            <StarIcon key={`star-${i}`} sx={{ color: "#ffb400" }} />
          ))}
        {halfStar && <StarHalfIcon sx={{ color: "#ffb400" }} />}
      </>
    );
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: "auto", mt: 5, mb: 5 }}>
      <Slider {...settings}>
        {reviews.map((item, index) => (
          <Box key={index} px={1}>
            <Card
              sx={{
                padding: 1,
                backgroundColor: "#f9f9f9",
                borderRadius: 3,
                boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
                    }}
                    className="card-coment"
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: "#765471", mr: 2 }}>
                    {item.name.charAt(0)}
                  </Avatar>
                  <Typography color={'#765471'} variant="h6">{item.name}</Typography>
                </Box>

                <Box display="none" mb={1}> 
                  {renderStars(item.rating)}
                </Box>

                <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                  “{item.review}”
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default ReviewSlider;
