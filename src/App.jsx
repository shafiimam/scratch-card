import { Typography, Box, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import { getFontStyle } from "./utils/index";
import Scratch from './Scratch';
function App() {
  const [discountApplied, setDiscountApplied] = useState(false);
  const [scratchCardImage, setScratchCardImage] = useState(null);
  const [scWidth, setScWidth] = useState(100);
  let shopConfigData = localStorage.getItem("scratchCardConfig");
  shopConfigData = JSON.parse(shopConfigData);
  const { shopConfig, discountCodes } = shopConfigData;

  const {
    "border-color": borderColor,
    "bg-color": bgColor,
    height,
    "text-color": textColor,
    "border-radius": borderRadius,
    "border-width": borderWidth,
    "font-size": fontSize,
    "selected-title-font-style": titleFontStyle,
    "title-font-size": titleFontSize,
    "title-text-align-center": titleTextAlignCenter,
    "sub-title": subtitle,
    "sub-title-font-size": subtitleFontSize,
    "sub-title-text-align-center": subtitleTextAlignCenter,
    "selected-sub-title-font-style": subTitleFontStyle,
    "selected-scratch-card-style": scratchCardStyle,
    title,
    "sub-title": subTitle,
    "cusom-scratch-card-selected": customScratchCardSelected,
    "selected-custom-card-image": selectedCustomCardImage,
    "selected-devices": selectedDevices,
  } = shopConfig;

  const currentSessionCodeIndex = Math.floor(Math.random() * 4);
  let currentIndex = localStorage.getItem("currentSessionScratchCardCode");
  if (currentIndex === null || currentIndex === undefined) {
    localStorage.setItem(
      "currentSessionScratchCardCode",
      currentSessionCodeIndex
    );
  }
  const codeToShow = discountCodes[Number(currentIndex)];
  let currentProductHandle = localStorage.getItem("productHandle");
  const productSelection = shopConfig["product-selection"];
  const selectedProducts = shopConfig["selected-products"];
  let isSelectedProducts = productSelection === "selected-products";
  let willShowWidget = true;
  let containerRef = useRef(null);
  let scRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      setScWidth(containerRef.current.offsetWidth);
    }
    return () => {};
  }, []);

  let deviceWidth = window.innerWidth;
  console.log('device width',deviceWidth);
  let isMobile = deviceWidth < 600;
  console.log('is mobile device', isMobile);
  if (isSelectedProducts) {
    willShowWidget = selectedProducts.some(
      (product) => product.handle === currentProductHandle
    );
  }

  if (selectedDevices.includes("mobile") && isMobile) {
    console.log("for mobile");
    willShowWidget = true;
  } else if (selectedDevices.includes("desktop") && !isMobile) {
    console.log("for desktop");
    willShowWidget = true;
  } else {
    console.log("for none");
    willShowWidget = false;
  }

  useEffect(() => {
    if (willShowWidget) {
      console.log({ scWidth });
      let seletectedCustomScratchCardStyle = customScratchCardSelected;
      if (seletectedCustomScratchCardStyle) {
        console.log(
          "custom scratch card selected",
          seletectedCustomScratchCardStyle
        );
        const canvas = document.querySelector(".ScratchCard__Canvas");
        const scratchCard = new Scratch(canvas, selectedCustomCardImage,scWidth,height);
        scratchCard.render();
        setScratchCardImage(selectedCustomCardImage);
      } else {
        const imagesrc = `https://cdn.jsdelivr.net/gh/shafiimam/scratch-card-app/scratch-card-style/${scratchCardStyle
          .split(" ")
          .join("-")}.png`;
        console.log(
          "scratch card style selected",
          `https://cdn.jsdelivr.net/gh/shafiimam/scratch-card-app/scratch-card-style/${scratchCardStyle
            .split(" ")
            .join("-")}.png`
        );
        setScratchCardImage(
          `https://cdn.jsdelivr.net/gh/shafiimam/scratch-card-app/scratch-card-style/${scratchCardStyle
            .split(" ")
            .join("-")}.png`
        );
        const canvas = document.querySelector(".ScratchCard__Canvas");
        const scratchCard = new Scratch(canvas, imagesrc, scWidth, height);
        scratchCard.render();
      }
    }
  }, [willShowWidget, scWidth]);

  const applyDiscount = async () => {
    const cartRes = await fetch("/cart.js");
    const cartData = cartRes.json();
    const previousAttributes = cartData.attributes;
    const cartItemCount = cartData.item_count;
    if (cartItemCount === 0) {
      alert("Add one or more item in cart first!");
      return;
    }
    await fetch(`/discount/${codeToShow}`)
      .then((res) => {
        setDiscountApplied(true);
        fetch("/cart/update.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attributes: {
              ...previousAttributes,
              addedby: "scratch-card-app",
            },
          }),
        });
      })
      .catch((err) => setDiscountApplied(true));
  };

  const titleFontStyleToUse = getFontStyle(titleFontStyle);
  const subTitleFontStyleToUse = getFontStyle(subTitleFontStyle);
  let contentToRender = null;
  console.log("scratch card image", scratchCardImage);
  if (willShowWidget) {
    console.log("widget will show");
    contentToRender = (
      <Box className='scratch-card-app' ref={containerRef}>
        <Typography
          sx={{
            ...titleFontStyleToUse,
            width: '100%',
            fontSize: `${titleFontSize}px`,
            textAlign: titleTextAlignCenter && 'center',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            ...subTitleFontStyleToUse,
            width: '100%',
            fontSize: `${subtitleFontSize}px`,
            textAlign: subtitleTextAlignCenter && 'center',
          }}
        >
          {subTitle}
        </Typography>
        <Box
          className='root-container-sc'
          sx={{
            marginTop: '10px',
            marginBottom: '10px',
            border: `${borderWidth}px solid ${borderColor}`,
            borderRadius: `${borderRadius}px`,
            width: `100%`,
            height: `${height}px !important`,
            zIndex: 4,
            backgroundColor: bgColor,
            '.ScratchCard__Canvas': {
              borderRadius: `${borderRadius-5}px`,
              MozBorderRadius: `${borderRadius}px`,
              overflow: 'hidden',
              zIndex: 1,
            },
          }}
        >
          <Box
            className='ScratchCard__Container'
            sx={{
              position: 'relative',
              height: '100%',
            }}
          >
            <canvas
              width={scWidth}
              height={height}
              id='scratch'
              className='ScratchCard__Canvas'
              style={{
                position: 'absolute',
                userSelect: 'none',
              }}
            ></canvas>
            <Box
              className='sc-code-container'
              sx={{
                display: 'none',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                margin: '0 auto',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: `${borderRadius}px`,
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  fontSize: `${fontSize}px`,
                  color: textColor,
                }}
              >
                {codeToShow}
              </Typography>
              <Button
                variant='text'
                sx={{
                  color: textColor,
                  borderRadius: 0,
                }}
                disabled={discountApplied}
                onClick={applyDiscount}
              >
                {discountApplied ? 'Applied On Checkout' : 'Apply Discount'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return <>{contentToRender}</>;
}

export default App;