import "./App.css";
import ARMvsFixed from "./Components/ARMvsFixed";
import { queryStringToObject } from "./CommonFunctions/GeneralCalculations";
import BlendedRate from "./Components/BlendedRate";

const { type = "aF", w, f } = queryStringToObject(window.location?.href || "");
const isMobile = f == "m",
  screenWidth = (parseInt(w) || window.innerWidth) - 10;

const calculatorComponents = {
  aF: <ARMvsFixed isMobile={isMobile} screenWidth={screenWidth} />,
  bR: <BlendedRate isMobile={isMobile} screenWidth={screenWidth} />,
};

function App() {
  return <>{calculatorComponents[type]}</>;
}

export default App;
