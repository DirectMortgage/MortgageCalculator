import { useEffect, useState } from "react";
import Autocomplete from "react-autocomplete";

const styles = {
  inputBoxLabel: {
    position: "absolute",
    backgroundColor: "#fff",
    top: -10,
    left: 3,
    fontSize: 14,
    color: "gray",
    paddingHorizontal: 3,
    flex: 1,
    fontWeight: "bold",
  },
  inputBoxContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    marginBottom: 20,
    minHeight: 30,
    position: "relative",
  },

  inputBox: {
    border: "none",
    borderRadius: 5,
    fontSize: 15,
    backgroundColor: "rgba(0,0,0,.04)",
    color: "#51575d",
    width: "-webkit-fill-available",
    padding: 5,
    height: 24,
    outline: "none",
  },
  buttonContainer: {
    backgroundColor: "#508bc9",
    color: "#fff",
    borderRadius: 5,
    padding: "7px 10px",
    fontSize: 14,
    textAlign: "center",
    display: "inline-block",
    cursor: "pointer",
    float: "right",
    marginBottom: 10,
  },
};
const TextAreaBox = (props) => {
  const {
    label,
    onChangeText,
    value,
    placeholder,
    disabled = false,
    type = "text",
    style = {},
    onBlur = () => {},
    onFocus = () => {},
    symbol = null,
    symbolPosition = "left",
    inputBoxStyle = {},
    inputBoxLabel = {},
  } = props;

  return (
    <div
      style={{
        ...styles.inputBoxContainer,
        ...{
          border: `1px solid silver`,
          marginBottom: 20,
        },
        ...style,
        ...(symbol
          ? { flexDirection: "row", display: "flex", alignItems: "center" }
          : {}),
      }}
    >
      <span style={{ ...styles.inputBoxLabel, ...inputBoxLabel }}>
        {label || ""}
      </span>
      {symbolPosition == "left" && symbol}
      <textarea
        disabled={disabled}
        onChange={(text) => {
          if (["number", "float"].includes(type)) {
            let { value } = text.target;
            value = value.replace(/[^0-9.]/g, "");
            if (type === "float") {
              const decimalCount = (value.match(/\./g) || []).length;
              if (decimalCount > 1) value = value.slice(0, -1);
            }
            text.target.value = value;
          }
          onChangeText(text);
        }}
        value={value || ""}
        placeholder={placeholder || ""}
        style={{
          ...styles.inputBox,
          ...(disabled
            ? { backgroundColor: "#dddddd8c", cursor: "not-allowed" }
            : {}),
          ...(symbol && symbolPosition == "left"
            ? {
                paddingLeft: 20,
              }
            : symbol && symbolPosition == "right"
            ? { paddingRight: 20 }
            : {}),
          ...inputBoxStyle,
        }}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {symbolPosition == "right" && symbol}
    </div>
  );
};
const InputBox = (props) => {
  const {
    label,
    onChangeText,
    value,
    placeholder,
    disabled = false,
    type = "text",
    style = {},
    onBlur = () => {},
    onFocus = () => {},
    symbol = null,
    symbolPosition = "left",
    inputBoxStyle = {},
    inputBoxLabel = {},
  } = props;

  return (
    <div
      style={{
        ...styles.inputBoxContainer,
        ...{
          border: `1px solid silver`,
          marginBottom: 20,
        },
        ...style,
        ...(symbol
          ? { flexDirection: "row", display: "flex", alignItems: "center" }
          : {}),
      }}
    >
      <span style={{ ...styles.inputBoxLabel, ...inputBoxLabel }}>
        {label || ""}
      </span>
      {symbolPosition == "left" && symbol}
      <input
        disabled={disabled}
        onChange={(text) => {
          if (["number", "float"].includes(type)) {
            let { value } = text.target;
            value = value.replace(/[^0-9.]/g, "");
            if (type === "float") {
              const decimalCount = (value.match(/\./g) || []).length;
              if (decimalCount > 1) value = value.slice(0, -1);
            }
            text.target.value = value;
          }
          onChangeText(text);
        }}
        value={value || ""}
        placeholder={placeholder || ""}
        style={{
          ...styles.inputBox,
          ...(disabled
            ? { backgroundColor: "#dddddd8c", cursor: "not-allowed" }
            : {}),
          ...(symbol && symbolPosition == "left"
            ? {
                paddingLeft: 20,
              }
            : symbol && symbolPosition == "right"
            ? { paddingRight: 20 }
            : {}),
          ...inputBoxStyle,
        }}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {symbolPosition == "right" && symbol}
    </div>
  );
};
const AutoCompleteInputBox = (props) => {
  const {
    label,
    onSelect,
    value,
    placeholder,
    disabled = false,
    type = "text",
    style = {},
    onBlur = () => {},
    onFocus = () => {},
    symbol = null,
    symbolPosition = "left",
    inputBoxStyle = {},
    inputBoxLabel = {},
    options = [],
    listIcon = <></>,
  } = props;

  const [searchText, setSearchText] = useState(value || "");
  useEffect(() => {
    setSearchText(value);
  }, [value]);
  const [isFocus, setIsFocus] = useState(false);
  const [elementPosition, setElementPosition] = useState({ top: 0, width: 0 });
  const [filteredOption, setFilteredOption] = useState([]);

  useEffect(() => {
    let iFilteredOption = [];
    if (searchText?.length > 2) {
      iFilteredOption = options.filter((item) =>
        item.label.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
      );
    }
    setFilteredOption(iFilteredOption);
  }, [searchText]);

  return (
    <>
      <div
        style={{
          ...styles.inputBoxContainer,
          ...{
            border: `1px solid silver`,
            marginBottom: 20,
          },
          ...style,
          ...(symbol
            ? { flexDirection: "row", display: "flex", alignItems: "center" }
            : {}),
        }}
      >
        <span style={{ ...styles.inputBoxLabel, ...inputBoxLabel }}>
          {label || ""}
        </span>
        {symbolPosition == "left" && symbol}
        <input
          disabled={disabled}
          onChange={({ target }) => {
            let { value } = target;
            setSearchText(value);
          }}
          value={searchText || ""}
          placeholder={placeholder || ""}
          style={{
            ...styles.inputBox,
            ...(disabled
              ? { backgroundColor: "#dddddd8c", cursor: "not-allowed" }
              : {}),
            ...(symbol && symbolPosition == "left"
              ? {
                  paddingLeft: 20,
                }
              : symbol && symbolPosition == "right"
              ? { paddingRight: 20 }
              : {}),
            ...inputBoxStyle,
          }}
          onBlur={(e) => {
            setTimeout(() => {
              setIsFocus(false);
            }, 300);
            onBlur(e);
          }}
          onFocus={(e) => {
            setIsFocus(true);
            const boundary = e?.currentTarget?.getBoundingClientRect(),
              top = boundary["bottom"] + 30,
              width = boundary["width"];
            setElementPosition({ top, width });
            onFocus(e);
          }}
        />
        {symbolPosition == "right" && symbol}
      </div>
      {searchText?.length > 2 && isFocus && (
        <>
          <div
            className="autoCompleteOptionWrapper"
            style={{ width: elementPosition["width"] }}
          >
            {filteredOption.map((item, index) => {
              return (
                <div
                  onClick={() => onSelect(item)}
                  className="autoCompleteOptionList"
                  key={index}
                  style={{
                    background: "white",
                    padding: "15px",
                    borderBottom: "1px solid #b2b2b2c0",
                  }}
                >
                  {listIcon} <span>{item.label}</span>
                </div>
              );
            })}
            {filteredOption.length == 0 && (
              <div
                className="autoCompleteOptionList"
                key={-1}
                style={{
                  background: "white",
                  padding: "15px",
                  borderBottom: "1px solid #b2b2b2c0",
                  textAlign: "center",
                }}
              >
                <span>No result found.</span>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
const AutoCompleteInputBoxOld = (props) => {
  let {
    label,
    onChangeText,
    value,
    placeholder,
    disabled = false,
    style = {},
    onBlur = () => {},
    onFocus = () => {},
    symbol = null,
    symbolPosition = "left",
    inputBoxStyle = {},
    inputBoxLabel = {},
    onSelect = () => {},
    options = [],
    listIcon = <></>,
  } = props;

  return (
    <div
      className="autoCompleteWrapper"
      style={{
        ...styles.inputBoxContainer,
        ...{
          border: `1px solid silver`,
          marginBottom: 20,
        },
        ...style,
        ...(symbol
          ? { flexDirection: "row", display: "flex", alignItems: "center" }
          : {}),
      }}
    >
      <span style={{ ...styles.inputBoxLabel, ...inputBoxLabel }}>
        {label || ""}
      </span>
      {symbolPosition == "left" && symbol}
      <Autocomplete
        getItemValue={(item) => item.label}
        items={options}
        renderItem={(item, isHighlighted) => (
          <div
            style={{
              background: isHighlighted ? "lightgray" : "white",
              padding: "15px 15px",
              borderBottom: "1px solid #b2b2b2c0",
            }}
          >
            {listIcon} <span>{item.label}</span>
          </div>
        )}
        value={value}
        onChange={onChangeText}
        onSelect={onSelect}
        inputProps={{
          placeholder,
        }}
        wrapperStyle={{
          display: "block",
          width: "100%",
          backgroundColor: "#0000000a",
          borderRadius: 5,
          ...(symbol && symbolPosition == "left"
            ? {
                paddingLeft: 20,
              }
            : symbol && symbolPosition == "right"
            ? { paddingRight: 20 }
            : {}),
        }}
      />
      {symbolPosition == "right" && symbol}
    </div>
  );
};
const Dropdown = (props) => {
  let {
    label,
    options,
    onSelect,
    style = {},
    placeholder = "",
    value = null,
    isMap,
    isValid = false,
    disabled = false,
    isSearchable = false,
    width = "100%",
  } = props;

  return (
    <div
      style={{
        ...styles.inputBoxContainer,
        ...{
          border: `1px solid silver`,
          marginBottom: 20,
        },
        ...style,
      }}
    >
      <span style={styles.inputBoxLabel}>{label || ""}</span>
      <select
        disabled={disabled}
        style={{
          ...styles.inputBox,
          ...{ height: 30 },
          ...(disabled
            ? { backgroundColor: "#dddddd8c", cursor: "not-allowed" }
            : {}),
        }}
        value={value || ""}
        onChange={(e) => {
          let { value, label = e.target.selectedOptions[0].text } = e.target;
          onSelect({ value, text: label });
        }}
      >
        {options.map((item, index) => (
          <option key={index} value={item["value"]}>
            {item["text"]}
          </option>
        ))}
      </select>
    </div>
  );
};
const Button = ({
  onClick,
  title,
  style = {},
  textStyle = {},
  disabled = false,
  className = null,
}) => (
  <div
    onClick={() => !disabled && onClick()}
    style={{
      // ...styles.buttonContainer,
      ...style,
    }}
    className={className}
  >
    {title}
  </div>
);

export { InputBox, Dropdown, Button, TextAreaBox, AutoCompleteInputBox };
