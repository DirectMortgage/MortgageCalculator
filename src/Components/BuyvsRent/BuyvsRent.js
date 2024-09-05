import { Fragment, useEffect, useState } from "react";
import {
  AutoCompleteInputBox,
  Dropdown,
  InputBox,
  useScrollIndicator,
} from "../../CommonFunctions/Accessories";
import {
  faAngleDown,
  faAngleUp,
  faCalendarAlt,
  faChevronDown,
  faChevronRight,
  faLocationDot,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import {
  formatCurrency,
  formatDate,
  formatNewDate,
  formatPercentage,
  queryStringToObject,
} from "../../CommonFunctions/GeneralCalculations";
import RangeSlider from "react-range-slider-input";
import Plot from "react-plotly.js";
import {
  calculateCashFlows,
  calculateOddFactor,
  getPercentageValue,
  getValuePercentage,
  handleCalculateARP,
  roundValue,
  updateARMRate,
} from "../../CommonFunctions/CalcLibrary";
import { getFirstDateFormDisbursement } from "../../CommonFunctions/CalcLibrary";
import { calculateFirstDate } from "../../CommonFunctions/CalcLibrary";
import { cleanValue } from "../../CommonFunctions/CalcLibrary";
import { handleCalculateNetGain, stateTaxRate } from "./Function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  handleAPI,
  handleGetDownPaymentDetails,
  handleGetLoanData,
} from "../../CommonFunctions/CommonFunctions";

const { type, w, f, loanId, p } = queryStringToObject(
  window.location?.href || ""
);
const isMobile = f == "m",
  isApp = Boolean(parseInt(p));

const headerTabs = [
  "Purchase Price",
  "Desired Monthly Payment",
  "Military BAH",
]; //\n(Basic Allowance for Housing)
const loanTypeOption = [
    {
      text: "Select",
      value: 0,
    },
    {
      text: "Fixed Rate",
      value: 1,
    },
    {
      text: "GPM – Graduated Payment Mortgage",
      value: 2,
    },
    {
      text: "ARM – Adjustable Rate Mortgage",
      value: 3,
    },
    {
      text: "Fixed - Interest Only",
      value: 5,
    },
    {
      text: "Other",
      value: 4,
    },
    {
      text: "Buydown",
      value: 6,
    },
    {
      text: "ARM - Interest Only",
      value: 7,
    },
    {
      text: "Balloon",
      value: 8,
    },
    {
      text: "HELOC",
      value: 9,
    },
  ],
  agencyTypeOptions = [
    {
      text: "Select",
      value: 0,
    },
    {
      text: "VA",
      value: 1,
    },
    {
      text: "FHA",
      value: 2,
    },
    {
      text: "Conventional",
      value: 3,
    },
    {
      text: "USDA/RHS",
      value: 4,
    },
    {
      text: "Utah Housing",
      value: 6,
    },
    {
      text: "Chenoa",
      value: 7,
    },
    {
      text: "Non-QM",
      value: 8,
    },
    {
      text: "Jumbo",
      value: 9,
    },
    // {
    //   text: "Other >>",
    //   value: 5,
    // },
  ];
const inputDetails = {
  clientName: "",
  location: "",
  purValue: 0,
  desMonthlyPayment: 3000,
  ltvRatio: 90,
  rate: 6.25,
  term: 30,
  monthlyAllowance: 3000,
  stateTaxRate: 22,
  filingStatus: "marriedJoint",
  propTax: 324,
  homeInsurance: 13,
  associationFee: 0,
  repairsCost: 19,
  propTaxIncrease: 2,
  costToSell: 6,
  appCalcCustomRate: 4,
  monthlyRent: 13000,
  rentersInsurance: 30,
  annualRentIncrease: 4.5,
  appCalcType: "custom",
  loanAmt: "",
  loanType: 3,
  amortizeType: 1,
  loanTypeText: "Conventional",
  amortizeTypeText: "Fixed",
  point: "0",
  miAmt: 24,
  averageHistorical: 4.213,
  upfrontMI: 0,
  closingCosts: 1200,
  armRateInitialAdj: 12,
  prepaidEscrows: "0",
  apr: 0,
  credits: "0",
};

const Card = ({ title = "", children }) => {
  return (
    <div>
      <span className="rbDarkWord">
        <b>{title}</b>
      </span>
      <div className="rbCard">{children}</div>
    </div>
  );
};

const NetGainBarChart = ({ year, netGainValue = [] }) => {
  const chartData = {
    Years: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    amt: netGainValue,
  };

  const data = [
    {
      type: "bar",
      x: chartData["Years"],
      y: chartData["amt"],
      // text: chartData["amt"].map((amt) => formatCurrency(amt)),
      hoverinfo: "text",
      marker: {
        color: chartData["Years"].map((iYear, index) =>
          chartData["amt"][index] > 0
            ? iYear === year
              ? "#508bc9"
              : "#79aade"
            : "#d60000"
        ),
      },
    },
  ];
  let layout = {
    dragmode: false,
    xaxis: {
      title: {
        text: "Years",
        font: {
          family: "Inter",
          size: 14,
          color: "#60686c",
          weight: "bold",
        },
      },
    },
    yaxis: {
      color: "#afd8d7",
    },
    height: 400,

    margin: {
      l: 10,
      r: 0,
      b: 100,
      t: 100,
      pad: 20,
    },

    plot_bgcolor: "#f4f8f8",
    paper_bgcolor: "#f4f8f8",

    annotations: chartData["Years"].map((val, i) => ({
      x: val,
      y: chartData["amt"][i] + (chartData["amt"][i] > 0 ? 20000 : -20000),
      text: formatCurrency(chartData["amt"][i]),
      xanchor: "center",
      yanchor: chartData["amt"][i] > 0 ? "bottom" : "top",
      showarrow: !false,
      ax: 0,
      ay: chartData["amt"][i] > 0 ? -6 : 6,
      bgcolor: "white",
      arrowcolor: "#c1d0ce",
      font: {
        family: "Inter",
        color: year === val ? "#31a156" : "black",
        size: 13,
        weight: "bold",
      },
      borderpad: 4,
      bordercolor: "#c1d0ce",
    })),
  };
  if (isMobile) {
    layout["width"] = "unset";
  }
  const config = {
    displayModeBar: false,
  };

  useScrollIndicator(".netGainChart", ".netGainChartScrollIndicator");

  return (
    <div
      style={{
        fontSize: 30,
        textAlign: "center",
        margin: "0 0 30px 0",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: isMobile ? "1rem" : "2rem",
          left: isMobile ? 0 : "2rem",
          zIndex: 1,
        }}
      >
        <h4 className="rbDarkValue" style={{ fontSize: 25 }}>
          Net Gain by Buying a Home
        </h4>
        <h3
          className="rbDarkValue"
          style={{
            color: "#508bc9",
            fontSize: 31,
            lineHeight: "48px",
            textAlign: isMobile ? "center" : "start",
          }}
        >
          {formatCurrency(netGainValue[year - 1])}
        </h3>
      </div>
      <Plot
        style={{
          width: "100%",
          overflowX: "auto",
        }}
        className="netGainChart"
        data={data}
        layout={layout}
        config={config}
      />
      {isMobile && isApp && (
        <div
          className="scrollIndicatorWrapper"
          style={{ backgroundColor: "#f4f8f8" }}
        >
          <div className="netGainChartScrollIndicator scrollIndicator"></div>
        </div>
      )}
    </div>
  );
};

const CollapsibleRow = ({ payment, defaultIsOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  return (
    <>
      <tr
        key={payment.paymentNumber}
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: "#f4f8f8", cursor: "pointer" }}
      >
        <td>
          <b>
            <FontAwesomeIcon
              icon={isOpen ? faAngleUp : faAngleDown}
              style={{ fontWeight: "bold" }}
            />
            {"  "}
            Year {payment.paymentNumber}
          </b>
        </td>
        <td>{!isOpen ? formatCurrency(Math.round(payment.Amount)) : ""}</td>
        <td>{!isOpen ? formatCurrency(Math.round(payment.Interest)) : ""}</td>
        <td>{!isOpen ? formatCurrency(Math.round(payment.Principal)) : ""}</td>
        <td>{!isOpen ? formatCurrency(Math.round(payment.stBalance)) : ""}</td>
      </tr>
      {isOpen && children}
    </>
  );
};

const AmortSchedule = ({ amortSchedule }) => {
  const [tabs] = useState(["Monthly", "Yearly"]),
    [activeTab, setActiveTab] = useState(0);

  const [tableData, setTableData] = useState(amortSchedule || []);

  useEffect(() => {
    let iTableData = [];

    for (let i = 0; i < amortSchedule.length; i += 12) {
      let yearArr = amortSchedule.slice(i, i + 12);
      if (i > 0 && activeTab === 1) {
        yearArr.push(iTableData[iTableData.length - 1]);
      }

      const totals = yearArr.reduce(
        (acc, payment) => {
          acc.Amount += payment.Amount;
          acc.Principal += payment.Principal;
          acc.Interest += payment.Interest;
          return acc;
        },
        { Amount: 0, Principal: 0, Interest: 0, Balance: 0 }
      );

      totals["Balance"] = yearArr[11]["Balance"];
      totals["paymentNumber"] =
        (iTableData[iTableData.length - 1]?.["paymentNumber"] || 0) + 1;
      totals["isYearly"] = true;

      if (activeTab === 1) {
        yearArr = [];
      }
      totals["childRows"] = yearArr;

      iTableData.push(totals);
    }
    setTableData([...iTableData]);
  }, [activeTab]);

  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            display: "inline-block",
            margin: "10px 0",
          }}
        >
          <div
            style={{
              border: "1px solid #508bc9",
              width: "100%",
              justifyContent: "end",
              display: "flex",
            }}
          >
            {tabs.map((tab, index) => {
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
                      activeTab === index && index === 0
                        ? "1px solid #508bc9"
                        : "",
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
        </div>
      </div>

      <table className="amortSchedule" cellSpacing="0">
        <thead>
          <tr>
            <th>{activeTab == 0 ? "Month" : "Year"}</th>
            <th>Paid</th>
            <th>Interest</th>
            <th>Principal</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((payment) => (
            <Fragment key={payment.paymentNumber}>
              {activeTab !== 0 ? (
                <tr>
                  <td>{payment.paymentNumber}</td>
                  <td>{formatCurrency(parseInt(payment.Amount))}</td>
                  <td>{formatCurrency(parseInt(payment.Interest))}</td>
                  <td>{formatCurrency(parseInt(payment.Principal))}</td>
                  <td>
                    {formatCurrency(
                      parseInt(payment.Balance > 0 ? payment.Balance : 0)
                    )}
                  </td>
                </tr>
              ) : (
                <CollapsibleRow payment={payment} defaultIsOpen={true}>
                  {payment["childRows"]?.map((row) => {
                    return (
                      <tr key={row.paymentNumber}>
                        <td>{row.paymentNumber}</td>
                        <td>{formatCurrency(parseInt(row.Amount))}</td>
                        <td>{formatCurrency(parseInt(row.Interest))}</td>
                        <td>{formatCurrency(parseInt(row.Principal))}</td>
                        <td>
                          {formatCurrency(
                            parseInt(
                              row.Balance > 0 ? row.Balance : row.Balance
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </CollapsibleRow>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
};

const BuyRentDifferenceBarChart = ({
  year = 5,
  amortSchedule = [],
  netGainDetails = [],
}) => {
  const propTaxRepair = [], //[83, 0, "", 83, 0, "", 84, 0, ""],
    interest = [], //[265, 0, "", 262, 0, "", 259, 0, ""],
    principal = [], //[34, 0, "", 37, 0, "", 37, 0, ""],
    rent = []; // [0, 2030, "", 0, 2121, "", 0, 2217, ""];

  const x = [[], []];

  for (let i = 1; i <= year; i++) {
    const t = i * 12 - 1;
    const { Interest, Principal } = amortSchedule[t];
    interest.push(...[Math.round(Interest), 0, ""]);
    principal.push(...[Math.round(Principal), 0, ""]);
    propTaxRepair.push(
      ...[
        Math.round(
          netGainDetails[i - 1]["totalCahFlow"]["cashFlow"]["buy"]["taxInsEtc"]
        ),
        0,
        "",
      ]
    );

    rent.push(
      ...[
        0,
        netGainDetails[i - 1]["totalCahFlow"]["cashFlow"]["rent"]["total"],
        "",
      ]
    );
    x[0].push(...[i, i, i]);
    x[1].push(...["", " ", "  "]);
  }

  const [tooltipTableDetails, setTooltipTableDetails] = useState({
    x: 0,
    y: 0,
    isShow: false,
  });

  const data = [
    {
      x,
      y: propTaxRepair,
      type: "bar",
      name: "Mo. Prop Tax, Ins, Maint & Repairs",
      marker: { color: "#3a70a6" },
      mode: "markers",
    },
    {
      x,
      y: interest,
      type: "bar",
      name: "Mo. Interest",
      marker: { color: "#508bc9" },
    },
    {
      x,
      y: principal,
      type: "bar",
      name: "Mo. Principal",
      marker: { color: "#0d2121" },
    },
    {
      x,
      y: rent,
      type: "bar",
      name: "Mo. Rent",
      marker: { color: "#1a63ad" },
    },
  ];

  const layout = {
    barmode: "stack",

    dragmode: false,
    xaxis: {
      title: "Year",
      showgrid: false,
      showline: false,
    },
    yaxis: {
      showgrid: false,
      showticklabels: false,
    },
    legend: {
      orientation: "h",
      y: 1.2,
      yanchor: "top",
      x: 0.5,
      xanchor: "center",
    },
    hovermode: "closest",
  };
  if (isMobile) {
    layout["width"] = "unset";
  }
  const config = {
    displayModeBar: false,
  };

  const handleHover = (params) => {
    const index = params.points[0].x[0] - 1,
      iInterest = interest.filter((val) => val)[index],
      iPrincipal = principal.filter((val) => val)[index],
      iPropTaxRepair = propTaxRepair.filter((val) => val)[index],
      iRent = rent.filter((val) => val)[index],
      iYear = [...new Set(x[0])][index];

    setTooltipTableDetails({
      x: params.event.clientX + 20,
      y: params.event.clientY + 20,
      isShow: true,
      buying: formatCurrency(iInterest + iPrincipal + iPropTaxRepair),
      principal: formatCurrency(iPrincipal),
      interest: formatCurrency(iInterest),
      rent: formatCurrency(iRent),
      year: iYear,
      propTaxRepair: iPropTaxRepair,
    });
  };
  useScrollIndicator(".buyRentChart", ".buyRentChartScrollIndicator");

  useEffect(() => {
    const onScroll = () => {
      setTooltipTableDetails({
        x: 0,
        y: 0,
        isShow: false,
      });
    };
    window?.addEventListener("scroll", onScroll);
    return () => {
      window?.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      style={{
        fontSize: 30,
        textAlign: "center",
        margin: "0 0 30px 0",
        position: "relative",
      }}
    >
      <Plot
        className="buyRentChart"
        style={{ width: "unset", overflow: "auto" }}
        data={data}
        layout={layout}
        config={config}
        onHover={!isMobile ? handleHover : () => {}}
        onClick={isMobile ? handleHover : () => {}}
        onUnhover={() => {
          setTooltipTableDetails({
            x: 0,
            y: 0,
            isShow: false,
          });
        }}
      />
      {isMobile && isApp && (
        <div className="scrollIndicatorWrapper">
          <div className="buyRentChartScrollIndicator scrollIndicator"></div>
        </div>
      )}

      {tooltipTableDetails["isShow"] && (
        <div
          style={{
            ...{
              top: tooltipTableDetails.y,
              position: "fixed",
              zIndex: 2,
            },
            ...(isMobile
              ? {
                  alignSelf: "center",
                }
              : {
                  left: tooltipTableDetails.x,
                }),
          }}
        >
          <table className="toolTipTable">
            <thead>
              <th style={{ textAlign: "left", fontWeight: "unset" }}>
                Year {tooltipTableDetails["year"]}
              </th>
              <th></th>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Buying</b>
                </td>
                <td>
                  <b>{tooltipTableDetails["buying"]}</b>
                </td>
              </tr>
              <tr>
                <td>
                  <span
                    className="indicator"
                    style={{ backgroundColor: "black" }}
                  ></span>
                  Principal
                </td>
                <td>
                  <b>{tooltipTableDetails["principal"]}</b>
                </td>
              </tr>
              <tr>
                <td>
                  <span
                    className="indicator"
                    style={{ backgroundColor: "#508bc9" }}
                  ></span>
                  Interest
                </td>
                <td>
                  <b>{tooltipTableDetails["interest"]}</b>
                </td>
              </tr>
              <tr>
                <td>
                  <span
                    className="indicator"
                    style={{ backgroundColor: "#ddcef7" }}
                  ></span>
                  Property Tax/ Insurance, Maintenance & Repairs
                </td>
                <td>
                  <b>{tooltipTableDetails["propTaxRepair"]}</b>
                </td>
              </tr>
              <tr>
                <td>
                  <span
                    className="indicator"
                    style={{ backgroundColor: "#b5a2d5" }}
                  ></span>
                  <b>Renting</b>
                </td>
                <td>
                  <b>{tooltipTableDetails["rent"]}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const DifferenceTable = ({
  yearArr,
  amortSchedule = [],
  netGainDetails = [],
}) => {
  const propTaxRepair = [],
    // [
    //   { buy: 83, rent: 30 },
    //   { buy: 85, rent: 36 },
    //   { buy: 87, rent: 43 },
    // ]
    interest = [],
    // [
    //   { buy: 265, rent: "-" },
    //   { buy: 253, rent: "-" },
    //   { buy: 237, rent: "-" },
    // ]
    principal = [],
    // [
    //   { buy: 34, rent: 2000 },
    //   { buy: 46, rent: 2385 },
    //   { buy: 62, rent: 2844 },
    // ]
    estimate = [];
  // [
  //   { buy: 382, rent: 2030 },
  //   { buy: 384, rent: 2421 },
  //   { buy: 386, rent: 2887 },
  // ]

  yearArr.map((i, index) => {
    const t = i * 12 - 1;
    const { buy, rent } = netGainDetails[i - 1]["totalCahFlow"]["cashFlow"],
      {
        interest: bInterest,
        principal: bPrincipal,
        taxInsEtc: bTaxInsEtc,
        total: bTotal,
      } = buy,
      {
        interest: rInterest,
        principal: rPrincipal,
        taxInsEtc: rTaxInsEtc,
        total: rTotal,
      } = rent;
    interest.push({ buy: bInterest, rent: "-" });
    principal.push({ buy: bPrincipal, rent: rPrincipal });
    propTaxRepair.push({ buy: bTaxInsEtc, rent: rTaxInsEtc });

    estimate.push({
      buy:
        Math.round(bInterest) + Math.round(bPrincipal) + Math.round(bTaxInsEtc),
      rent: Math.round(rPrincipal) + Math.round(rTaxInsEtc),
    });
  });
  const data = [
    {
      category: "Principal/Rent",
      amount: principal,
    },
    {
      category: "Interest",
      amount: interest,
    },
    {
      category: "Prop. Tax, Ins., Maint. & Repairs",
      amount: propTaxRepair,
    },
    {
      category: "Estimated Expenses",
      amount: estimate,
    },
  ];

  useScrollIndicator(".rbDifferenceTable", ".differenceTableScrollIndicator");

  return (
    <div style={{ position: "relative" }}>
      <div className="rbDifferenceTable">
        <table cellSpacing="0" style={{ width: isMobile ? "unset" : "100%" }}>
          <thead>
            <tr>
              <th style={{ boxSizing: "border-box", width: "200px" }}></th>
              {yearArr.map((year, index) => {
                return (
                  <Fragment key={index}>
                    <th>
                      <div>Year {year}</div>
                      <div>Buying</div>
                    </th>
                    <th
                      style={{
                        verticalAlign: "bottom",
                      }}
                    >
                      <div>Renting</div>
                    </th>
                  </Fragment>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              return (
                <Fragment key={index}>
                  <tr>
                    <td>
                      <p>{row["category"]}</p>
                    </td>
                    {row["amount"].map((rData, iIndex) => {
                      return (
                        <Fragment key={iIndex}>
                          <td>
                            <div>
                              <p>
                                {formatCurrency(
                                  Math.round(rData["buy"]) || 0,
                                  0,
                                  !false
                                )}
                              </p>
                            </div>
                          </td>
                          <td>
                            <div>
                              {/* <p>$</p> */}
                              <p>
                                {formatCurrency(
                                  Math.round(rData["rent"]) || 0,
                                  0,
                                  !false
                                )}
                              </p>
                            </div>
                          </td>
                        </Fragment>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {isMobile && isApp && (
        <div className="scrollIndicatorWrapper">
          <div className="differenceTableScrollIndicator scrollIndicator"></div>
        </div>
      )}
    </div>
  );
};

const TaxRateTableRow = ({
  rate,
  singleMin,
  singleMax,
  marriedMin,
  marriedMax,
  hohMin,
  hohMax,
  handleTempInputSource = () => {},
}) => (
  <tr
    onClick={() => {
      handleTempInputSource({ name: "stateTaxRate", value: rate });
    }}
  >
    <td>{rate}</td>
    <td>{`${formatCurrency(singleMin, 0, false)}${
      singleMax ? " - " + formatCurrency(singleMax, 0, false) : "+"
    }`}</td>
    <td>{`${formatCurrency(marriedMin, 0, false)}${
      marriedMax ? " - " + formatCurrency(marriedMax, 0, false) : "+"
    }`}</td>
    <td>{`${formatCurrency(hohMin, 0, false)}${
      hohMax ? " - " + formatCurrency(hohMax, 0, false) : "+"
    }`}</td>
  </tr>
);

const BuyRent = () => {
  const [year, setYear] = useState(5),
    [statePropertyTax, setStatePropertyTax] = useState([]),
    handleChange = (newValues) => {
      setYear(newValues[1]);
    },
    [editScreen, setEditScreen] = useState(null),
    [focusElement, setFocusElement] = useState({ target: null, top: 0 }),
    handleEditMode = (screenName) => {
      setEditScreen(screenName);

      document.querySelector("body").style.overflow = screenName
        ? "hidden"
        : "auto";

      document.querySelector("body").style.paddingRight = screenName
        ? getScrollbarWidth() + "px"
        : 0;
    };
  const getScrollbarWidth = () => {
    const scrollDiv = document.createElement("div");
    scrollDiv.style.width = "100px";
    scrollDiv.style.height = "100px";
    scrollDiv.style.overflow = "scroll";
    scrollDiv.style.position = "absolute";
    scrollDiv.style.top = "-9999px";
    document.body.appendChild(scrollDiv);

    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    document.body.removeChild(scrollDiv);

    return scrollbarWidth;
  };

  const [activeTab, setActiveTab] = useState(0),
    [inputSource, setInputSource] = useState({ ...inputDetails }),
    [tempInputSource, setTempInputSource] = useState({ ...inputDetails }),
    [netGainDetails, setNetGainDetails] = useState([]),
    [amortSchedule, setAmortSchedule] = useState([]),
    [outPutDetails, setOutPutDetails] = useState({}),
    [processingStatus, setProcessingStatus] = useState("loanData,location"),
    [currentScreen, setCurrentScreen] = useState("inputBlock"); //inputBlock

  const handleInputSource = ({ name, value }) => {
    setInputSource((prevInputSource) => {
      return { ...prevInputSource, [name]: value };
    });
  };

  const handlePageLoad = async () => {
    setStatePropertyTax(await handleGetData("GetStateTax"));
    if (loanId !== "undefined" && loanId) {
      let response = await handleGetLoanData(loanId),
        {
          "Purchase Price": purValue,
          "Mortgage Insurance Premium": miAmt,
          ltv,
          loanTerm,
          rate,
          loanAmount: loanAmt,
          ["Appraised Value"]: appraisedValue,
          ["Monthly Payment Factor %"]: iMiPercent,
          ["Til Prepayment"]: tilPrePay,
          zipCode,
          "Agency (Loan) Type": loanType,
          amortizeType,
        } = response;

      amortizeType = Number(amortizeType);
      loanType = Number(loanType);
      let loanTypeText = agencyTypeOptions.filter(
          ({ value }) => value == loanType
        )[0]["text"],
        amortizeTypeText = loanTypeOption.filter(
          ({ value }) => value == amortizeType
        )[0]["text"];

      handleAPI({
        name: "GetLocationData",
        params: { text: zipCode },
      })
        .then((response) => {
          const location = JSON.parse(response || '{"Table":[]}')["Table"][0][
            "label"
          ];
          setProcessingStatus((prevProcessingStatus) => {
            return prevProcessingStatus.replace("location", "");
          });
          setInputSource((prevInputSource) => {
            return {
              ...prevInputSource,
              location,
            };
          });
        })
        .catch((e) => console.error("Error From GetLocationData ====>", e));

      loanTerm = loanTerm / 12;
      rate = formatPercentage(cleanValue(rate) * 100);
      ltv = formatPercentage(ltv);
      setProcessingStatus((prevProcessingStatus) => {
        return prevProcessingStatus.replace("loanData,", "");
      });
      setInputSource((prevInputSource) => {
        return {
          ...prevInputSource,
          ...response,
          rate,
          loanTerm,
          ltvRatio: ltv,
          purValue,
          miAmt,
          loanAmt,
          appraisedValue,
          iMiPercent,
          tilPrePay,
          loanTypeText,
          amortizeTypeText,
        };
      });
    }
  };
  useEffect(() => {
    handlePageLoad();
  }, [loanId]);

  const handleGetData = async (name, params) => {
    return await handleAPI({
      name,
      params,
    })
      .then((response) => {
        response = JSON["parse"](response)["Table"];
        return response;
      })
      .catch((e) => console.error("Error From GetLoanDetails ====>", e));
  };
  const getComparisonYearArray = (year) => {
    return year == 1
      ? [1]
      : year == 2
      ? [1, 2]
      : year == 3
      ? [1, 2, 3]
      : year == 4
      ? [1, 2, 4]
      : year == 5
      ? [1, 3, 5]
      : year == 6
      ? [1, 3, 6]
      : year == 7
      ? [1, 4, 7]
      : year == 8
      ? [1, 4, 8]
      : year == 9
      ? [1, 5, 9]
      : [];
  };

  const handleTempInputSource = ({ name, value }) => {
    setTempInputSource((prevInputSource) => {
      return { ...prevInputSource, [name]: value };
    });
  };

  useEffect(() => {
    require("react-range-slider-input/dist/style.css");

    const styleElement = document.createElement("style");

    styleElement.innerHTML = `
    @media screen and (max-width: ${parseInt(w)}px) {
      .rbBodyWrapper{
        margin: 2.5rem 0px 15rem !important;
      }
      .rbResultBodyWrapper {
        display: unset;
      }
      .bsHeaderTab,
      .bsFooterTab {
        padding: 0 13px; 
      }
      .amortSchedule *{
        font-size:12px !important
      }
      .rbResultBodyWrapper > div {
        width: unset !important;
        margin:0
      }
      .sliderContainer{
        width:unset
      }
      .rbResultTable{
        display:unset
      }
      .rbResultTable > div {
        padding:15px 0px
      }
      .floatingScreen{
        width:100%;
        min-width: unset;
        padding:0
      }
      .floatingScreenWrapper{
        width:100%;
        min-width: 100%;
      }
      .rbDifferenceTable table{
        table-layout: unset;
      }
      .popUpTable td,
      .popUpTable th,.autoCompleteOptionWrapper{
        font-size:11px
      }
      .autoCompleteOptionWrapper .autoCompleteOptionList{
        padding: 10px !important
      }
      .bsBodyTab{
        margin: 25px 13px;
      }
    }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    let iTempInputSource = tempInputSource,
      { location, purValue } = iTempInputSource;
    if (location) {
      purValue = cleanValue(purValue);
      location = location.split(", ");

      const statePropertyObj = statePropertyTax.filter(
          (taxDetails) => taxDetails["StateCode"] === location[2]?.trim()
        ),
        estPropTaxPercent = statePropertyObj[0]["RETaxRate"];

      iTempInputSource["estPropTax"] = purValue * estPropTaxPercent;
      iTempInputSource["propTax"] = roundValue(purValue * estPropTaxPercent, 0);

      iTempInputSource["estPropTaxPercent"] = estPropTaxPercent;
      iTempInputSource["estPropTaxPercentStatic"] = estPropTaxPercent;
      iTempInputSource["locationText"] = location.join(", ");

      setTempInputSource((prevTempInputSource) => {
        return { ...prevTempInputSource, ...iTempInputSource };
      });
    }
  }, [tempInputSource["location"]]);

  const handleCalculation = async ({ iInputSource }) => {
    iInputSource = iInputSource || inputSource;
    let {
        purValue,
        term,
        rate,
        miAmt,
        desMonthlyPayment,
        amortizeType,
        amortizetype,
        loanAmt,
        loanType,
        appraisedValue,
        upfrontMI = 0,
        iMiPercent,
        tilPrePay,
        ["First Payment Date"]: firstPaymentDate = new Date(),
      } = iInputSource,
      ratesArray = [];

    let loanTerm = term * 12;
    firstPaymentDate =
      new Date(firstPaymentDate) ||
      formatNewDate(
        getFirstDateFormDisbursement(calculateFirstDate(new Date(), true, 2))
      );
    amortizeType = Number(amortizetype || amortizeType);
    loanAmt = Number(cleanValue(loanAmt));
    purValue = Number(cleanValue(purValue));
    rate = cleanValue(rate);

    //Non ARM loans block
    if (amortizeType !== 3 && amortizeType !== 7) {
      ratesArray.push({
        startTerm: 1,
        endTerm: loanTerm,
        totalTerm: loanTerm,
        noteRate: rate / 100,
      });
    }
    // ARM loans block
    else {
      rate = parseFloat(rate);
      let newRate = parseFloat(rate / 100),
        {
          armGrossMargin,
          armLifeCap,
          armIndexValue,
          armRateInitialAdj,
          armRateSubAdj,
          armRateAdjCap,
        } = iInputSource;

      armGrossMargin = armGrossMargin ?? 0.2;
      armRateInitialAdj = armRateInitialAdj ?? 12;
      armLifeCap = armLifeCap ?? 0.5;
      armIndexValue = armIndexValue ?? 0;
      armRateSubAdj = armRateSubAdj ?? 12;
      armRateAdjCap = armRateAdjCap ?? 0;

      armRateInitialAdj = Number(armRateInitialAdj);

      armLifeCap = armLifeCap + rate;
      //=============== Initial ===============
      ratesArray.push({
        startTerm: 1,
        endTerm: armRateInitialAdj,
        totalTerm: loanTerm,
        noteRate: newRate,
      });
      //=============== Initial - End ===============

      //=============== 1st ===============

      newRate = updateARMRate(
        newRate,
        armRateAdjCap,
        armGrossMargin,
        armIndexValue,
        armLifeCap
      );
      ratesArray.push({
        startTerm: armRateInitialAdj + 1,
        endTerm: armRateInitialAdj + armRateSubAdj,
        totalTerm: loanTerm,
        noteRate: newRate,
      });
      //=============== 1st - End ===============

      //=============== 2nd ===============
      newRate = updateARMRate(
        newRate,
        armRateSubAdj,
        armGrossMargin,
        armIndexValue,
        armLifeCap
      );

      ratesArray.push({
        startTerm: armRateInitialAdj + armRateSubAdj + 1,
        endTerm: loanTerm,
        totalTerm: loanTerm,
        noteRate: newRate,
      });
    }

    const cashFlow = calculateCashFlows(
        loanAmt,
        loanTerm,
        firstPaymentDate,
        ratesArray,
        miAmt
      ),
      {
        Amount: monthlyPayment,
        intRate: movingRate,
        intRate: noteRate,
      } = cashFlow[0];

    let zeroFlow = 0,
      disbursementDates = formatDate(calculateFirstDate(new Date(), true, 2)); //getFirstDateFormDisbursement(disbursementDates)

    zeroFlow = tilPrePay - loanAmt;

    if (zeroFlow >= 0) {
      console.error("Invalid zeroFlow");
    }

    const { oddFactor } = calculateOddFactor(
      new Date(disbursementDates),
      firstPaymentDate
    );
    let aprParams = {
      cashFlow,
      loanType,
      purchasePrice: cleanValue(purValue),
      appraisedValue: appraisedValue || loanAmt,
      loanAmount: loanAmt,
      upFrontMIPFactor: upfrontMI,
      loanTerm,
      fhaCaseDate: undefined,
      iMiPercent: iMiPercent || miAmt / loanAmt / 100,
      mipAmt: miAmt,
      monthlyPayment: monthlyPayment || desMonthlyPayment,
      movingRate,
      PropertyBe: 1,
      propType: 1,
      amortizeType: amortizeType,
      zeroFlow,
      oddFactor,
      noteRate,
    };
    if (activeTab === 1) {
      aprParams["ltvRatio"] = inputSource["ltvRatio"];
    }
    const ARP = await handleCalculateARP(aprParams);

    iInputSource["purValue"] = cleanValue(iInputSource["purValue"]);
    inputSource["apr"] = ARP;
    const iOutPutDetails = handleCalculateNetGain(iInputSource, cashFlow, year);

    setNetGainDetails(iOutPutDetails["yearlyValues"]);
    setOutPutDetails(iOutPutDetails);
    setAmortSchedule(cashFlow);
    setInputSource((prevInputSource) => {
      return { ...prevInputSource, apr: ARP };
    });
    setTempInputSource((prevTempInputSource) => {
      return { ...prevTempInputSource, apr: ARP };
    });
  };

  const [downPaymentDetails, setDownPaymentDetails] = useState([]);

  const handleValidateFields = () => {
    let isValid = false,
      iIsValid = false;
    const { clientName, location } = inputSource;

    if (clientName && location) {
      isValid = true;
    }
    if (activeTab === 0) {
      const { purValue } = inputSource;
      if (Number(purValue)) {
        iIsValid = true;
      }
    } else if (activeTab === 1) {
      const { desMonthlyPayment, ltvRatio, rate, term } = inputSource;
      if (
        Number(desMonthlyPayment) &&
        Number(ltvRatio) &&
        Number(rate) &&
        Number(term)
      ) {
        iIsValid = true;
      }
    } else if (activeTab === 2) {
      const { monthlyAllowance, rate, term } = inputSource;
      if (Number(monthlyAllowance) && Number(rate) && Number(term)) {
        iIsValid = true;
      }
    }
    return !(isValid && iIsValid);
  };

  return (
    <>
      <div className="brHeaderWrapper">
        <div className="brHeader">
          <h2 className="brHeaderText">Buy vs Rent Comparison</h2>
          <p className="brHeaderDesc">
            Compare estimated monthly payments for renting, or buying, and other
            additional analytics. The calculator provides an estimate of the
            home's future value, as well as the possible tax savings you could
            realize when buying a home.
          </p>
        </div>
      </div>

      <div
        className="rbBodyWrapper"
        style={{
          maxWidth: 1136,
          margin: "2.5rem auto 15rem",
          minHeight: "50vh",
        }}
      >
        {currentScreen === "inputBlock" ? (
          <>
            <div className="bsHeaderTab">
              <div
                className=""
                style={{
                  border: "1px solid #508bc9",
                  width: "100%",
                  justifyContent: "start",
                  display: "flex",
                  margin: "auto",
                }}
              >
                {headerTabs.map((tab, index) => {
                  return (
                    <button
                      key={index}
                      className={`${
                        activeTab === index ? "purpleButton" : "purpleSecButton"
                      }`}
                      style={{
                        textDecoration: "none",
                        borderRadius: 0,
                        margin: 0,
                        borderLeft: index !== 0 ? "1px solid #508bc9" : "",
                        outline:
                          activeTab === index && index === 0
                            ? "1px solid #508bc9"
                            : "",
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
                  iProcessingStatus={
                    processingStatus.includes("location") ? "searching" : null
                  }
                  inputBoxStyle={{ fontFamily: "Inter" }}
                  validate={false}
                  style={{ marginBottom: 25, paddingLeft: 10 }}
                  label="Location"
                  placeholder="Enter address, city, county, or ZIP code."
                  listIcon=<FontAwesomeIcon
                    icon={faLocationDot}
                    style={{ marginRight: 5 }}
                  />
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
                {activeTab === 0 ? (
                  <InputBox
                    style={{ marginBottom: 25 }}
                    type="text"
                    inputMode="numeric"
                    inputBoxStyle={{ fontFamily: "Inter" }}
                    validate={false}
                    format="Currency"
                    label="Purchase Value"
                    placeholder="Purchase Value"
                    onChangeText={({ target }) => {
                      const { value } = target;
                      handleInputSource({ value, name: "purValue" });
                    }}
                    value={inputSource["purValue"] || "$0.00"}
                  />
                ) : activeTab === 1 ? (
                  <>
                    <InputBox
                      type="text"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      format="Currency"
                      label="Desired Monthly Payment"
                      placeholder="Desired Monthly Payment"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "desMonthlyPayment" });
                      }}
                      value={inputSource["desMonthlyPayment"] || 0}
                    />
                    <InputBox
                      type="text"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="LTV Ratio"
                      placeholder="LTV Ratio"
                      format="percentage"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "ltvRatio" });
                      }}
                      value={inputSource["ltvRatio"]}
                    />
                  </>
                ) : activeTab === 2 ? (
                  <>
                    <InputBox
                      format="Currency"
                      type="text"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="Monthly Allowance"
                      placeholder="Monthly Allowance"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "monthlyAllowance" });
                      }}
                      value={inputSource["monthlyAllowance"] || 0}
                    />
                  </>
                ) : (
                  <></>
                )}
                {activeTab !== 0 ? (
                  <div
                  // style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <InputBox
                      type="text"
                      format="percentage"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="Rate"
                      placeholder="Rate"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "rate" });
                      }}
                      value={inputSource["rate"]}
                    />
                    <InputBox
                      type="text"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="Term"
                      placeholder="Term"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "term" });
                      }}
                      value={inputSource["term"]}
                      symbol={
                        <span
                          style={{
                            position: "absolute",
                            right: 15,
                            fontFamily: "inter",
                            fontSize: 14,
                          }}
                        >
                          Years
                        </span>
                      }
                      symbolPosition="right"
                    />
                  </div>
                ) : (
                  <></>
                )}
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
                onClick={() => {
                  try {
                    let iInputSource = inputSource,
                      { purValue, loanAmt } = iInputSource;
                    purValue = Number(cleanValue(purValue));
                    loanAmt = Number(cleanValue(loanAmt));
                    const iDownPaymentDetails = handleGetDownPaymentDetails({
                        loanAmt,
                        purValue,
                      }),
                      location = iInputSource.location.split(", "),
                      statePropertyObj = statePropertyTax.filter(
                        (taxDetails) =>
                          taxDetails["StateCode"] === location[2]?.trim()
                      ),
                      estPropTaxPercent = statePropertyObj[0]["RETaxRate"];

                    iInputSource["estPropTax"] = purValue * estPropTaxPercent;
                    iInputSource["propTax"] = roundValue(
                      purValue * estPropTaxPercent,
                      0
                    );
                    iInputSource["estPropTaxPercent"] = estPropTaxPercent;
                    iInputSource["estPropTaxPercentStatic"] = estPropTaxPercent;
                    if (!loanAmt) {
                      iInputSource["loanAmt"] =
                        iDownPaymentDetails[2]["loanAmt"];
                    }
                    iInputSource["locationText"] = location.join(", ");

                    setTempInputSource((prevTempInputSource) => {
                      return { ...prevTempInputSource, ...iInputSource };
                    });
                    setInputSource(() => ({ ...iInputSource }));
                    setDownPaymentDetails(iDownPaymentDetails);

                    handleCalculation({ iInputSource });

                    setCurrentScreen("outputBlock");
                    setTimeout(() => {
                      document.querySelector("#btn-card-edit")?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }, 300);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Next{"  "}
                <FontAwesomeIcon icon={faChevronRight} color="#fff" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: "0 15px" }}>
              <button
                className="btnPrimary"
                type="button"
                onClick={() => {
                  setCurrentScreen("inputBlock");
                  setInputSource({ ...inputDetails });
                  setTempInputSource({ ...inputDetails });
                  setActiveTab(0);
                }}
              >
                Create New
              </button>
            </div>
            <div
              className={
                isMobile ? "rbResultBodyWrapperMobile" : "rbResultBodyWrapper"
              }
            >
              <div>
                <Card title="Client">
                  <div>
                    <span className="rbDarkWord">
                      <b>{inputSource["clientName"]}</b>
                    </span>
                  </div>
                  <button
                    className="purpleSecButton"
                    type="button"
                    style={{
                      display: "block",
                      padding: 0,
                      height: "auto",
                      textDecoration: "underline",
                      textAlign: "start",
                    }}
                    onClick={() => handleEditMode("Client")}
                  >
                    Edit
                  </button>
                </Card>
                {/* Property Info */}
                <Card title="Property">
                  <div>
                    <span className="rbDarkWord">
                      <b>{formatCurrency(inputSource["purValue"])}</b>
                    </span>
                  </div>
                  <button
                    className="purpleSecButton"
                    type="button"
                    style={{
                      display: "block",
                      padding: 0,
                      height: "auto",
                      textDecoration: "underline",
                      textAlign: "start",
                    }}
                    onClick={() => handleEditMode("Property")}
                  >
                    Edit
                  </button>
                </Card>
                {/* Renting Info*/}
                <Card title="Renting">
                  <div>
                    <span className="rbDarkWord">
                      <b>{formatCurrency(inputSource["monthlyRent"])}</b>
                    </span>
                  </div>
                  <button
                    className="purpleSecButton"
                    type="button"
                    style={{
                      display: "block",
                      padding: 0,
                      height: "auto",
                      textDecoration: "underline",
                      textAlign: "start",
                    }}
                    onClick={() => handleEditMode("Renting")}
                  >
                    Edit
                  </button>
                </Card>
                <Card title="Loan">
                  <div>
                    <span className="rbDarkWord">
                      <b>{formatCurrency(inputSource["loanAmt"] || 0)}</b>
                    </span>
                    <div className="rbWord">{inputSource["term"]} Years</div>
                    <div className="rbWord">
                      {inputSource["loanTypeText"]},
                      {inputSource["amortizeTypeText"]}, {inputSource["rate"]}
                    </div>
                  </div>
                  <button
                    className="purpleSecButton"
                    type="button"
                    style={{
                      display: "block",
                      padding: 0,
                      height: "auto",
                      textDecoration: "underline",
                      textAlign: "start",
                    }}
                    id="btn-card-edit"
                    onClick={() => handleEditMode("Loan")}
                  >
                    Edit
                  </button>
                </Card>
              </div>
              <div
                className={
                  isMobile ? "rbBodyContainerMobile" : "rbBodyContainer"
                }
              >
                <div>
                  <div
                    className="rbDarkValue"
                    style={{
                      fontSize: 35,
                      fontFamily: "Financier",
                    }}
                  >
                    Year {year}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "center",
                      padding: 15,
                    }}
                  >
                    <div>
                      <h4
                        className="rbDarkValue"
                        style={{
                          lineHeight: "40px",
                          letterSpacing: 0.4,
                          fontSize: 24,
                        }}
                      >
                        {formatCurrency(inputSource["purValue"])}
                      </h4>
                      <div
                        className="rbDarkWord"
                        style={{ textAlign: "center" }}
                      >
                        <b>Purchase Price</b>
                      </div>
                    </div>
                    <div
                      style={{
                        borderRight: "1px solid rgb(193, 208, 206)",
                        margin: "0 15px",
                      }}
                    ></div>
                    <div style={{ alignSelf: "center" }}>
                      <h4
                        className="rbDarkValue"
                        style={{
                          lineHeight: "40px",
                          letterSpacing: 0.4,
                          fontSize: 24,
                          maxWidth: 200,
                        }}
                      >
                        {inputSource["locationText"]}
                      </h4>
                      <div
                        className="rbDarkWord"
                        style={{ textAlign: "center" }}
                      >
                        <b>State, County, ZIP Code</b>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sliderContainerWrapper">
                  <div className="sliderContainer">
                    <RangeSlider
                      defaultValue={[0, year]}
                      min={1}
                      max={9}
                      step={1}
                      onInput={handleChange}
                      thumbsDisabled={[true, false]}
                      rangeSlideDisabled={true}
                      id="rbRangeSelector"
                    />
                    <div
                      className="tooltip"
                      style={{
                        left:
                          document.querySelector(".range-slider__range")?.style
                            ?.width || "50%",
                      }}
                    >
                      <b>{year} Years</b>
                    </div>
                  </div>
                </div>
                {netGainDetails.length > 0 && (
                  <>
                    <NetGainBarChart
                      year={year}
                      netGainValue={netGainDetails.map((yearVal) =>
                        Math.round(yearVal["netGain"])
                      )}
                    />

                    <div>
                      <div className="rbResultTable" style={{}}>
                        {/* Appreciation Gain */}
                        <div>
                          <div className="rbResultRow">
                            <span className="rbDarkWord">
                              <b>Appreciation Gain</b>
                            </span>
                            <b
                              className="rbGreenValue"
                              style={{ fontSize: 18 }}
                            >
                              {formatCurrency(
                                netGainDetails[year - 1]["appreciationGain"]
                              )}
                            </b>
                          </div>
                          <div style={{ fontSize: 15 }}>
                            Forecasted App. (Avg/Yr):{" "}
                            <b className="rbGreenValue">
                              {formatPercentage(4.34, 2)}
                              {/* Come Here */}
                            </b>
                          </div>
                          <div style={{ fontSize: 15 }}>
                            Est. Value After <b>{year}</b> Years:{" "}
                            <b className="rbGreenValue">
                              {formatCurrency(
                                netGainDetails[year - 1][
                                  "estimatedAppreciationValue"
                                ]
                              )}
                            </b>
                          </div>
                        </div>
                        {/* Amortization Gain */}
                        <div>
                          <div className="rbResultRow">
                            <span
                              className="rbDarkWord"
                              style={{ display: "flex" }}
                            >
                              <b>Amortization Gain</b>
                              <button
                                className="purpleSecButton"
                                type="button"
                                style={{
                                  display: "block",
                                  padding: 0,
                                  height: "auto",
                                  textDecoration: "underline",
                                  textAlign: "start",
                                  marginLeft: 5,
                                }}
                                onClick={() =>
                                  handleEditMode("Amortization Schedule")
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faCalendarAlt}
                                  style={{
                                    marginRight: 5,
                                  }}
                                />
                                View
                              </button>
                            </span>
                            <b
                              className="rbGreenValue"
                              style={{ fontSize: 18 }}
                            >
                              {formatCurrency(
                                netGainDetails[year - 1]["amortizationGain"]
                              )}
                            </b>
                          </div>
                          <div style={{ fontSize: 15 }}>
                            Original Loan Amount:{" "}
                            <b>
                              {formatCurrency(
                                outPutDetails["originalLoanAmount"]
                              )}
                            </b>
                          </div>
                          <div style={{ fontSize: 15 }}>
                            Remaining Principal:{" "}
                            <b className="rbRedValue">
                              {formatCurrency(
                                amortSchedule[year * 12 - 1]["Balance"]
                              )}
                            </b>
                            {/* Come Here */}
                          </div>
                        </div>
                        {/* Cashflow Difference */}
                        <div>
                          <div className="rbResultRow">
                            <span className="rbDarkWord">
                              <b>Cashflow Difference</b>
                            </span>
                            <b
                              className="rbGreenValue"
                              style={{ fontSize: 18 }}
                            >
                              {formatCurrency(
                                netGainDetails[year - 1]["cashflowDifference"]
                              )}
                            </b>
                          </div>
                        </div>
                        {/* Purchase Closing Cost */}
                        <div>
                          <div className="rbResultRow">
                            <span className="rbDarkWord">
                              <b>Purchase Closing Cost</b>
                            </span>
                            <b
                              className={
                                outPutDetails["initialClosingCosts"] > 0
                                  ? `rbGreenValue`
                                  : "rbRedValue"
                              }
                              style={{ fontSize: 18 }}
                            >
                              {outPutDetails["initialClosingCosts"] > 0
                                ? ""
                                : "-"}
                              {formatCurrency(
                                outPutDetails["initialClosingCosts"]
                              )}
                            </b>
                          </div>
                        </div>

                        {/* Tax Benefit */}
                        <div>
                          <div className="rbResultRow">
                            <span className="rbDarkWord">
                              <b>Tax Benefit Over Renting†</b>
                            </span>
                            <b
                              className="rbGreenValue"
                              style={{ fontSize: 18 }}
                            >
                              {formatCurrency(
                                netGainDetails[year - 1]["taxBenefit"]
                              )}
                            </b>
                          </div>
                          <div style={{ fontSize: 15 }}>
                            Standard Deduction is{" "}
                            <b className="rbGreenValue">
                              {formatCurrency(29200)}
                            </b>
                          </div>
                          <div style={{ fontSize: 15 }}>
                            for{" "}
                            <b>
                              {netGainDetails[year - 1]["taxBracketBenefit"]}
                            </b>
                            % Tax Bracket After <b>{year}</b> Years
                          </div>
                        </div>
                        {/* Cost To Sell */}
                        <div>
                          <div className="rbResultRow">
                            <span className="rbDarkWord">
                              <b>
                                Cost To Sell Est. {inputSource["costToSell"]}%
                              </b>
                            </span>
                            <b
                              className={
                                netGainDetails[year - 1]["costToSell"] > 0
                                  ? "rbGreenValue"
                                  : "rbRedValue"
                              }
                              style={{ fontSize: 18 }}
                            >
                              {netGainDetails[year - 1]["costToSell"] > 0
                                ? ""
                                : "-"}
                              {formatCurrency(
                                netGainDetails[year - 1]["costToSell"]
                              )}
                            </b>
                          </div>
                          <div style={{ fontSize: 15 }}>
                            Based on{" "}
                            <span className="rbGreenValue">
                              {formatCurrency(
                                netGainDetails[year - 1][
                                  "estimatedAppreciationValue"
                                ]
                              )}
                            </span>{" "}
                            Future Value After <b>{year}</b> Years
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="rbTotalResultSection rbDarkWord">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            justifyContent: "space-between",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          <div>
                            <div>
                              <b>Total Renting</b>
                              <div className="rbTotalValue">
                                {formatCurrency(
                                  netGainDetails[year - 1]["totalCahFlow"][
                                    "totalCashflowRenting"
                                  ]
                                )}
                              </div>
                              <div
                                style={{ lineHeight: "15px", marginTop: 15 }}
                              >
                                <div>Annual Rental Increase: </div>
                                <span
                                  style={{ color: "#0d2121", fontSize: 15 }}
                                >
                                  {formatPercentage(
                                    inputSource["annualRentIncrease"],
                                    3
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ alignSelf: "center", fontSize: 25 }}>
                            –
                          </div>
                          <div>
                            <div>
                              <b>Total Buying</b>
                              <div className="rbTotalValue">
                                {formatCurrency(
                                  netGainDetails[year - 1]["totalCahFlow"][
                                    "totalCashflowBuying"
                                  ]
                                )}
                              </div>
                              <div
                                style={{
                                  lineHeight: "15px",
                                  display: "flex",
                                  flexDirection: "row",
                                  marginTop: 15,
                                  gap: 15,
                                  justifyContent: "center",
                                }}
                              >
                                <div>
                                  <div>Interest Rate: </div>
                                  <span
                                    style={{ color: "#0d2121", fontSize: 15 }}
                                  >
                                    {formatPercentage(inputSource["rate"], 3)}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    borderRight: "1px solid rgb(193, 208, 206)",
                                  }}
                                ></div>
                                <div>
                                  <div>APR: </div>
                                  <span
                                    style={{ color: "#0d2121", fontSize: 15 }}
                                  >
                                    {formatPercentage(inputSource["apr"], 3)}*
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ alignSelf: "center", fontSize: 25 }}>
                            =
                          </div>
                          <div>
                            <b>Est. Cashflow Difference</b>
                            <div
                              className="rbTotalValue"
                              style={{ color: "#508bc9" }}
                            >
                              {formatCurrency(
                                netGainDetails[year - 1]["cashflowDifference"]
                              )}
                            </div>
                          </div>
                        </div>
                        <div></div>
                      </div>
                    </div>

                    <BuyRentDifferenceBarChart
                      year={year}
                      amortSchedule={amortSchedule}
                      netGainDetails={netGainDetails}
                    />
                    <DifferenceTable
                      yearArr={getComparisonYearArray(year)}
                      amortSchedule={amortSchedule}
                      netGainDetails={netGainDetails}
                    />
                  </>
                )}
              </div>
            </div>

            <div
              className={`floatingScreenWrapper ${editScreen ? "visible" : ""}`}
            >
              <div
                onClick={() => handleEditMode(null)}
                className="floatingScreenSpace"
              ></div>

              <div
                className={isMobile ? "floatingScreen" : "floatingScreenWeb"}
              >
                {isMobile && (
                  <div
                    onClick={() => handleEditMode(null)}
                    className="floatingScreenClose"
                  >
                    <FontAwesomeIcon icon={faChevronDown} className="fa-lg" />
                  </div>
                )}
                {!isMobile && (
                  <span
                    title="Close"
                    onClick={() => handleEditMode(null)}
                    style={{
                      color: "red",
                      position: "absolute",
                      right: 25,
                      top: 5,
                      fontSize: 32,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </span>
                )}
                <h2
                  style={{
                    textAlign: "center",
                    marginTop: isMobile ? 30 : -10,
                  }}
                >
                  {editScreen}
                </h2>
                <div
                  style={{
                    overflow: "auto",
                    maxHeight: isMobile ? "65vh" : "73vh",
                    padding: "15px",
                  }}
                >
                  {editScreen === "Client" ? (
                    <>
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Client name"
                        placeholder=" Separate names with commas. E.g.) John Smith, Jane Smith."
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({ value, name: "clientName" });
                        }}
                        value={tempInputSource["clientName"]}
                      />
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        format="percentage"
                        label="Fed/State Tax Rate"
                        placeholder="Tax Rate"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "stateTaxRate",
                          });
                        }}
                        value={tempInputSource["stateTaxRate"]}
                        onFocus={(event) => {
                          const boundary =
                              event?.currentTarget?.getBoundingClientRect(),
                            top = boundary["bottom"] + 35,
                            width = boundary["width"];

                          setFocusElement({
                            target: "stateTaxRate",
                            top,
                            width,
                          });
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setFocusElement({ target: null, top: 0 });
                          }, 300);
                        }}
                      />
                      {focusElement["target"] === "stateTaxRate" && (
                        <div
                          style={{
                            width: focusElement["width"],
                            top: focusElement["top"],
                            position: "absolute",
                            zIndex: 4,
                            backgroundColor: "#fff",
                            // maxHeight: 300,
                            // overflow: "auto",
                          }}
                        >
                          <table className="popUpTable" cellSpacing={0}>
                            <thead>
                              <tr>
                                <th>Rate (%)</th>
                                <th>Single ($)</th>
                                <th>Married ($)</th>
                                <th>HOH ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stateTaxRate.map((row, index) => (
                                <TaxRateTableRow
                                  key={index}
                                  {...row}
                                  handleTempInputSource={handleTempInputSource}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <Dropdown
                        isValid={false}
                        label="Filing Status: Standard Deduction"
                        options={[
                          { value: "single", text: "Single: $14,600" },
                          { value: "hoh", text: "Head of Household: $21,900" },
                          {
                            value: "marriedSeparate",
                            text: "Married filing sepatately: $14,600",
                          },
                          {
                            value: "marriedJoint",
                            text: "Married filing jointly: $29,200",
                          },
                        ]}
                        value={tempInputSource["filingStatus"]}
                        onSelect={({ value }) => {
                          handleTempInputSource({
                            value,
                            name: "filingStatus",
                          });
                        }}
                        isMap={false}
                      />
                    </>
                  ) : editScreen === "Property" ? (
                    <>
                      <AutoCompleteInputBox
                        onSelect={(value) => {
                          handleTempInputSource({
                            value: value["label"],
                            name: "location",
                          });
                        }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        style={{ marginBottom: 25 }}
                        label="Location"
                        placeholder="Enter address, city, county, or ZIP code."
                        listIcon=<FontAwesomeIcon
                          icon={faLocationDot}
                          // size={25}
                          style={{ marginRight: 5 }}
                        />
                        value={tempInputSource["location"]}
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
                        format="Currency"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Price"
                        placeholder="Purchase Value"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({ value, name: "purValue" });
                        }}
                        value={tempInputSource["purValue"]}
                      />
                      <div
                        style={{
                          marginTop: -15,
                          marginBottom: 15,
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        <div style={{ display: "flex" }}>
                          County est. tax:{" "}
                          <b>${(inputSource["estPropTax"] || "").toFixed(2)}</b>
                          <button
                            className="purpleSecButton"
                            type="button"
                            style={{
                              display: "block",
                              padding: 0,
                              height: "auto",
                              textDecoration: "underline",
                              textAlign: "start",
                              marginLeft: 5,
                            }}
                            onClick={() => {
                              handleTempInputSource({
                                value: inputSource["estPropTax"],
                                name: "propTax",
                              });
                              handleTempInputSource({
                                value: inputSource["estPropTaxPercentStatic"],
                                name: "estPropTaxPercent",
                              });
                            }}
                          >
                            Use
                          </button>
                        </div>
                        {/* <div>
                          Est. tax:{" "}
                          <b>${(inputSource["propTax"] || "").toFixed(2)}</b>
                        </div> */}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                        }}
                      >
                        <InputBox
                          type="text"
                          style={{
                            marginBottom: 25,
                            width: isMobile ? "100%" : "45%",
                          }}
                          inputBoxStyle={{ fontFamily: "Inter" }}
                          validate={false}
                          format="Currency"
                          label="Annual Property Tax Amount"
                          placeholder="Property Tax"
                          onChangeText={({ target }) => {
                            let { value } = target,
                              amt = 0,
                              percent = 0;

                            amt = parseFloat(value);
                            percent =
                              getValuePercentage({
                                totalValue: parseFloat(
                                  tempInputSource["purValue"]
                                ),
                                amount: amt,
                              }) / 100;

                            handleTempInputSource({
                              value: percent,
                              name: "estPropTaxPercent",
                            });
                            handleTempInputSource({
                              value: roundValue(amt, 0),
                              name: "propTax",
                            });
                          }}
                          value={tempInputSource["propTax"]}
                        />
                        <InputBox
                          type="text"
                          style={{
                            marginBottom: 25,
                            width: isMobile ? "100%" : "45%",
                          }}
                          inputBoxStyle={{ fontFamily: "Inter" }}
                          validate={false}
                          label="Annual Property Tax Percentage"
                          placeholder="Property Tax"
                          format="percentage"
                          onChangeText={({ target }) => {
                            let { value } = target,
                              amt = 0,
                              percent = 0;

                            percent = parseFloat(value) / 100;
                            amt = getPercentageValue({
                              totalValue: parseFloat(
                                tempInputSource["purValue"]
                              ),
                              percentage: percent,
                            });

                            handleTempInputSource({
                              value: percent || "",
                              name: "estPropTaxPercent",
                            });
                            handleTempInputSource({
                              value: roundValue(amt, 0),
                              name: "propTax",
                            });
                          }}
                          value={roundValue(
                            parseFloat(tempInputSource["estPropTaxPercent"]) *
                              100
                          )}
                        />
                      </div>
                      <InputBox
                        type="text"
                        format="Currency"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Monthly Home Insurance"
                        placeholder="Monthly Home Insurance"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "homeInsurance",
                          });
                        }}
                        value={tempInputSource["homeInsurance"]}
                      />
                      <InputBox
                        type="text"
                        format="Currency"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Monthly Association Fee"
                        placeholder="Property Tax"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "associationFee",
                          });
                        }}
                        value={(
                          tempInputSource["associationFee"] || 0
                        ).toString()}
                      />
                      <InputBox
                        type="text"
                        format="Currency"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Monthly Repairs"
                        placeholder="Monthly Repairs"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({ value, name: "repairsCost" });
                        }}
                        value={tempInputSource["repairsCost"]}
                      />
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        format="percentage"
                        label="Annual Property Tax Increase"
                        placeholder="Annual Property Tax Increase"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "propTaxIncrease",
                          });
                        }}
                        value={tempInputSource["propTaxIncrease"]}
                      />
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        format="percentage"
                        label="Cost to Sell"
                        placeholder="Cost to Sell"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({ value, name: "costToSell" });
                        }}
                        value={tempInputSource["costToSell"]}
                      />
                      <div
                        style={{
                          lineHeight: 1.5,
                          fontSize: 14,
                        }}
                      >
                        <div>
                          <b>Appreciation Calculation</b>
                        </div>
                        <span>Select which rate you want to display.</span>
                        <div className="appCalcType">
                          <label>
                            <input
                              type="radio"
                              value="custom"
                              checked={
                                tempInputSource["appCalcType"] === "custom"
                              }
                              onChange={() =>
                                handleTempInputSource({
                                  value: "custom",
                                  name: "appCalcType",
                                })
                              }
                            />
                            Custom
                          </label>
                        </div>
                        {tempInputSource["appCalcType"] === "custom" ? (
                          <>
                            <InputBox
                              type="text"
                              style={{ marginBottom: 25 }}
                              inputBoxStyle={{ fontFamily: "Inter" }}
                              validate={false}
                              format="percentage"
                              label="Rate"
                              placeholder="Rate"
                              onChangeText={({ target }) => {
                                const { value } = target;
                                handleTempInputSource({
                                  value,
                                  name: "appCalcCustomRate",
                                });
                              }}
                              value={tempInputSource["appCalcCustomRate"]}
                            />
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </>
                  ) : editScreen === "Renting" ? (
                    <>
                      <InputBox
                        type="text"
                        format="Currency"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Monthly Rent"
                        placeholder="Rent"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({ value, name: "monthlyRent" });
                        }}
                        value={tempInputSource["monthlyRent"]}
                      />
                      <InputBox
                        type="text"
                        format="Currency"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Renters Insurance"
                        placeholder="Rent"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "rentersInsurance",
                          });
                        }}
                        value={tempInputSource["rentersInsurance"]}
                      />
                      <div
                        style={{
                          marginTop: -15,
                          marginBottom: 15,
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        <div style={{ display: "flex" }}>
                          National Average Rent Renewal:{" "}
                          <b style={{ marginLeft: 5 }}>4.5%</b>
                        </div>
                        <div style={{ display: "flex" }}>
                          <b style={{ marginRight: 5 }}>21.23k </b> renters who
                          can afford to buy
                        </div>
                      </div>
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        format="percentage"
                        label="Annual Rent Increase"
                        placeholder="Annual Rent Increase"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "annualRentIncrease",
                          });
                        }}
                        value={tempInputSource["annualRentIncrease"]}
                      />
                    </>
                  ) : editScreen === "Loan" ? (
                    <>
                      <InputBox
                        type="text"
                        format="Currency"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Loan Amount"
                        placeholder="Loan Amount"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({ value, name: "loanAmt" });
                        }}
                        value={tempInputSource["loanAmt"]}
                        onFocus={(event) => {
                          const boundary =
                              event?.currentTarget?.getBoundingClientRect(),
                            top = boundary["bottom"] + 35,
                            width = boundary["width"];

                          setFocusElement({
                            target: "downPayment",
                            top,
                            width,
                          });
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setFocusElement({ target: null, top: 0 });
                          }, 300);
                        }}
                      />
                      {focusElement["target"] === "downPayment" && (
                        <div
                          style={{
                            width: focusElement["width"],
                            top: focusElement["top"],
                            position: "absolute",
                            zIndex: 4,
                            backgroundColor: "#fff",
                            // maxHeight: 300,
                            // overflow: "auto",
                          }}
                        >
                          <table className="popUpTable" cellSpacing={0}>
                            <thead>
                              <tr>
                                <th>Down Payment %</th>
                                <th>Down Payment</th>
                                <th>Loan Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {downPaymentDetails.map(
                                (
                                  { percentage, downPayment, loanAmt },
                                  index
                                ) => (
                                  <tr
                                    onClick={() => {
                                      handleTempInputSource({
                                        name: "loanAmt",
                                        value: loanAmt,
                                      });
                                    }}
                                  >
                                    <td>
                                      {percentage}%{" "}
                                      {percentage === 100 &&
                                        "(Invest. Property)"}{" "}
                                    </td>
                                    <td>{formatCurrency(downPayment)}</td>
                                    <td>{formatCurrency(loanAmt)}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <InputBox
                        type="text"
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              right: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            Years
                          </span>
                        }
                        symbolPosition="right"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Term"
                        inputMode="numeric"
                        placeholder="Term"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "term",
                          });
                        }}
                        value={tempInputSource["term"]}
                      />
                      <Dropdown
                        isValid={false}
                        label="Agency Type"
                        options={agencyTypeOptions}
                        value={tempInputSource["loanType"]}
                        onSelect={({ value, text }) => {
                          handleTempInputSource({
                            value,
                            name: "loanType",
                          });
                          handleTempInputSource({
                            value: value == 5 ? "" : text,
                            name: "loanTypeText",
                          });
                        }}
                        isMap={false}
                      />
                      {tempInputSource["loanType"] == 5 && (
                        <InputBox
                          type="text"
                          style={{ marginBottom: 25 }}
                          inputBoxStyle={{ fontFamily: "Inter" }}
                          validate={false}
                          label="Program Name"
                          placeholder="Loan Program Name"
                          onChangeText={({ target }) => {
                            const { value } = target;
                            handleTempInputSource({
                              value,
                              name: "loanTypeText",
                            });
                          }}
                          value={tempInputSource["loanTypeText"]}
                        />
                      )}
                      <Dropdown
                        style={{ marginBottom: 25 }}
                        isValid={false}
                        label="Loan Type"
                        options={loanTypeOption}
                        value={tempInputSource["amortizeType"]}
                        onSelect={({ value, text }) => {
                          handleTempInputSource({
                            value,
                            name: "amortizeType",
                          });
                          handleTempInputSource({
                            value: text,
                            name: "amortizeTypeText",
                          });
                        }}
                        isMap={false}
                      />
                      {[3, 7].includes(
                        Number(tempInputSource["amortizeType"])
                      ) && (
                        <InputBox
                          type="text"
                          style={{ marginBottom: 25 }}
                          inputBoxStyle={{ fontFamily: "Inter" }}
                          validate={false}
                          label="Initial Adjustment (Months)"
                          placeholder="Initial Adjustment"
                          onChangeText={({ target }) => {
                            const { value } = target;
                            handleTempInputSource({
                              value,
                              name: "armRateInitialAdj",
                            });
                          }}
                          value={tempInputSource["armRateInitialAdj"]}
                        />
                      )}
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        format="percentage"
                        label="Rate"
                        placeholder="rate"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "rate",
                          });
                        }}
                        value={tempInputSource["rate"]}
                      />
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        inputMode="numeric"
                        label="Point"
                        placeholder="point"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "point",
                          });
                        }}
                        value={tempInputSource["point"]}
                      />
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        format="Currency"
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Monthly Mortgage Insurance (MI)"
                        placeholder="MI"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "miAmt",
                          });
                        }}
                        value={tempInputSource["miAmt"]}
                      />
                      {tempInputSource["loanType"] == 2 ? (
                        <>
                          <InputBox
                            type="text"
                            style={{ marginBottom: 25 }}
                            format="Currency"
                            inputBoxStyle={{ fontFamily: "Inter" }}
                            validate={false}
                            label="Upfront MIP"
                            placeholder="Upfront MIP"
                            onChangeText={({ target }) => {
                              const { value } = target;
                              handleTempInputSource({
                                value,
                                name: "upfrontMI",
                              });
                            }}
                            value={tempInputSource["upfrontMI"]}
                          />
                        </>
                      ) : tempInputSource["loanType"] == 4 ? (
                        <InputBox
                          type="text"
                          style={{ marginBottom: 25 }}
                          format="Currency"
                          inputBoxStyle={{ fontFamily: "Inter" }}
                          validate={false}
                          label="Guarantee Fee"
                          placeholder="Guarantee Fee"
                          onChangeText={({ target }) => {
                            const { value } = target;
                            handleTempInputSource({
                              value,
                              name: "guaranteeFee",
                            });
                          }}
                          value={tempInputSource["guaranteeFee"]}
                        />
                      ) : tempInputSource["loanType"] == 1 ? (
                        <InputBox
                          type="text"
                          style={{ marginBottom: 25 }}
                          format="Currency"
                          inputBoxStyle={{ fontFamily: "Inter" }}
                          validate={false}
                          label="Funding Fee"
                          placeholder="Funding Fee"
                          onChangeText={({ target }) => {
                            const { value } = target;
                            handleTempInputSource({
                              value,
                              name: "fundingFee",
                            });
                          }}
                          value={tempInputSource["fundingFee"]}
                        />
                      ) : (
                        <></>
                      )}
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        format="Currency"
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Closing Costs"
                        placeholder="Closing Costs"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "closingCosts",
                          });
                        }}
                        value={tempInputSource["closingCosts"]}
                      />
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        format="Currency"
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Credits"
                        placeholder="Credits"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "credits",
                          });
                        }}
                        value={tempInputSource["credits"]}
                      />
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        format="Currency"
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Prepaid & Escrows"
                        placeholder="Prepaid & Escrows"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "prepaidEscrows",
                          });
                        }}
                        value={tempInputSource["prepaidEscrows"]}
                      />
                      <InputBox
                        type="text"
                        style={{ marginBottom: 25 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        format="percentage"
                        label="APR"
                        placeholder="apr"
                        onChangeText={({ target }) => {
                          const { value } = target;
                          handleTempInputSource({
                            value,
                            name: "apr",
                          });
                        }}
                        value={tempInputSource["apr"]}
                      />
                    </>
                  ) : editScreen === "Amortization Schedule" ? (
                    <AmortSchedule amortSchedule={amortSchedule} />
                  ) : (
                    <></>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    backgroundColor: "white",
                    padding: "20px",
                    bottom: 0,
                    position: "sticky",
                    zIndex: 3,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleEditMode(null)}
                    className="secondaryBtn"
                    style={{ marginRight: 10 }}
                  >
                    Cancel
                  </button>
                  {editScreen !== "Amortization Schedule" && (
                    <button
                      className="btnPrimary"
                      type="button"
                      onClick={() => {
                        let iInputSource = {
                            ...inputSource,
                            ...tempInputSource,
                          },
                          { purValue } = iInputSource;
                        purValue = Number(cleanValue(purValue));
                        if (editScreen === "Property") {
                          const iDownPaymentDetails =
                            handleGetDownPaymentDetails({
                              loanAmt: purValue,
                            });

                          iInputSource["loanAmt"] =
                            iDownPaymentDetails[2]["loanAmt"];

                          tempInputSource["loanAmt"] =
                            iDownPaymentDetails[2]["loanAmt"];
                        }
                        console.log({
                          ...iInputSource,
                          ...tempInputSource,
                        });
                        setInputSource((prevInputSource) => {
                          return {
                            ...prevInputSource,
                            ...tempInputSource,
                          };
                        });

                        handleCalculation({ iInputSource });
                        handleEditMode(null);
                      }}
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BuyRent;
