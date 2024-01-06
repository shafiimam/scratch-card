import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

async function fetchScratchCardDiscounts() {
  const devMode = import.meta.env.DEV;  
  const configInStore = sessionStorage.getItem('scratchCardConfig');
  
  const today = new Date();
  if (configInStore === null || configInStore === undefined) {
    const shop = !devMode
      ? localStorage.getItem('shop')
      : 'scratchzone-app-staging.myshopify.com';
    let shopConfig = await fetch(
      `https://super-scratch-a4e9e223558a.herokuapp.com/public/shopConfig?shop=${shop}`
    ).then((res) => res.json());
    shopConfig.expiration = today.setDate(today.getDate() + 1);
    sessionStorage.setItem('scratchCardConfig', JSON.stringify(shopConfig));
  } else {
    const expiration = configInStore.expiration;
    if (today > expiration) {
      localStorage.removeItem('currentSessionScratchCardCodeIndex');
    }
  }
  return true;
}

function injectScratchCardInDom() {
  const root = ReactDOM.createRoot(
    document.getElementById('scratch-card-app-root')
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
      clearInterval(interval);
    }
  }, 1000);
}

let windowLoaded = false;
window.addEventListener('DOMContentLoaded', () => {
  windowLoaded = true;
  fetchScratchCardDiscounts().then(() => {
    const { shopConfig } = JSON.parse(
      sessionStorage.getItem('scratchCardConfig')
    );
    const { 'trigger-event': triggerEvent, 'load-delay': loadDelay } =
      shopConfig;
    console.log(`trigger : ${triggerEvent} \ndelay: ${loadDelay} second`);

    switch (triggerEvent) {
      case 'onload':
        injectScratchCardInDom();
        setTimeout(initiScratchCard(), 0);
        break;
      case 'after-interval':
        setTimeout(() => {
          injectScratchCardInDom();
          setTimeout(initiScratchCard(), 0);
        }, loadDelay * 1000);
        break;
      case 'onExtiIntent':
        document.addEventListener(
          'mouseleave',
          function (event) {
            if (
              event.clientY <= 0 ||
              event.clientX <= 0 ||
              event.clientX >= window.innerWidth ||
              event.clientY >= window.innerHeight
            ) {
              injectScratchCardInDom();
              setTimeout(initiScratchCard(), 0);
            }
          },
          { once: true }
        );
        if (window.innerWidth < 700) {
          injectScratchCardInDom();
          setTimeout(initiScratchCard(), 0);
        }
        break;
      default:
        break;
    }
  });
});

window.onload = function () {
  if (!windowLoaded) {
    console.log('======= INIT :: SCRATCH-CARD-APP =======');
    const domloadEvent = new Event('DOMContentLoaded');
    dispatchEvent(domloadEvent);
  }
};
