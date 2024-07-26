import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faLocationDot,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import {
  AutoCompleteInputBox,
  InputBox,
} from "../../CommonFunctions/Accessories";
const Appreciation = () => {
  const [inputSource, setInputSource] = useState({
    clientName: "",
    location: "",
    price: 0,
    downPayment: 0,
    closingCosts: 0,
    appCalcCustomRate: 0,
  });

  const handleInputSource = ({ name, value }) => {
    setInputSource((prevInputSource) => {
      return { ...prevInputSource, [name]: value };
    });
  };
  const handleValidateFields = () => {
    let isValid = false,
      {
        clientName,
        location,
        price = 0,
        downPayment = 0,
        closingCosts = 0,
        appCalcCustomRate = 0,
      } = inputSource;

    if (
      clientName &&
      location &&
      Number(price) &&
      Number(downPayment) &&
      Number(appCalcCustomRate) &&
      Number(closingCosts)
    ) {
      isValid = true;
    }
    return !isValid;
  };

  return (
    <>
      <div className="brHeaderWrapper">
        <div className="brHeader">
          <h2
            className="brHeaderText"
            style={{ height: 100, alignContent: "center" }}
          >
            Appreciation
          </h2>
          {/* <p className="brHeaderDesc"></p> */}
        </div>
      </div>
      <div className="bsBodyTab">
        <div style={{ margin: "15px" }}>
          <InputBox
            type="text"
            style={{ marginBottom: 25 }}
            inputBoxStyle={{ fontFamily: "Inter" }}
            validate={false}
            label="Client name"
            placeholder=" Separate names with commas. E.g.) John Smith, Jane Smith."
            onChangeText={({ target }) => {
              const { value } = target;
              handleInputSource({ value, name: "clientName" });
            }}
            value={inputSource["clientName"]}
          />
          <AutoCompleteInputBox
            onSelect={(value) => {
              handleInputSource({
                value: value["label"],
                name: "location",
              });
            }}
            onChangeText={(test) => {
              console.log(test);
            }}
            inputBoxStyle={{ fontFamily: "Inter" }}
            validate={false}
            style={{ marginBottom: 25, paddingLeft: 10 }}
            label="Location"
            placeholder="Enter address, city, county, or ZIP code."
            listIcon={
              <FontAwesomeIcon
                icon={faLocationDot}
                style={{ marginRight: 5 }}
              />
            }
            value={inputSource["location"]}
            symbol={
              <span
                style={{
                  position: "absolute",
                  left: 13,
                  fontFamily: "inter",
                  fontSize: 14,
                }}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
            }
          />
          <InputBox
            type="text"
            style={{ marginBottom: 25 }}
            inputMode="numeric"
            format="Currency"
            inputBoxStyle={{ fontFamily: "Inter" }}
            validate={false}
            label="Price"
            placeholder="Price"
            onChangeText={({ target }) => {
              const { value } = target;
              handleInputSource({ value, name: "price" });
            }}
            value={inputSource["price"]}
          />
          <InputBox
            type="text"
            style={{ marginBottom: 25 }}
            inputBoxStyle={{ fontFamily: "Inter" }}
            validate={false}
            inputMode="numeric"
            format="Currency"
            label="Down Payment"
            placeholder="Down Payment"
            onChangeText={({ target }) => {
              const { value } = target;
              handleInputSource({ value, name: "downPayment" });
            }}
            value={inputSource["downPayment"]}
          />
          <InputBox
            type="text"
            style={{ marginBottom: 25 }}
            inputBoxStyle={{ fontFamily: "Inter" }}
            validate={false}
            inputMode="numeric"
            format="Currency"
            label="Closing Costs"
            placeholder="Closing Costs"
            onChangeText={({ target }) => {
              const { value } = target;
              handleInputSource({ value, name: "closingCosts" });
            }}
            value={inputSource["closingCosts"]}
          />

          <InputBox
            type="text"
            style={{ marginBottom: 25 }}
            inputBoxStyle={{ fontFamily: "Inter" }}
            validate={false}
            format="percentage"
            label="Appreciation Rate"
            placeholder="Rate"
            onChangeText={({ target }) => {
              const { value } = target;
              handleInputSource({
                value,
                name: "appCalcCustomRate",
              });
            }}
            value={inputSource["appCalcCustomRate"]}
          />
        </div>
      </div>
      <div
        className="bsFooterTab"
        style={{
          marginTop: 25,
          textAlign: "right",
          zIndex: 1,
          position: "relative",
        }}
      >
        <button
          className="btnPrimary"
          style={{ padding: "10px 15px" }}
          type="button"
          disabled={handleValidateFields()}
          onClick={() => {}}
        >
          Calculate{"  "}
          <FontAwesomeIcon icon={faChevronRight} color="#fff" />
        </button>
      </div>
    </>
  );
};

export default Appreciation;
