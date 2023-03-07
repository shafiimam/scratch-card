import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

async function fetchScratchCardDiscounts() {
  const configInStore = localStorage.getItem('scratchCardConfig');
  if (configInStore === null || configInStore === undefined) {
    const shop = 'awesome-sauce-123.myshopify.com';
    let shopConfig = await fetch(
      `https://scratch-card-app.herokuapp.com/public/shopConfig?shop=${shop}`
    ).then((res) => res.json());
    console.log('scratch card config ::: ',{shopConfig});

    // const shopConfig = {
    //   shopConfig: {
    //     'selected-devices': ['mobile', 'desktop'],
    //     'cusom-scratch-card-selected': false,
    //     'uploaded-scratch-card-images': [],
    //     'selected-custom-card-image': 'https://i.ibb.co/Y45L3Nw/navidium2.webp',
    //     'product-selection': 'all-products',
    //     'selected-products': [
    //       {
    //         id: 'gid://shopify/Product/8132485218590',
    //         title: 'Black Leather Bag',
    //         handle: 'black-leather-bag',
    //       },
    //       {
    //         id: 'gid://shopify/Product/8132485611806',
    //         title: 'Blue Silk Tuxedo',
    //         handle: 'blue-silk-tuxedo',
    //       },
    //       {
    //         id: 'gid://shopify/Product/8132485447966',
    //         title: 'Chequered Red Shirt',
    //         handle: 'chequered-red-shirt',
    //       },
    //     ],
    //     title: 'Scratch And Win',
    //     'title-font-size': 23,
    //     'title-text-align-center': true,
    //     'title-font-styles': [
    //       'bold',
    //       'italic',
    //       'regular',
    //       'light-italic',
    //       'light',
    //     ],
    //     'selected-title-font-style': 'bold',
    //     'sub-title': 'Get a discount coupon',
    //     'sub-title-font-size': 14,
    //     'sub-title-text-align-center': true,
    //     'sub-title-font-styles': [
    //       'bold',
    //       'italic',
    //       'regular',
    //       'light-italic',
    //       'light',
    //     ],
    //     'selected-sub-title-font-style': 'light-italic',
    //     'border-color': 'blue',
    //     'bg-color': 'red',
    //     'text-color': '#000000',
    //     'border-radius':8,
    //     'border-width': 5,
    //     height: 89,
    //     width: 300,
    //     'font-size': 25,
    //     'selected-scratch-card-style': 'style 1',
    //   },
    //   discountCodes: ['TEST', 'hello', 'next', '15PERCENT'],
    // };
    localStorage.setItem('scratchCardConfig', JSON.stringify(shopConfig));
  } else {
    console.log('discount codes are already stored');
  }
  return true;
}

function injectScratchCardInDom() {
  const root = ReactDOM.createRoot(
    document.getElementById('scratch-card-app-root'),
  );
  root.render(<App />);
}


function initiScratchCard() {
  const canvasFound = false;
  let canvas = null;
  // find the canvas from an interval
  const interval = setInterval(() => {
    if (canvasFound) {
      clearInterval(interval);
      return;
    }
    canvas = document.querySelector('.ScratchCard__Canvas');
    if (canvas) {
      console.log('canvas found', canvasFound);
      clearInterval(interval);
    }
  }, 1000);
}

let windowLoaded = false;
window.addEventListener('DOMContentLoaded', () => {
  windowLoaded = true;
  console.log('======= INIT :: SCRATCH-CARD-APP =======');
  fetchScratchCardDiscounts().then(() => {
    injectScratchCardInDom();
    setTimeout(initiScratchCard(), 1000);
  });
});

window.onload = function () {
  if (!windowLoaded) {
    console.log('load event not fired! firing now====>>>');
    console.log('======= INIT :: SCRATCH-CARD-APP =======');
    const domloadEvent = new Event('DOMContentLoaded');
    dispatchEvent(domloadEvent);
  }
};