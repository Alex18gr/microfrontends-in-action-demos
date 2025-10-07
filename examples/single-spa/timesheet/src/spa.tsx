import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import App from "./App";
import { cssLifecycleFactory } from "vite-plugin-single-spa/ex";
import "./index.css";

const lc = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  errorBoundary(err: Error) {
    return <div>Error: {err.message}</div>;
  },
});

function setEnabledStyleTagByAttribute(
  attributeName: string,
  attributeValue: string,
  enableValue: boolean
) {
  const styleTags = document.head.querySelectorAll("style");
  console.log("Enabling or disabling Style Tags", styleTags);

  styleTags.forEach((styleTag) => {
    if (styleTag.getAttribute(attributeName) === attributeValue) {
      styleTag.disabled = enableValue;
      console.log("Style Tag enabled or disabled", styleTag);
    }
  });
}

function enableStyleTabByAttribute(
  attributeName: string,
  attributeValue: string
) {
  setEnabledStyleTagByAttribute(attributeName, attributeValue, false);
  console.log(setEnabledStyleTagByAttribute);
  console.log("Styles enabled!");
}

function disableStyleTabByAttribute(
  attributeName: string,
  attributeValue: string
) {
  setEnabledStyleTagByAttribute(attributeName, attributeValue, true);
  console.log(setEnabledStyleTagByAttribute);
  console.log("Styles disabled!");
}

const unmountStyles = () => {
  return Promise.resolve().then(() => {
    disableStyleTabByAttribute("vite-react", "true");

    // Do framework UI unrendering here

    console.log("unmounted!");
  });
};

const mountStyles = () => {
  return Promise.resolve().then(() => {
    enableStyleTabByAttribute("vite-react", "true");

    // Do framework UI unrendering here

    console.log("mounted!");
  });
};

// IMPORTANT:  Because the file is named spa.tsx, the string 'spa'
// must be passed to the call to cssLifecycleFactory.
const cssLc = cssLifecycleFactory("spa" /* optional factory options */);
export const bootstrap = [cssLc.bootstrap, lc.bootstrap];
export const mount = [cssLc.mount, mountStyles, lc.mount];
export const unmount = [cssLc.unmount, unmountStyles, lc.unmount];
