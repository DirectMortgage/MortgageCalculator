import { cloneElement, useEffect, useState } from "react";
import "./App.css";

import { queryStringToObject } from "./CommonFunctions/GeneralCalculations";
import ARMvsFixed from "./Components/ArmVsFixed/ARMvsFixed";
import BlendedRate from "./Components/BlendedRate/BlendedRate";
import BuyRent from "./Components/BuyvsRent/BuyvsRent";
import Affordability from "./Components/Affordability/Affordability";
import BidOverAsk from "./Components/BidOverAsk/BidOverAsk";
import Appreciation from "./Components/Appreciation/Appreciation";

const {
  type = "aF",
  w,
  f,
  p,
} = queryStringToObject(window.location?.href || "");
const isMobile = f == "m";
let screenWidth = (parseInt(w) || window.innerWidth) - 10;
window.addEventListener("resize", () => {
  screenWidth = window.innerWidth - 10;
});

const calculatorComponents = {
  aF: <ARMvsFixed isMobile={isMobile} screenWidth={screenWidth} />,
  bR: <BlendedRate isMobile={isMobile} screenWidth={screenWidth} />,
  rB: <BuyRent isMobile={isMobile} screenWidth={screenWidth} />,
  aFF: <Affordability isMobile={isMobile} screenWidth={screenWidth} />,
  bOA: <BidOverAsk isMobile={isMobile} screenWidth={screenWidth} />,
  aA: <Appreciation isMobile={isMobile} screenWidth={screenWidth} />,
};

function App() {
  const [width, setWidth] = useState(0);
  const updateSize = () => {
    setWidth(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return <>{cloneElement(calculatorComponents[type], { screenWidth })}</>;
}

export default App;
