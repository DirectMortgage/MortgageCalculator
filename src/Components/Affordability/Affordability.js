import { useEffect, useState } from "react";
import RangeSlider from "react-range-slider-input";
import { InputBox } from "../../CommonFunctions/Accessories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faHomeAlt } from "@fortawesome/free-solid-svg-icons";
import {
  formatCurrency,
  formatPercentage,
} from "../../CommonFunctions/GeneralCalculations";
import Plot from "react-plotly.js";
import { loanAmtFromPayment } from "../../CommonFunctions/CalcLibrary";

const Affordability = () => {
  const [inputSource, setInputSource] = useState({
      annualIncome: 65000,
      interestRate: 6.75,
      term: 30,
      downPayment: 20000,
      monthlyObligations: 500,
      propertyTax: 5000,
      homeownerInsurance: 1000,
      DTITolerance: 43,
      maintenanceFee: 0,
      includeMI: 1,
      miPercent: 0.5,
    }),
    [activeTab, setActiveTab] = useState(0),
    fields = [
      {
        label: "Annual Income",
        placeHolder: "$0.00",
        inputMode: "Currency",
        name: "annualIncome",
        min: 0,
        max: 6000,
      },
      {
        label: "Interest Rate",
        placeHolder: "$0.00",
        inputMode: "percentage",
        name: "interestRate",
        min: 0,
        max: 10,
      },
      {
        label: "Term",
        placeHolder: "Length of Loan",
        inputMode: "numeric",
        name: "term",
        min: 0,
        max: 40,
      },
      {
        label: "Down Payment",
        placeHolder: "$0.00",
        inputMode: "Currency",
        name: "downPayment",
        min: 0,
        max: 20000,
      },
      {
        label: "Monthly Obligations",
        placeHolder: "Monthly Obligations",
        inputMode: "Currency",
        name: "monthlyObligations",
        min: 0,
        max: 8000,
        defaultValue: [0, 50],
      },
      {
        label: "Property Tax",
        placeHolder: "Property Tax",
        inputMode: "Currency",
        name: "propertyTax",
        min: 0,
        max: 25000,
      },
      {
        label: "Homeowner's Insurance",
        placeHolder: "Homeowner's Insurance",
        inputMode: "Currency",
        name: "homeownerInsurance",
        min: 0,
        max: 12000,
      },
      {
        label: "DTI Tolerance",
        placeHolder: "DTI Tolerance",
        inputMode: "percentage",
        name: "DTITolerance",
        min: 0,
        max: 100,
      },
      {
        label: "Maintenance Fee",
        placeHolder: "Maintenance Fee",
        inputMode: "Currency",
        name: "maintenanceFee",
        min: 0,
        max: 5000,
      },
      {
        label: "Include MI",
        name: "includeMI",
        min: 0,
        max: 1,
        type: "labelOnly",
      },
      {
        label: "MI Percent",
        placeHolder: "$0.00",
        inputMode: "percentage",
        name: "miPercent",
        min: 0,
        max: 100,
        stepValue: 0.02,
      },
    ];
  const [outPutDetails, setOutPutDetails] = useState({});
  useEffect(() => {
    require("react-range-slider-input/dist/style.css");
  }, []);

  const handleInputSource = ({ name, value }) => {
    setInputSource((prevInputSource) => {
      return { ...prevInputSource, [name]: value };
    });
  };
  useEffect(() => {
    console.log(inputSource);
  }, [inputSource]);

  useEffect(() => {
    let {
        annualIncome: income,
        interestRate: rate,
        term,
        downPayment: downPay,
        monthlyObligations: debts,
        propertyTax: tax,
        homeownerInsurance: insurance,
        DTITolerance: topRange,
        maintenanceFee: maint,
        includeMI,
        miPercent: ratePMI,
      } = inputSource,
      debtsRatio = debts / income;
    debugger;
    term = term * 12;
    income = income / 12;
    tax = tax / 12;
    insurance = insurance / 12;

    rate = rate / 100;
    ratePMI = ratePMI / 100;
    topRange = topRange / 100;

    topRange = includeMI ? topRange - ratePMI : topRange / 100;

    var comfortRatio = 0;
    var affordRatio = 0;
    var realRange = topRange;

    let lowRange = (topRange * 0.6).toFixed(2),
      comfortMonth = income * lowRange - debts,
      affordMonth = income * topRange - debts,
      comfortMort = comfortMonth - tax - insurance - maint,
      affordMort = affordMonth - tax - insurance - maint,
      comfortPMI = 0,
      affordPMI = 0,
      comfortPrin = 0,
      affordPrin = 0,
      comfortTopDown = 0,
      affordTopDown = 0,
      comfortTop = 0,
      affordTop = 0,
      affordPayDown = 0,
      globalPay = 0,
      pieMaintenance = 0,
      pieInsurance = 0,
      pieTax = 0,
      piePMI = 0,
      piePI = 0;

    if (includeMI) {
      comfortTop =
        loanAmtFromPayment(comfortMort, rate * 100, term / 12, [ratePMI]) +
        downPay;
      affordTop =
        loanAmtFromPayment(affordMort, rate * 100, term / 12, [ratePMI]) +
        downPay;
      comfortPMI = ((comfortTop - downPay) * ratePMI) / 12;
      affordPMI = ((affordTop - downPay) * ratePMI) / 12;
      comfortPrin = comfortMort - comfortPMI;
      affordPrin = affordMort - affordPMI;
    } else {
      comfortTop =
        loanAmtFromPayment(comfortMort, rate * 100, term / 12) + downPay;
      affordTop =
        loanAmtFromPayment(affordMort, rate * 100, term / 12) + downPay;
      comfortPrin = comfortMort;
      affordPrin = affordMort;
    }

    comfortTopDown = comfortTop - downPay;
    affordPayDown = affordTop - downPay;
    globalPay = affordPrin;
    pieMaintenance = Math.round(maint);
    pieInsurance = Math.round(insurance);
    pieTax = Math.round(tax);
    piePMI = Math.round(affordPMI);
    piePI = Math.round(affordPrin);

    console.log({ homeWorth: affordTop, piePMI, pieTax, pieInsurance });
    setOutPutDetails({ homeWorth: affordTop, piePMI, pieTax, pieInsurance });
  }, [inputSource]);

  const BudgetRangeSelector = () => {
    return (
      <div style={{ margin: "30px 0" }} className="BudgetRangeSelector">
        <div style={{ display: "flex" }}>
          <FontAwesomeIcon
            icon={faHomeAlt}
            style={{
              fontWeight: "bold",
              fontSize: 45,
              marginBottom: 10,
              marginRight: 40,
            }}
          />
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 28, marginBottom: 5 }}>
              <span>
                A home worth {formatCurrency(outPutDetails["homeWorth"])}
              </span>{" "}
              <span style={{ fontWeight: "bold", color: "#508bc9" }}>
                is within your budget.
              </span>
            </div>
            <div>
              Your debt to income ratio:{" "}
              <span style={{ fontWeight: "bold", color: "#508bc9" }}>
                {formatPercentage(93.77)}
                {/* check */}
              </span>
            </div>
          </div>
        </div>
        <RangeSlider
          defaultValue={[0, 65]}
          min={0}
          max={100}
          step={1}
          onInput={(event) => {
            const [, value] = event;

            handleInputSource({ value });
          }}
          thumbsDisabled={[true, false]}
          rangeSlideDisabled={true}
          id="rbRangeSelector"
        />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 3 }}></div>
          <div
            style={{
              borderLeft: "1px solid #508bc9",
              paddingLeft: 10,
              marginTop: 8,
              flex: 1,
            }}
          >
            <div>Suggested Max</div>
            <div>{formatCurrency(2806904)}</div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentBreakdown = () => {
    return (
      <div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#508bc9",
            margin: "45px 0",
          }}
        >
          Mortgage Payment Breakdown
        </div>
        <div style={{ display: "flex" }}>
          <Plot
            style={{
              width: "100%",
              overflowX: "auto",
              width: "50%",
              display: "inline-block",
            }}
            className="netGainChart"
            data={[
              {
                type: "pie",
                values: [15.99, 12.87, 6.66, 3.2, 61.28],
                labels: ["Maintenance", "MI", "Taxes", "Insurance", "P&I"],
                textinfo: "label+percent",
                textposition: "outside",
                automargin: true,
                hole: 0.5,
                marker: {
                  colors: [
                    "#6dcde3",
                    "#b6b7bb",
                    "#fcb21e",
                    "#84329b",
                    "#053d5d",
                  ],
                },
              },
            ]}
            layout={{
              height: 250,
              width: 250,
              margin: { t: 0, b: 0, l: 0, r: 0 },
              showlegend: false,
            }}
            // config={config}
          />
          <div style={{ width: "50%", display: "inline-block" }}>
            <table id="tblTotalPayment" className="altTable fullWidth spacer">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th className="h3 tp-title">Total Payment</th>
                  <th className="h3" id="tdTotal" val={31265}>
                    $31,265
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div
                      style={{
                        backgroundColor: "#053d5d",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                      }}
                    />
                  </td>
                  <td className="tp-field1">Principal and Interest</td>
                  <td>{formatCurrency(outPutDetails["piePMI"])}</td>
                </tr>
                <tr>
                  <td>
                    <div
                      style={{
                        backgroundColor: "#fcb21e",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                      }}
                    />
                  </td>
                  <td className="tp-field2">Taxes</td>
                  <td>{formatCurrency(outPutDetails["pieTax"])}</td>
                </tr>
                <tr>
                  <td>
                    <div
                      style={{
                        backgroundColor: "#84329b",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                      }}
                    />
                  </td>
                  <td className="tp-field3">Homeowners Insurance</td>
                  <td>{formatCurrency(outPutDetails["pieInsurance"])}</td>
                </tr>
                <tr className="trPMI" style={{}}>
                  <td>
                    <div
                      style={{
                        backgroundColor: "#b6b7bb",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                      }}
                    />
                  </td>
                  <td>MI</td>
                  <td>{formatCurrency(outPutDetails["piePI"])}</td>
                </tr>
                <tr className="trPMI" style={{}}>
                  <td>&nbsp;</td>
                  <td>Months until MI can be removed:</td>
                  <td id="tdPMIMonths">65</td>
                </tr>
                <tr className="trMaint" style={{}}>
                  <td>
                    <div
                      style={{
                        backgroundColor: "#6dcde3",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                      }}
                    />
                  </td>
                  <td>Maintenance Fee</td>
                  <td id="tdMaint" val={5000}>
                    $5,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const BudgetRangesTable = () => {
    return (
      <div className="col-md-12 shortDownSpacer" style={{ marginTop: 45 }}>
        <div style={{ fontSize: 30, fontWeight: 500, marginBottom: 10 }}>
          Budget Ranges
        </div>
        <div
          id="resultRanges"
          className="noDisplay tableWrapper"
          style={{ display: "block" }}
        >
          <table className="altTable affordTable">
            <tbody>
              <tr>
                <th>&nbsp;</th>
                <th className="at-dti-tolerance">DTI Tolerance</th>
                <th className="at-lowrange">Low Range</th>
                <th className="at-highrange">High Range</th>
              </tr>
              <tr>
                <td>
                  <h4 className="at-below" style={{ color: "green" }}>
                    Below
                  </h4>
                </td>
                <td>
                  0 - <span className="maxGoodTolerance">59%</span>
                </td>
                <td>$0</td>
                <td>
                  <span className="maxGoodRange" val={1114971}>
                    $1,114,971
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <h4 className="at-within" style={{ color: "#053d5d" }}>
                    Within
                  </h4>
                </td>
                <td>
                  <span className="maxGoodTolerance">59%</span>-{" "}
                  <span className="maxStretchTolerance">100%</span>
                </td>
                <td>
                  <span className="maxGoodRange" val={1114971}>
                    $1,114,971
                  </span>
                </td>
                <td>
                  <span className="maxStretchRange" val={2806904}>
                    $2,806,904
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <h4 className="at-over" style={{ color: "red" }}>
                    Over
                  </h4>
                </td>
                <td>
                  <span className="maxStretchTolerance">100%</span>- 100%
                </td>
                <td>
                  <span className="maxStretchRange" val={2806904}>
                    $2,806,904
                  </span>
                </td>
                <td>∞</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const FundsNeeded = () => {
    return (
      <div style={{ margin: "45px 0" }}>
        <div>
          <div style={{ fontSize: 23, width: "50%", display: "inline-block" }}>
            <span class="closingEstText">Closing Costs Estimate:</span>
            <span class="closingMoney" val="71810">
              $71,810
            </span>
            (<span class="closingPercent">{formatPercentage(2.98)}</span>)
            <FontAwesomeIcon
              icon={faChartSimple}
              style={{ fontSize: 25, marginLeft: 5 }}
            />
          </div>
          <div
            style={{ width: "30%", display: "inline-block", float: "right" }}
          >
            <RangeSlider
              defaultValue={[0, 65]}
              min={0}
              max={100}
              step={1}
              onInput={(event) => {
                const [, value] = event;
                console.log(value);
              }}
              thumbsDisabled={[true, false]}
              rangeSlideDisabled={true}
              id="rbRangeSelector"
            />
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 50 }}>
          <div style={{ width: "50%", display: "inline-block" }}>
            <table id="tblTotalPayment" className="altTable fullWidth spacer">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th className="h3 tp-title">Total Funds Needed</th>
                  <th className="h3" id="tdTotal" val={31265}>
                    $250,629
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div
                      style={{
                        backgroundColor: "#053d5d",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                      }}
                    />
                  </td>
                  <td className="tp-field1">Down Payment</td>
                  <td id="tdPI" val={19159}>
                    $200,000
                  </td>
                </tr>
                <tr>
                  <td>
                    <div
                      style={{
                        backgroundColor: "#6dcde3",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                      }}
                    />
                  </td>
                  <td className="tp-field2">Closing Costs</td>
                  <td id="tdTax" val={2083}>
                    $50,629
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Plot
            style={{
              width: "100%",
              overflowX: "auto",
              width: "50%",
              display: "flex",
              justifyContent: "flex-end",
            }}
            className="netGainChart"
            data={[
              {
                type: "pie",
                values: [20.2, 79.8],
                labels: ["Closing Cost", "Down Payment"],
                textinfo: "label+percent",
                textposition: "outside",
                automargin: true,
                hole: 0.5,
                marker: {
                  colors: ["#053d5d", "#6dcde3"],
                },
              },
            ]}
            layout={{
              height: 250,
              width: 250,
              margin: { t: 0, b: 0, l: 0, r: 0 },
              showlegend: false,
            }}
            // config={config}
          />
        </div>
      </div>
    );
  };

  const Overview = () => {
    return (
      <div>
        <div style={{ fontSize: 30, fontWeight: 500, marginBottom: 10 }}>
          Overview
        </div>

        <div
          className="row"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div
            className="shortDownSpacer"
            style={{ width: "49%", display: "inline-block" }}
          >
            <div className="tableWrapper">
              <table className="altTable tblOverview fullWidth">
                <thead>
                  <tr>
                    <th className="to-title" colSpan={2}>
                      Home
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="tof-homeprice">Home Price</td>
                    <td align="center" className="currentValue" val={2806904}>
                      $2,806,904
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-interestrate">Interest Rate</td>
                    <td align="center" className="ovRate">
                      9.29%
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-apr">APR</td>
                    <td align="center" className="ovAPR">
                      9.294%
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-lengthofloan">Length of Loan</td>
                    <td align="center" className="ovLength">
                      40 yrs
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-downpayment">Down Payment</td>
                    <td align="center" className="ovDown">
                      $200,000 (7.13%)
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-closingcosts">Closing Costs</td>
                    <td align="center">
                      <span className="closingMoney" val={78207}>
                        $78,207
                      </span>
                      (<span className="closingPercent">3.00</span>%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            className="col-md-6 shortDownSpacer"
            style={{ width: "49%", display: "inline-block" }}
          >
            <div className="tableWrapper">
              <table className="altTable tblOverview fullWidth">
                <tbody>
                  <tr>
                    <th colSpan={2} className="to-tite2">
                      Personal
                    </th>
                  </tr>
                  <tr>
                    <td className="tof-annual-income">Annual Income</td>
                    <td align="center" className="ovInc" val={500000}>
                      $500,000
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-monthly-obligations">
                      Monthly Obligations
                    </td>
                    <td align="center" className="ovDebts" val={7712}>
                      $7,712
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-currentdti">Current DTI</td>
                    <td align="center" className="ovDTI">
                      98.00%
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-dtitolerance">DTI Tolerance</td>
                    <td align="center">
                      0 - <span className="maxStretchTolerance">100%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="aFFContainer">
      <div className="shortDownSpacer divDescript">
        <div className="largeTitle">Affordability Calculator</div>
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

      <div className="dashboardCard" style={{ marginTop: 25 }}>
        {fields
          .splice(
            0,
            activeTab == 0 ? 4 : inputSource["includeMI"] == 1 ? 11 : 10
          )
          .map((item, index) => {
            const {
              inputMode,
              name,
              placeHolder,
              label,
              stepValue = 1,
              min = 0,
              max = 100,
              step,
              type,
            } = item;

            return (
              <div style={{ marginBottom: 30 }} key={index}>
                {type == "labelOnly" ? (
                  <div
                    style={{
                      height: 50,
                      marginBottom: 18,
                      alignContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </div>
                ) : (
                  <InputBox
                    type="text"
                    style={{ marginBottom: 15 }}
                    validate={false}
                    label={label}
                    format={inputMode}
                    placeholder={placeHolder}
                    onChangeText={({ target }) => {
                      const { value } = target;
                      handleInputSource({ value, name });
                    }}
                    value={inputSource[name]}
                  />
                )}
                <RangeSlider
                  defaultValue={[0, inputSource[name]]}
                  value={[0, inputSource[name] || 0]}
                  min={min}
                  max={max}
                  step={step}
                  onInput={(event) => {
                    const [, value] = event;
                    handleInputSource({ value, name });
                  }}
                  thumbsDisabled={[true, false]}
                  rangeSlideDisabled={true}
                  id="rbRangeSelector"
                />
              </div>
            );
          })}
      </div>

      <div>
        <BudgetRangeSelector />
        <PaymentBreakdown />
        <BudgetRangesTable />
        <FundsNeeded />
        <Overview />
      </div>
    </div>
  );
};

export default Affordability;
