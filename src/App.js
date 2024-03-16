import logo from "./logo.svg";
import "./App.css";
import ARMvsFixed from "./Components/ARMvsFixed";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // document.getElementById("root").style.maxWidth = "320px";
  }, []);

  return (
    <>
      <ARMvsFixed />
    </>
  );
}

export default App;
