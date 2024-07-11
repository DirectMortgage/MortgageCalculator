import { useEffect, useState } from "react";
import RangeSlider from "react-range-slider-input";
import { InputBox } from "../../CommonFunctions/Accessories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faHomeAlt } from "@fortawesome/free-solid-svg-icons";
import {
  formatCurrency as handleFormatCurrency,
  formatPercentage,
} from "../../CommonFunctions/GeneralCalculations";
import Plot from "react-plotly.js";
import { loanAmtFromPayment } from "../../CommonFunctions/CalcLibrary";
import { useMemo } from "react";

const formatCurrency = (value) => {
  return handleFormatCurrency(Math.round(value), 0);
};

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
      includeMI: 0,
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
        max: 500000,
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
        max: 200000,
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
    } = inputSource;

    term = term * 12;
    income = parseInt(income / 12);
    tax = tax / 12;
    insurance = insurance / 12;

    rate = rate / 100;
    // topRange = topRange / 100;

    let debtsRatio = debts / income;

    topRange = (includeMI ? topRange - ratePMI : topRange) / 100;

    ratePMI = ratePMI / 100;
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
      piePI = 0,
      totalPayment = 0,
      pieLabels = [],
      pieValues = [];

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
    affordTop = Math.round(affordTop);
    totalPayment = piePI + pieTax + pieInsurance + piePMI + pieMaintenance;
    pieLabels = ["P&I", "Taxes", "Homeowners Insurance"];
    pieValues = [piePI, pieTax, pieInsurance];
    if (includeMI) {
      pieLabels = [...pieLabels, ...["MI"]];
      pieValues = [...pieValues, ...[piePMI]];
    }
    if (pieMaintenance > 0) {
      pieLabels = [...pieLabels, ...["Maintenance"]];
      pieValues = [...pieValues, ...[pieMaintenance]];
    }

    setOutPutDetails({
      homeWorth: affordTop,
      affordTop,
      piePI,
      piePMI,
      pieTax,
      pieInsurance,
      totalPayment,
      pieMaintenance,
      pieLabels,
      pieValues,
      toleranceBelowMax: Math.round(lowRange * 100),
      toleranceWithinMax: Math.round(realRange * 100),
      comfortTop,
      affordTop,
      debtToIncomeRatio: ((totalPayment + debts) / income) * 100,
      currentHomePrice: affordPayDown,
      debts,
      income,
    });
  }, [inputSource]);

  const BudgetRangeSelector = useMemo(() => {
    const {
        homeWorth,
        affordTop,
        debts,
        income,
        comfortTop,
        budgetRangeValue = homeWorth,
        piePI,
        pieTax,
        pieInsurance,
        piePMI,
        pieMaintenance,
      } = outPutDetails,
      debtToIncomeRatio =
        ((piePI + pieTax + pieInsurance + piePMI + pieMaintenance + debts) /
          income) *
        100,
      max = affordTop * 1.5,
      status =
        budgetRangeValue > affordTop
          ? "over"
          : budgetRangeValue >= comfortTop
          ? "normal"
          : "good",
      color =
        status === "over" ? "red" : status === "normal" ? "#508bc9" : "#46a558",
      message =
        status === "over"
          ? "is over your budget"
          : status === "normal"
          ? "is within your budget"
          : "is well within your budget.";

    console.log("test", budgetRangeValue, affordTop, comfortTop);

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
              <span>A home worth {formatCurrency(budgetRangeValue)}</span>{" "}
              <span style={{ fontWeight: "bold", color }}>{message}.</span>
            </div>
            <div>
              Your debt to income ratio:{" "}
              <span style={{ fontWeight: "bold", color }}>
                {formatPercentage(debtToIncomeRatio, 2)}
              </span>
            </div>
          </div>
        </div>
        <RangeSlider
          defaultValue={[0, budgetRangeValue]}
          value={[0, budgetRangeValue]}
          min={0}
          max={max}
          step={10}
          onInput={(event) => {
            const [, value] = event;
            setOutPutDetails((prevOutPutDetails) => {
              return { ...prevOutPutDetails, budgetRangeValue: value };
            });
          }}
          thumbsDisabled={[true, false]}
          rangeSlideDisabled={true}
          id="rbRangeSelector"
        />
        <div style={{ display: "flex" }}>
          <div style={{ width: "66%" }}></div>
          <div
            style={{
              borderLeft: "1px solid #508bc9",
              paddingLeft: 10,
              marginTop: 8,
              flex: 1,
            }}
          >
            <div>Suggested Max</div>
            <div>{formatCurrency(affordTop)}</div>
          </div>
        </div>
      </div>
    );
  }, [outPutDetails]);

  const PaymentBreakdown = ({ labels = [], values = [] }) => {
    return (
      <div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#508bc9",
            margin: "45px 0 0",
          }}
        >
          Mortgage Payment Breakdown
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Plot
            style={{
              width: "100%",
              overflowX: "auto",
              width: "50%",
              display: "inline-block",
            }}
            data={[
              {
                type: "pie",
                values,
                labels,
                textinfo: "label+percent",
                textposition: "outside",
                automargin: true,
                hole: 0.5,
                marker: {
                  colors: [
                    "#053d5d",
                    "#fcb21e",
                    "#84329b",
                    "#b6b7bb",
                    "#6dcde3",
                  ],
                },
              },
            ]}
            layout={{
              height: 320,
              width: 320,
              margin: { t: 0, b: 0, l: 0, r: 0 },
              showlegend: false,
            }}
            // config={config}
          />
          <div style={{ width: "50%", display: "inline-block" }}>
            <table className="totalPayment altTable fullWidth spacer">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th className="title">Total Payment</th>
                  <th className="title">
                    <td>{formatCurrency(outPutDetails["totalPayment"])}</td>
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
                  <td>{formatCurrency(outPutDetails["piePI"])}</td>
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
                {Number(inputSource["includeMI"]) === 1 && (
                  <>
                    <tr>
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
                      <td>{formatCurrency(outPutDetails["piePMI"])}</td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td>Months until MI can be removed:</td>
                      <td>
                        {Math.round(
                          (outPutDetails["homeWorth"] * 0.78) /
                            outPutDetails["totalPayment"]
                        )}
                      </td>
                    </tr>
                  </>
                )}
                {inputSource["maintenanceFee"] > 0 && (
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
                    <td>Maintenance Fee</td>
                    <td>{formatCurrency(inputSource["maintenanceFee"])}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const BudgetRangesTable = () => {
    const { toleranceBelowMax, toleranceWithinMax, comfortTop, affordTop } =
      outPutDetails;
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
                <th>DTI Tolerance</th>
                <th>Low Range</th>
                <th>High Range</th>
              </tr>
              <tr>
                <td>
                  <h4 className="at-below" style={{ color: "green" }}>
                    Below
                  </h4>
                </td>
                <td>0 - {toleranceBelowMax}%</td>
                <td>$0</td>
                <td>
                  <td>{formatCurrency(comfortTop)}</td>
                </td>
              </tr>
              <tr>
                <td>
                  <h4 style={{ color: "#053d5d" }}>Within</h4>
                </td>
                <td>
                  {toleranceBelowMax}% - {toleranceWithinMax}%
                </td>
                <td>
                  <td>{formatCurrency(comfortTop)}</td>
                </td>
                <td>
                  <td>{formatCurrency(affordTop)}</td>
                </td>
              </tr>
              <tr>
                <td>
                  <h4 className="at-over" style={{ color: "red" }}>
                    Over
                  </h4>
                </td>
                <td>{toleranceWithinMax}% - 100%</td>
                <td>
                  <td>{formatCurrency(affordTop)}</td>
                </td>
                <td>∞</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const FundsNeeded = useMemo(() => {
    const { currentHomePrice } = outPutDetails,
      { downPayment, closingCostRange = 0.3 } = inputSource,
      closingCostAmt = currentHomePrice * (closingCostRange / 10),
      totalFundNeeded = closingCostAmt + downPayment,
      downPayPercent = (downPayment / totalFundNeeded) * 100,
      closingCostPercent = 100 - downPayPercent;

    return (
      <div style={{ margin: "45px 0" }}>
        <div>
          <div style={{ fontSize: 23, width: "50%", display: "inline-block" }}>
            <span className="closingEstText">Closing Costs Estimate:</span>
            <span className="closingMoney">
              {formatCurrency(closingCostAmt)}
            </span>
            (
            <span className="closingPercent">
              {formatPercentage(closingCostRange * 10, 2)}
            </span>
            )
            <FontAwesomeIcon
              icon={faChartSimple}
              style={{ fontSize: 25, marginLeft: 5 }}
            />
          </div>
          <div
            style={{ width: "30%", display: "inline-block", float: "right" }}
          >
            <RangeSlider
              defaultValue={[0, closingCostRange || 0]}
              value={[0, closingCostRange || 0]}
              min={0.1}
              max={0.8}
              step={0.02}
              onInput={(event) => {
                const [, value] = event;
                handleInputSource({ value, name: "closingCostRange" });
              }}
              thumbsDisabled={[true, false]}
              rangeSlideDisabled={true}
              id="rbRangeSelector"
            />
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 50 }}>
          <div style={{ width: "50%", display: "inline-block" }}>
            <table className="totalPayment altTable fullWidth spacer">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th className="title">Total Funds Needed</th>
                  <th className="title">{formatCurrency(totalFundNeeded)}</th>
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
                  <td>{formatCurrency(downPayment)}</td>
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
                  <td id="tdTax">{formatCurrency(closingCostAmt)}</td>
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
                values: [closingCostPercent, downPayPercent],
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
  }, [outPutDetails, inputSource]);

  const Overview = () => {
    const { homeWorth, currentHomePrice } = outPutDetails,
      {
        interestRate,
        term,
        annualIncome,
        monthlyObligations,
        DTITolerance,
        downPayment,
        closingCostRange = 0.3,
      } = inputSource,
      closingCostAmt = currentHomePrice * (closingCostRange / 10);

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
                    <td align="center" className="currentValue">
                      {formatCurrency(homeWorth)}
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-interestrate">Interest Rate</td>
                    <td align="center" className="ovRate">
                      {formatPercentage(interestRate, 2)}
                    </td>
                  </tr>
                  {/* <tr>
                    <td className="tof-apr">APR</td>
                    <td align="center" className="ovAPR">
                      9.294%
                    </td>
                  </tr> */}
                  <tr>
                    <td className="tof-lengthofloan">Length of Loan</td>
                    <td align="center" className="ovLength">
                      {term} years
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-downpayment">Down Payment</td>
                    <td align="center" className="ovDown">
                      {formatCurrency(downPayment)} (
                      {formatPercentage((downPayment / homeWorth) * 100, 2)})
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-closingcosts">Closing Costs</td>
                    <td align="center">
                      {formatCurrency(closingCostAmt)} (
                      {formatPercentage(closingCostRange * 10, 2)})
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
                    <td align="center" className="ovInc">
                      {formatCurrency(annualIncome)}
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-monthly-obligations">
                      Monthly Obligations
                    </td>
                    <td align="center" className="ovDebts">
                      {formatCurrency(monthlyObligations)}
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-currentdti">Current DTI</td>
                    <td align="center" className="ovDTI">
                      {formatPercentage(DTITolerance, 2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="tof-dtitolerance">DTI Tolerance</td>
                    <td align="center">
                      0 - {formatPercentage(DTITolerance, 0)}
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
        {BudgetRangeSelector}
        <PaymentBreakdown
          labels={outPutDetails["pieLabels"]}
          values={outPutDetails["pieValues"]}
        />
        <BudgetRangesTable />
        {FundsNeeded}
        <Overview />
      </div>
    </div>
  );
};

export default Affordability;
