import { Typography, Box, Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ScratchCard from 'react-scratchcard-v2';
import {
  determineWIllWidgetShow,
  getFontStyle,
  getMostProbableDiscount,
} from './utils/index';
import Scratch from './Scratch';
function App() {
  const [discountApplied, setDiscountApplied] = useState(false);
  const [scratchCardImage, setScratchCardImage] = useState(null);
  const [scWidth, setScWidth] = useState(100);
  let shopConfigData = sessionStorage.getItem('scratchCardConfig');
  shopConfigData = JSON.parse(shopConfigData);
  const { shopConfig, discountCodes } = shopConfigData;

  const {
    'border-color': borderColor,
    'bg-color': bgColor,
    width,
    height,
    autoWidth,
    'text-color': textColor,
    'border-radius': borderRadius,
    'border-width': borderWidth,
    'font-size': fontSize,
    'selected-title-font-style': titleFontStyle,
    title,
    'title-color': titleColor,
    'title-font-size': titleFontSize,
    'title-text-align-center': titleTextAlignCenter,
    'sub-title-font-size': subtitleFontSize,
    'sub-title-text-align-center': subtitleTextAlignCenter,
    'selected-sub-title-font-style': subTitleFontStyle,
    'selected-scratch-card-style': scratchCardStyle,
    'sub-title': subTitle,
    'sub-title-color': subtitleColor,
    'cusom-scratch-card-selected': customScratchCardSelected,
    'selected-custom-card-image': selectedCustomCardImage,
    'selected-devices': selectedDevices,
  } = shopConfig;

  async function sendReport() {
    console.log('send::report');
    const scReportSent = sessionStorage.getItem('scReportSent') === 'true';
    if (scReportSent) return;
    const shop = Shopify?.shop ? Shopify?.shop : window.location.hostname;
    sessionStorage.setItem('scReportSent', true);
    sessionStorage.setItem('scratchedOnce', true);
    const sendReport = await fetch(
      `https://super-scratch-a4e9e223558a.herokuapp.com/analytics/report?shop=${shop}&timeStamp=${Date.now()}`
    );
    const response = await sendReport.json();
    const isSuccess = response.message === 'success';
    if (isSuccess) sessionStorage.setItem('scReportSent', true);
  }

  let currentIndex = localStorage.getItem('currentSessionScratchCardCodeIndex');
  if (currentIndex === null || currentIndex === undefined) {
    const { discountIndex: currentSessionCodeIndex } =
      getMostProbableDiscount(discountCodes);
    localStorage.setItem(
      'currentSessionScratchCardCodeIndex',
      currentSessionCodeIndex
    );
  }
  const codeToShow = discountCodes[Number(currentIndex)].code;
  const textToShow = discountCodes[Number(currentIndex)].text;
  let currentProductHandle = localStorage.getItem('productHandle');
  const productSelection = shopConfig['product-selection'];
  const selectedProducts = shopConfig['selected-products'];
  let willShowWidget = true;
  let containerRef = useRef(null);
  let scRef = useRef(null);
  let scCodeRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      setScWidth(document.querySelector('[name="add"]')?.offsetWidth || 575);
    }
    return () => {};
  }, []);

  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth < 600;

  if (selectedDevices.includes('mobile') && isMobile) {
    willShowWidget = determineWIllWidgetShow(
      selectedProducts,
      currentProductHandle,
      productSelection
    );
  } else if (selectedDevices.includes('desktop') && !isMobile) {
    willShowWidget = determineWIllWidgetShow(
      selectedProducts,
      currentProductHandle,
      productSelection
    );
  } else {
    willShowWidget = false;
    console.log('widget will not show');
  }
  if (import.meta.env.MODE === 'development') {
    willShowWidget = true;
    var Shopify = {};
  }

  useEffect(() => {
    if (willShowWidget) {
      let seletectedCustomScratchCardStyle = customScratchCardSelected;
      if (seletectedCustomScratchCardStyle) {
        setScratchCardImage(selectedCustomCardImage);
        const scratchedOnce =
          sessionStorage.getItem('scratchedOnce') === 'true';

        if (scratchedOnce) {
          scRef.current.canvas.style.opacity = '0';
          scRef.current.canvas.style.zIndex = '0';
          scCodeRef.current.style.opacity = '1';
        } else {
          scRef.current.image.src = selectedCustomCardImage;
          scRef.current.reset();
        }
        const scratch = new Scratch();
        scratch.render();
      } else {
        setScratchCardImage(
          `https://cdn.jsdelivr.net/gh/shafiimam/scratch-card-app/scratch-card-style/${scratchCardStyle
            .split(' ')
            .join('-')}.png`
        );

        const scratchedOnce =
          sessionStorage.getItem('scratchedOnce') === 'true';
        if (scratchedOnce) {
          scRef.current.canvas.style.opacity = '0';
          scRef.current.canvas.style.zIndex = '0';
          scCodeRef.current.style.opacity = '1';
        } else {
          scRef.current.image.src = `https://cdn.jsdelivr.net/gh/shafiimam/scratch-card-app/scratch-card-style/${scratchCardStyle
            .split(' ')
            .join('-')}.png`;
          scRef.current.reset();
        }
        const scratch = new Scratch();
        scratch.render();
      }
    }
  }, [willShowWidget]);

  const applyDiscount = async () => {
    const cartRes = await fetch('/cart.js');
    const cartData = cartRes.json();
    const previousAttributes = cartData.attributes;
    const cartItemCount = cartData.item_count;
    if (cartItemCount === 0) {
      alert('Add one or more item in cart first!');
      return;
    }
    await fetch(`/discount/${codeToShow}`)
      .then((res) => {
        setDiscountApplied(true);
        fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attributes: {
              ...previousAttributes,
              addedby: 'scratch-card-app',
            },
          }),
        });
      })
      .catch((err) => setDiscountApplied(true));
  };

  const titleFontStyleToUse = getFontStyle(titleFontStyle);
  const subTitleFontStyleToUse = getFontStyle(subTitleFontStyle);
  let contentToRender = null;
  if (willShowWidget) {
    contentToRender = (
      <Box
        className='scratch-card-app'
        ref={containerRef}
        sx={{
          width: scWidth,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            ...titleFontStyleToUse,
            fontSize: `${titleFontSize}px`,
            textAlign: titleTextAlignCenter && 'center',
            color: titleColor,
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
            color: subtitleColor,
          }}
        >
          {subTitle}
        </Typography>
        <Box
          className='root-container-sc'
          sx={{
            marginTop: '10px',
            marginBottom: '10px',
            borderRadius: `${borderRadius}px`,
            zIndex: 4,
            backgroundColor: bgColor,
            display: 'flex',
            justifyContent: 'center',
            width: autoWidth ? scWidth : width,
          }}
        >
          <Box
            className='ScratchCard__Container'
            width={autoWidth ? scWidth : width}
            height={height}
            sx={{
              '.ScratchCard__Canvas': {
                borderRadius: `${borderRadius - 4}px`,
                MozBorderRadius: `${borderRadius}px`,
                overflow: 'hidden',
                border: `${borderWidth}px solid ${borderColor}`,
                width: autoWidth ? scWidth : width,
                height: height,
              },
            }}
          >
            <ScratchCard
              width={autoWidth ? scWidth : width}
              height={height}
              image={scratchCardImage}
              finishPercent={90}
              onComplete={() => {
                scRef.current.canvas.style.zIndex = 0;
                scCodeRef.current.style.zIndex = 1;
                sendReport();
              }}
              ref={scRef}
              brushSize={30}
            >
              <Box
                ref={scCodeRef}
                className='sc-code-container'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  margin: '0 auto',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: `${borderRadius - 4}px`,
                  border: `${borderWidth}px solid ${borderColor}`,
                  opacity: 0,
                }}
              >
                <Typography
                  variant='h6'
                  sx={{
                    fontSize: `${fontSize}px`,
                    color: textColor,
                  }}
                >
                  {textToShow} {codeToShow}
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
            </ScratchCard>
          </Box>
        </Box>
      </Box>
    );
  }

  return <>{contentToRender}</>;
}

export default App;
