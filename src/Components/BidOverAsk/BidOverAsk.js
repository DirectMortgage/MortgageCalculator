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

const BidOverAsk = () => {
  const [inputSource, setInputSource] = useState({});

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
        askingPrice = 0,
        bidAboveAsking = 0,
        estimatedCurrentValue = 0,
      } = inputSource;
    if (clientName && location) {
      isValid = true;
    }
    if (
      Number(askingPrice) &&
      Number(bidAboveAsking) &&
      Number(estimatedCurrentValue)
    ) {
      isValid = true;
    }
    return !isValid;
  };

  return (
    <>
      <div className="brHeaderWrapper">
        <div className="brHeader">
          <h2 className="brHeaderText">Bid Over Asking Price</h2>
          <p className="brHeaderDesc">
            Use MBS Highway's historical and forecasted appreciation models to
            see when property appreciation will cover the additional bid over
            the asking price.
          </p>
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
            label="Current Asking Price"
            placeholder="Asking Price"
            onBlur={({ target }) => {
              if (!inputSource["estimatedCurrentValue"]) {
                handleInputSource({
                  value: inputSource["askingPrice"],
                  name: "estimatedCurrentValue",
                });
              }
            }}
            onChangeText={({ target }) => {
              const { value } = target;
              handleInputSource({ value, name: "askingPrice" });
            }}
            value={inputSource["askingPrice"]}
          />
          <InputBox
            type="text"
            style={{ marginBottom: 25 }}
            inputBoxStyle={{ fontFamily: "Inter" }}
            validate={false}
            inputMode="numeric"
            format="Currency"
            label="Bid Above Asking"
            placeholder="Bid Above Asking"
            onChangeText={({ target }) => {
              const { value } = target;
              handleInputSource({ value, name: "bidAboveAsking" });
            }}
            value={inputSource["bidAboveAsking"]}
          />
          <InputBox
            type="text"
            style={{ marginBottom: 25 }}
            inputBoxStyle={{ fontFamily: "Inter" }}
            validate={false}
            inputMode="numeric"
            format="Currency"
            label="Estimated Current Value"
            placeholder="Estimated Current Value"
            onChangeText={({ target }) => {
              const { value } = target;
              handleInputSource({ value, name: "estimatedCurrentValue" });
            }}
            value={inputSource["estimatedCurrentValue"]}
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

export default BidOverAsk;
