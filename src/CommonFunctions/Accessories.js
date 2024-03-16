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
    backgroundColor: "#2860b7",
    color: "#fff",
    borderRadius: 5,
    padding: "5px 10px",
    fontSize: 14,
    textAlign: "center",
    display: "inline-block",
    cursor: "pointer",
    float: "right",
    marginBottom: 10,
  },
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
        }}
        onBlur={onBlur}
        onFocus={onFocus}
      />
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
          onSelect({ value, label });
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
}) => (
  <div
    onClick={() => !disabled && onClick()}
    style={{
      ...styles.buttonContainer,
      ...style,
    }}
  >
    {title}
  </div>
);

export { InputBox, Dropdown, Button };
