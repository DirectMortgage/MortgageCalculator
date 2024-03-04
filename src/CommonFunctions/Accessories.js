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
    width: "100%",
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
  },
};

const InputBox = (props) => {
  const { label, onChangeText, value, placeholder, disabled = false } = props;

  return (
    <div
      pointerEvents={disabled ? "none" : "auto"}
      style={{
        ...styles.inputBoxContainer,
        ...{
          //   width,
          border: `1px solid silver`,
          marginBottom: 20,
        },
      }}
    >
      <span style={styles.inputBoxLabel}>{label || ""}</span>
      <input
        onChange={(text) => onChangeText(text)}
        value={value || ""}
        placeholder={placeholder || ""}
        style={styles.inputBox}
      />
    </div>
  );
};
const Dropdown = (props) => {
  let {
    label,
    options,
    onSelect,
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
      pointerEvents={disabled ? "none" : "auto"}
      style={{
        ...styles.inputBoxContainer,
        ...{
          border: `1px solid silver`,
          marginBottom: 20,
        },
      }}
    >
      <span style={styles.inputBoxLabel}>{label || ""}</span>
      <select
        disabled={disabled}
        style={{ ...styles.inputBox, ...{ height: 30 } }}
        value={value || ""}
        onChange={(e) => {
          let { value, label = e.target.selectedOptions[0].text } = e.target;
          onSelect({ value, label });
        }}
      >
        {options.map((item, index) => (
          <option key={index} value={item["value"]}>
            {item["label"]}
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
