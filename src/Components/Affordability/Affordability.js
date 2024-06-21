import { useEffect, useState } from "react";
import RangeSlider from "react-range-slider-input";
import { InputBox } from "../../CommonFunctions/Accessories";

const Affordability = () => {
  const [inputSource, setInputSource] = useState({
      annualIncome: "$6,000.00",
      interestRate: "6.5%",
      term: 30,
      downPayment: "$100,000.00",
      monthlyObligations: 250,
      propertyTax: "$5,000.00",
      homeownerInsurance: "$100.00",
      DTITolerance: 43,
      maintenanceFee: "$3,109.00",
    }),
    [activeTab, setActiveTab] = useState(0);
  const fields = [
    {
      label: "Annual Income",
      placeHolder: "$0.00",
      inputMode: "Currency",
      name: "annualIncome",
      value: 6000,
    },
    {
      label: "Interest Rate",
      placeHolder: "$0.00",
      inputMode: "percentage",
      name: "interestRate",
      value: 0,
    },
    {
      label: "Length of Loan",
      placeHolder: "Term",
      inputMode: "numeric",
      name: "term",
      value: 0,
    },
    {
      label: "Down Payment",
      placeHolder: "Down Payment",
      inputMode: "numeric",
      name: "downPayment",
      value: 0,
    },
    {
      label: "Monthly Obligations",
      placeHolder: "Monthly Obligations",
      inputMode: "numeric",
      name: "monthlyObligations",
      value: 0,
    },
    {
      label: "Property Tax",
      placeHolder: "Property Tax",
      inputMode: "numeric",
      name: "propertyTax",
      value: 0,
    },
    {
      label: "Homeowner's Insurance",
      placeHolder: "Homeowner's Insurance",
      inputMode: "numeric",
      name: "homeownerInsurance",
      value: 0,
    },
    {
      label: "DTI Tolerance",
      placeHolder: "DTI Tolerance",
      inputMode: "percentage",
      name: "DTITolerance",
      value: 0,
    },
    {
      label: "Maintenance Fee",
      placeHolder: "Maintenance Fee",
      inputMode: "numeric",
      name: "maintenanceFee",
      value: 0,
    },
  ];
  useEffect(() => {
    require("react-range-slider-input/dist/style.css");
  }, []);
  return (
    <div className="aFFContainer">
      <div class="shortDownSpacer divDescript">
        <div class="largeTitle">Affordability Calculator</div>
        <br />
        Our Affordability Calculator will help determine how much home you can
        afford. Enter your values below such as your income, interest rate, down
        payment and more using the input fields or sliders to help you estimate
        the home price that you can purchase.
        <br />
        <br />
        In our Simple calculation you can input your income, interest rate,
        length of the loan, and down payment. We assume values for other fields
        that are incorporated. Click on the Advanced button to make all fields
        available to be changed and further calculate your home affordability.
        <br />
        <br />
        There are many factors that go into determining home affordability.
      </div>

      <div
        style={{
          border: "1px solid #508bc9",
          width: "100%",
          justifyContent: "end",
          display: "table-cell",
          marginTop: 25,
        }}
      >
        {["Simple", "Advanced"].map((tab, index) => {
          return (
            <button
              key={index}
              className={`${
                activeTab === index ? "purpleButton" : "purpleSecButton"
              }`}
              style={{
                textDecoration: "none",
                borderRadius: 0,
                padding: "5px 10px",
                maxHeight: 35,
                borderLeft: index !== 0 ? "1px solid #508bc9" : "",
                outline:
                  activeTab === index && index === 0 ? "1px solid #508bc9" : "",
              }}
              type="button"
              value={tab}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="dashboardCard">
        {fields.splice(0, activeTab == 0 ? 4 : 10).map((item) => {
          return (
            <div style={{ marginBottom: 30 }}>
              <InputBox
                type="text"
                style={{ marginBottom: 15 }}
                validate={false}
                label={item["label"]}
                inputMode={item["inputMode"]}
                placeholder={item["placeHolder"]}
                onChangeText={({ target }) => {
                  // const { value } = target;
                  // handleInputSource({ value, name: "clientName" });
                }}
                value={inputSource[item["name"]]}
              />
              <RangeSlider
                defaultValue={[0, 10000]}
                min={1}
                max={9}
                step={1}
                onInput={() => {}}
                thumbsDisabled={[true, false]}
                rangeSlideDisabled={true}
                id="rbRangeSelector"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Affordability;
