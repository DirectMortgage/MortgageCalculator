import { Fragment, useEffect, useState } from "react";
import {
  AutoCompleteInputBox,
  Dropdown,
  InputBox,
} from "../../CommonFunctions/Accessories";
import {
  faAngleDown,
  faAngleUp,
  faCalendarAlt,
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

const { type, w, f } = queryStringToObject(window.location?.href || "");
const isMobile = f == "m";

const headerTabs = [
    "Purchase Price",
    "Desired Monthly Payment",
    "Military BAH",
  ],
  locationJson = [
    {
      city: "Salt Lake City",
      county: "SALT LAKE",
      state: "UT",
      zipcode: "84081",
    },
    {
      city: "Edinburg ",
      county: "Hidalgo",
      state: "TX",
      zipcode: "78542",
    },
    {
      city: "Chicago  ",
      county: "Cook",
      state: "IL",
      zipcode: "60642",
    },
    {
      city: "Sugar Land",
      county: "FORT BEND ",
      state: "TX",
      zipcode: "77498",
    },
    {
      city: "Pinal",
      county: "Casa Grande ",
      state: "AZ",
      zipcode: "85122",
    },
    { city: "Florence", county: "Pinal", state: "AZ", zipcode: "85142" },
    {
      city: "PINAL",
      county: "San Tan Valley  ",
      state: "AZ",
      zipcode: "85140",
    },
    {
      city: "PINAL",
      county: "Apache Junction ",
      state: "AZ",
      zipcode: "85120",
    },
    { city: "Florence", county: "Pinal", state: "AZ", zipcode: "85143" },
    { city: "Florence", county: "Pinal", state: "AZ", zipcode: "85138" },
    {
      city: "Salt Lake City",
      county: "SALT LAKE",
      state: "UT",
      zipcode: "84129",
    },
    {
      city: "Richmond ",
      county: "FORT BEND ",
      state: "TX",
      zipcode: "77407",
    },
    {
      city: "Montrose ",
      county: "Montrose",
      state: "CO",
      zipcode: "81403",
    },
    { city: "Salinas", county: "Monterey", state: "CA", zipcode: "93950" },
    {
      city: "Los Angeles",
      county: "Los Angeles",
      state: "CA",
      zipcode: "90703",
    },
    { city: "Fresno", county: "Fresno", state: "CA", zipcode: "93737" },
    {
      city: "Fort Payne",
      county: "DEKALB",
      state: "AL",
      zipcode: "35968",
    },
    {
      city: "Pinal",
      county: "Florence ",
      state: "AZ",
      zipcode: "85132",
    },
    {
      city: "Pinal",
      county: "Eloy ",
      state: "AZ",
      zipcode: "85131",
    },
    {
      city: "Salt Lake City",
      county: "SALT LAKE",
      state: "UT",
      zipcode: "84009",
    },
    { city: "Phoenix", county: "Maricopa", state: "AZ", zipcode: "85027" },
    {
      city: "Maywood  ",
      county: "Cook",
      state: "IL",
      zipcode: "60153",
    },
    {
      city: "Queenstown",
      county: "Queen Annes",
      state: "MD",
      zipcode: "21658",
    },
    {
      city: "Quenemo  ",
      county: "OSAGE ",
      state: "KS",
      zipcode: "66528",
    },
    {
      city: "Quimby   ",
      county: "CHEROKEE  ",
      state: "IA",
      zipcode: "51049",
    },
    {
      city: "Quinault ",
      county: "Grays Harbor",
      state: "WA",
      zipcode: "98575",
    },
    {
      city: "Quinby   ",
      county: "ACCOMACK  ",
      state: "VA",
      zipcode: "23423",
    },
    {
      city: "Quincy   ",
      county: "GADSDEN   ",
      state: "FL",
      zipcode: "32351",
    },
    {
      city: "Quincy   ",
      county: "GADSDEN   ",
      state: "FL",
      zipcode: "32353",
    },
    {
      city: "Quincy   ",
      county: "ADAMS ",
      state: "IL",
      zipcode: "62306",
    },
    {
      city: "Quincy   ",
      county: "LEWIS ",
      state: "KY",
      zipcode: "41166",
    },
    {
      city: "Quincy   ",
      county: "Norfolk",
      state: "MA",
      zipcode: "02269",
    },
    {
      city: "Quincy   ",
      county: "BRANCH",
      state: "MI",
      zipcode: "49082",
    },
    {
      city: "Quincy   ",
      county: "HICKORY   ",
      state: "MO",
      zipcode: "65735",
    },
    {
      city: "Quincy   ",
      county: "LOGAN ",
      state: "OH",
      zipcode: "43343",
    },
    {
      city: "Quincy   ",
      county: "Franklin",
      state: "PA",
      zipcode: "17247",
    },
    {
      city: "Quinebaug",
      county: "WINDHAM ",
      state: "CT",
      zipcode: "06262",
    },
    {
      city: "Quinhagak",
      county: "BETHEL  ",
      state: "AK",
      zipcode: "99655",
    },
    {
      city: "Quinnesec",
      county: "DICKINSON ",
      state: "MI",
      zipcode: "49876",
    },
    {
      city: "Quinque  ",
      county: "Greene",
      state: "VA",
      zipcode: "22965",
    },
    {
      city: "Quinter  ",
      county: "GOVE",
      state: "KS",
      zipcode: "67752",
    },
    {
      city: "Quinton  ",
      county: "Salem",
      state: "NJ",
      zipcode: "08072",
    },
    {
      city: "Quinton  ",
      county: "PITTSBURG ",
      state: "OK",
      zipcode: "74561",
    },
    {
      city: "Quinton  ",
      county: "New Kent",
      state: "VA",
      zipcode: "23141",
    },
    {
      city: "Quitaque ",
      county: "BRISCOE   ",
      state: "TX",
      zipcode: "79255",
    },
    {
      city: "Quitman  ",
      county: "BROOKS",
      state: "GA",
      zipcode: "31643",
    },
    {
      city: "Quitman  ",
      county: "NODAWAY   ",
      state: "MO",
      zipcode: "64487",
    },
    {
      city: "Quitman  ",
      county: "CLARKE",
      state: "MS",
      zipcode: "39355",
    },
    {
      city: "Qulin",
      county: "BUTLER",
      state: "MO",
      zipcode: "63961",
    },
    {
      city: "Quogue   ",
      county: "Suffolk",
      state: "NY",
      zipcode: "11959",
    },
    {
      city: "Rabun Gap",
      county: "RABUN ",
      state: "GA",
      zipcode: "30568",
    },
    {
      city: "Raceland ",
      county: "LAFOURCHE ",
      state: "LA",
      zipcode: "70394",
    },
    {
      city: "Rachel   ",
      county: "MARION",
      state: "WV",
      zipcode: "26587",
    },
    {
      city: "Racine   ",
      county: "MOWER ",
      state: "MN",
      zipcode: "55967",
    },
    {
      city: "Racine   ",
      county: "NEWTON",
      state: "MO",
      zipcode: "64858",
    },
    {
      city: "Racine   ",
      county: "MEIGS ",
      state: "OH",
      zipcode: "45771",
    },
    {
      city: "Racine   ",
      county: "Racine",
      state: "WI",
      zipcode: "53401",
    },
    {
      city: "Racine   ",
      county: "Racine",
      state: "WI",
      zipcode: "53402",
    },
    {
      city: "Racine   ",
      county: "Racine",
      state: "WI",
      zipcode: "53403",
    },
    {
      city: "Racine   ",
      county: "Racine",
      state: "WI",
      zipcode: "53404",
    },
    {
      city: "Racine   ",
      county: "Racine",
      state: "WI",
      zipcode: "53405",
    },
    {
      city: "Racine   ",
      county: "Racine",
      state: "WI",
      zipcode: "53406",
    },
    {
      city: "Racine   ",
      county: "Racine",
      state: "WI",
      zipcode: "53407",
    },
    {
      city: "Racine   ",
      county: "Racine",
      state: "WI",
      zipcode: "53408",
    },
    {
      city: "Racine   ",
      county: "BOONE ",
      state: "WV",
      zipcode: "25165",
    },
    { city: "Marysville", county: "Yuba", state: "CA", zipcode: "95972" },
    {
      city: "Radcliff ",
      county: "HARDIN",
      state: "KY",
      zipcode: "40159",
    },
    {
      city: "Radcliff ",
      county: "HARDIN",
      state: "KY",
      zipcode: "40160",
    },
    {
      city: "Radcliff ",
      county: "VINTON",
      state: "OH",
      zipcode: "45695",
    },
    {
      city: "Radcliffe",
      county: "HARDIN",
      state: "IA",
      zipcode: "50230",
    },
    {
      city: "Radersburg",
      county: "BROADWATER",
      state: "MT",
      zipcode: "59641",
    },
    {
      city: "Radford  ",
      county: "Radford City",
      state: "VA",
      zipcode: "24142",
    },
    {
      city: "Radford  ",
      county: "Radford City",
      state: "VA",
      zipcode: "24143",
    },
    {
      city: "Radiant  ",
      county: "Madison",
      state: "VA",
      zipcode: "22732",
    },
    {
      city: "Radisson ",
      county: "SAWYER",
      state: "WI",
      zipcode: "54867",
    },
    {
      city: "Radium Springs  ",
      county: "Dona Ana",
      state: "NM",
      zipcode: "88054",
    },
    {
      city: "Radnor   ",
      county: "Delaware",
      state: "OH",
      zipcode: "43066",
    },
    {
      city: "Radom",
      county: "WASHINGTON",
      state: "IL",
      zipcode: "62876",
    },
    {
      city: "Raeford  ",
      county: "HOKE",
      state: "NC",
      zipcode: "28376",
    },
    {
      city: "Ragland  ",
      county: "SAINT CLAIR",
      state: "AL",
      zipcode: "35131",
    },
    {
      city: "Ragland  ",
      county: "MINGO ",
      state: "WV",
      zipcode: "25690",
    },
    {
      city: "Ragley   ",
      county: "BEAUREGARD",
      state: "LA",
      zipcode: "70657",
    },
    {
      city: "Ragsdale ",
      county: "KNOX",
      state: "IN",
      zipcode: "47573",
    },
    {
      city: "Rahway   ",
      county: "Union",
      state: "NJ",
      zipcode: "07065",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09494",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09496",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09509",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09510",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09554",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09589",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09601",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09602",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09603",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09604",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09605",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09606",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09610",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09613",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09617",
    },
    {
      city: "APO",
      state: "AE",
      zipcode: "09623",
    },
  ],
  statePropertyTax = [
    { Id: 1, StateCode: "AK", RETaxRate: 0.0118 },
    { Id: 2, StateCode: "AL", RETaxRate: 0.0043 },
    { Id: 3, StateCode: "AR", RETaxRate: 0.0062 },
    { Id: 4, StateCode: "AZ", RETaxRate: 0.0081 },
    { Id: 5, StateCode: "CA", RETaxRate: 0.0081 },
    { Id: 6, StateCode: "CO", RETaxRate: 0.006 },
    { Id: 7, StateCode: "CT", RETaxRate: 0.0197 },
    { Id: 8, StateCode: "DC", RETaxRate: 0.0056 },
    { Id: 9, StateCode: "DE", RETaxRate: 0.0054 },
    { Id: 10, StateCode: "FL", RETaxRate: 0.0106 },
    { Id: 11, StateCode: "GA", RETaxRate: 0.0094 },
    { Id: 12, StateCode: "HI", RETaxRate: 0.0027 },
    { Id: 13, StateCode: "IA", RETaxRate: 0.0148 },
    { Id: 14, StateCode: "ID", RETaxRate: 0.0076 },
    { Id: 15, StateCode: "IL", RETaxRate: 0.023 },
    { Id: 16, StateCode: "IN", RETaxRate: 0.0087 },
    { Id: 17, StateCode: "KS", RETaxRate: 0.014 },
    { Id: 18, StateCode: "KY", RETaxRate: 0.0085 },
    { Id: 19, StateCode: "LA", RETaxRate: 0.0049 },
    { Id: 20, StateCode: "MA", RETaxRate: 0.012 },
    { Id: 21, StateCode: "MD", RETaxRate: 0.011 },
    { Id: 22, StateCode: "ME", RETaxRate: 0.013 },
    { Id: 23, StateCode: "MI", RETaxRate: 0.0178 },
    { Id: 24, StateCode: "MN", RETaxRate: 0.0118 },
    { Id: 25, StateCode: "MO", RETaxRate: 0.01 },
    { Id: 26, StateCode: "MS", RETaxRate: 0.0079 },
    { Id: 27, StateCode: "MT", RETaxRate: 0.0085 },
    { Id: 28, StateCode: "NC", RETaxRate: 0.0085 },
    { Id: 29, StateCode: "ND", RETaxRate: 0.0112 },
    { Id: 30, StateCode: "NE", RETaxRate: 0.0185 },
    { Id: 31, StateCode: "NH", RETaxRate: 0.0215 },
    { Id: 32, StateCode: "NJ", RETaxRate: 0.0235 },
    { Id: 33, StateCode: "NM", RETaxRate: 0.0074 },
    { Id: 34, StateCode: "NV", RETaxRate: 0.0085 },
    { Id: 35, StateCode: "NY", RETaxRate: 0.0162 },
    { Id: 36, StateCode: "OH", RETaxRate: 0.0156 },
    { Id: 37, StateCode: "OK", RETaxRate: 0.0088 },
    { Id: 38, StateCode: "OR", RETaxRate: 0.0108 },
    { Id: 39, StateCode: "PA", RETaxRate: 0.0153 },
    { Id: 40, StateCode: "PR", RETaxRate: 0.08 },
    { Id: 41, StateCode: "RI", RETaxRate: 0.0163 },
    { Id: 42, StateCode: "SC", RETaxRate: 0.0057 },
    { Id: 43, StateCode: "SD", RETaxRate: 0.0134 },
    { Id: 44, StateCode: "TN", RETaxRate: 0.0075 },
    { Id: 45, StateCode: "TX", RETaxRate: 0.019 },
    { Id: 46, StateCode: "UT", RETaxRate: 0.0068 },
    { Id: 47, StateCode: "VA", RETaxRate: 0.008 },
    { Id: 48, StateCode: "VT", RETaxRate: 0.0174 },
    { Id: 49, StateCode: "WA", RETaxRate: 0.0108 },
    { Id: 50, StateCode: "WI", RETaxRate: 0.0196 },
    { Id: 51, StateCode: "WV", RETaxRate: 0.0058 },
    { Id: 52, StateCode: "WY", RETaxRate: 0.0061 },
  ];

const Card = ({ title = "", children }) => {
  return (
    <div>
      <span className="rbDarkWord">{title}</span>
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
            : "red"
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
      y: chartData["amt"][i] + 20000,
      text: formatCurrency(chartData["amt"][i]),
      xanchor: "center",
      yanchor: "bottom",
      showarrow: !false,
      ax: 0,
      ay: -6,
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
    layout["width"] =
      // w - 80 ||
      "unset";
  }
  const config = {
    displayModeBar: false,
  };

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
          overflowX: "scroll",
        }}
        data={data}
        layout={layout}
        config={config}
      />
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

      totals["stBalance"] = yearArr[11]["Balance"];
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
                    activeTab === index ? "btnPrimary" : "purpleSecButton"
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
                  <td>{formatCurrency(Math.round(payment.Amount))}</td>
                  <td>{formatCurrency(Math.round(payment.Interest))}</td>
                  <td>{formatCurrency(Math.round(payment.Principal))}</td>
                  <td>{formatCurrency(Math.round(payment.stBalance))}</td>
                </tr>
              ) : (
                <CollapsibleRow payment={payment} defaultIsOpen={true}>
                  {payment["childRows"]?.map((row) => {
                    return (
                      <tr key={row.paymentNumber}>
                        <td>{row.paymentNumber}</td>
                        <td>{formatCurrency(Math.round(row.Amount))}</td>
                        <td>{formatCurrency(Math.round(row.Interest))}</td>
                        <td>{formatCurrency(Math.round(row.Principal))}</td>
                        <td>{formatCurrency(Math.round(row.stBalance))}</td>
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
        onHover={handleHover}
        onUnhover={() => {
          setTooltipTableDetails({
            x: 0,
            y: 0,
            isShow: false,
          });
        }}
      />
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
  return (
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
                            {/* <p>$</p> */}
                            <p>
                              {formatCurrency(
                                Math.round(rData["buy"]) || 0,
                                2,
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
                                2,
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
  const [year, setYear] = useState(5);
  const handleChange = (newValues) => {
    setYear(newValues[1]);
  };
  const [editScreen, setEditScreen] = useState(null);
  const [propTaxView, setPropTaxView] = useState("$");
  const [focusElement, setFocusElement] = useState({ target: null, top: 0 });
  const handleEditMode = (screenName) => {
    setEditScreen(screenName);

    document.querySelector("body").style.overflow = screenName
      ? "hidden"
      : "auto";

    document.querySelector("body").style.paddingRight = screenName
      ? getScrollbarWidth() + "px"
      : 0;
  };
  function getScrollbarWidth() {
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
  }

  const [activeTab, setActiveTab] = useState(0),
    [inputSource, setInputSource] = useState({
      clientName: "",
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
      monthlyRent: 2000,
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
      purValue: "",
      closingCosts: 1200,
      armRateInitialAdj: 12,
      prepaidEscrows: "0",
      apr: 0,
      credits: "0",
    }),
    [tempInputSource, setTempInputSource] = useState({
      clientName: "",
      desMonthlyPayment: 3000,
      ltvRatio: 90,
      rate: 6.25,
      purValue: "",
      armRateInitialAdj: 12,
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
      monthlyRent: 2000,
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
      closingCosts: 1200,
      credits: "0",
      prepaidEscrows: "0",
      apr: 0,
      averageHistorical: 4.213,
      upfrontMI: 0,
    }),
    [netGainDetails, setNetGainDetails] = useState([]),
    [amortSchedule, setAmortSchedule] = useState([]),
    [outPutDetails, setOutPutDetails] = useState({}),
    [currentScreen, setCurrentScreen] = useState("inputBlock"); //inputBlock

  const handleInputSource = ({ name, value }) => {
    setInputSource((prevInputSource) => {
      return { ...prevInputSource, [name]: value };
    });
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
        margin: 2.5rem 20px 15rem !important;
      }
      .rbResultBodyWrapper {
        display: unset;
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
        width:90%;
        min-width: 90%;
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
      location = location.split(", ").slice(1, 4);

      const statePropertyObj = statePropertyTax.filter(
          (taxDetails) => taxDetails["StateCode"] === location[1]?.trim()
        ),
        estPropTaxPercent = statePropertyObj[0]["RETaxRate"];

      iTempInputSource["estPropTax"] = purValue * estPropTaxPercent;
      iTempInputSource["propTax"] = roundValue(purValue * estPropTaxPercent, 0);

      iTempInputSource["estPropTaxPercent"] = estPropTaxPercent;
      iTempInputSource["estPropTaxPercentStatic"] = estPropTaxPercent;
      iTempInputSource["locationText"] = location.reverse().join(", ");

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
        loanAmt,
        loanType,
        upfrontMI = 0,
        armRateInitialAdj = 12,
      } = iInputSource,
      firstPaymentDate = formatNewDate(
        getFirstDateFormDisbursement(calculateFirstDate(new Date(), true, 2))
      ),
      ratesArray = [];
    let loanTerm = term * 12;

    amortizeType = Number(amortizeType);
    armRateInitialAdj = Number(armRateInitialAdj);

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
      let armGrossMargin = 2,
        armLifeCap = 0.05,
        armIndexValue = 0, //check this value
        armRateSubAdj = 12,
        newRate = parseFloat(rate / 100);

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
        0,
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
        0,
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
      //=============== 2nd - End ===============
    }
    console.log({ ratesArray });
    const cashFlow = calculateCashFlows(
      cleanValue(purValue),
      loanTerm,
      firstPaymentDate,
      ratesArray,
      miAmt
    );
    const {
      Amount: monthlyPayment,
      intRate: movingRate,
      intRate: noteRate,
    } = cashFlow[0];
    let zeroFlow = 0,
      disbursementDates = formatDate(calculateFirstDate(new Date(), true, 2)); //getFirstDateFormDisbursement(disbursementDates)

    zeroFlow = 0 - loanAmt;

    if (zeroFlow >= 0) {
      throw new Error("Invalid zeroFlow");
    }

    const { oddFactor } = calculateOddFactor(
      new Date(disbursementDates),
      firstPaymentDate
    );
    const aprParams = {
      cashFlow,
      loanType,
      purchasePrice: cleanValue(purValue),
      appraisedValue: loanAmt,
      loanAmount: loanAmt,
      upFrontMIPFactor: upfrontMI,
      loanTerm,
      fhaCaseDate: undefined,
      iMiPercent: miAmt / loanAmt / 100,
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
    const ARP = await handleCalculateARP(aprParams);

    console.log("ARP ===> ", { ARP });
    iInputSource["purValue"] = cleanValue(iInputSource["purValue"]);
    inputSource["apr"] = ARP;
    const iOutPutDetails = handleCalculateNetGain(iInputSource, cashFlow, year);

    console.log("cashFlow ===> ", cashFlow);
    console.log("outPutDetails ===> ", iOutPutDetails);

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

  const handleGetDownPaymentDetails = ({ loanAmt }) => {
    const downPaymentPercent = [3, 3.5, 5, 10, 15, 20, 25, 100];

    const iDownPaymentDetails = downPaymentPercent.map((percentage) => {
      const downPayment = loanAmt * (percentage / 100);
      return {
        percentage,
        downPayment,
        loanAmt: loanAmt - downPayment,
      };
    });
    return iDownPaymentDetails;
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
                  style={{ marginBottom: 35 }}
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
                  inputBoxStyle={{ fontFamily: "Inter" }}
                  validate={false}
                  style={{ marginBottom: 35, paddingLeft: 10 }}
                  label="Location"
                  placeholder="Enter address, city, county, or ZIP code."
                  listIcon=<FontAwesomeIcon
                    icon={faLocationDot}
                    style={{ marginRight: 5 }}
                  />
                  options={locationJson.map((item) => {
                    return {
                      label:
                        item.city +
                        ", " +
                        item.county +
                        ", " +
                        item.state +
                        ", " +
                        item.zipcode +
                        ", USA",
                      //,                      value: item.zipcode.toString(),
                    };
                  })}
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
                    style={{ marginBottom: 35 }}
                    type="text"
                    inputBoxStyle={{ fontFamily: "Inter" }}
                    validate={false}
                    label="Purchase Value"
                    placeholder="Purchase Value"
                    onChangeText={({ target }) => {
                      const { value } = target;
                      handleInputSource({ value, name: "purValue" });
                    }}
                    value={inputSource["purValue"]}
                    symbol={
                      <span
                        style={{
                          position: "absolute",
                          left: 15,
                          fontFamily: "inter",
                          fontSize: 14,
                        }}
                      >
                        $
                      </span>
                    }
                  />
                ) : activeTab === 1 ? (
                  <>
                    <InputBox
                      type="text"
                      style={{ marginBottom: 35 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="Desired Monthly Payment"
                      placeholder="Desired Monthly Payment"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "desMonthlyPayment" });
                      }}
                      value={formatCurrency(
                        inputSource["desMonthlyPayment"] || 0,
                        0,
                        false
                      )}
                      symbol={
                        <span
                          style={{
                            position: "absolute",
                            left: 15,
                            fontFamily: "inter",
                            fontSize: 14,
                          }}
                        >
                          $
                        </span>
                      }
                    />
                    <InputBox
                      type="text"
                      style={{ marginBottom: 35 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="LTV Ratio"
                      placeholder="LTV Ratio"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "ltvRatio" });
                      }}
                      value={inputSource["ltvRatio"]}
                      symbol={
                        <span
                          style={{
                            position: "absolute",
                            right: 15,
                            fontFamily: "inter",
                            fontSize: 14,
                          }}
                        >
                          %
                        </span>
                      }
                      symbolPosition="right"
                    />
                  </>
                ) : activeTab === 2 ? (
                  <>
                    <InputBox
                      symbol={
                        <span
                          style={{
                            position: "absolute",
                            left: 15,
                            fontFamily: "inter",
                            fontSize: 14,
                          }}
                        >
                          $
                        </span>
                      }
                      type="text"
                      style={{ marginBottom: 35 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="Monthly Allowance"
                      placeholder="Monthly Allowance"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "monthlyAllowance" });
                      }}
                      value={formatCurrency(
                        inputSource["monthlyAllowance"] || 0,
                        0,
                        false
                      )}
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
                      style={{ marginBottom: 35 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="Rate"
                      placeholder="Rate"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleInputSource({ value, name: "rate" });
                      }}
                      value={inputSource["rate"]}
                      symbol={
                        <span
                          style={{
                            position: "absolute",
                            right: 15,
                            fontFamily: "inter",
                            fontSize: 14,
                          }}
                        >
                          %
                        </span>
                      }
                      symbolPosition="right"
                    />
                    <InputBox
                      type="text"
                      style={{ marginBottom: 35 }}
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
                // disabled={true}
                onClick={() => {
                  try {
                    let iInputSource = inputSource,
                      { purValue } = iInputSource;
                    purValue = Number(cleanValue(purValue));
                    const iDownPaymentDetails = handleGetDownPaymentDetails({
                        loanAmt: purValue,
                      }),
                      location = iInputSource.location.split(", ").slice(1, 4),
                      statePropertyObj = statePropertyTax.filter(
                        (taxDetails) =>
                          taxDetails["StateCode"] === location[1]?.trim()
                      ),
                      estPropTaxPercent = statePropertyObj[0]["RETaxRate"];

                    iInputSource["estPropTax"] = purValue * estPropTaxPercent;
                    iInputSource["propTax"] = roundValue(
                      purValue * estPropTaxPercent,
                      0
                    );
                    iInputSource["estPropTaxPercent"] = estPropTaxPercent;
                    iInputSource["estPropTaxPercentStatic"] = estPropTaxPercent;
                    iInputSource["loanAmt"] = iDownPaymentDetails[2]["loanAmt"];
                    iInputSource["locationText"] = location
                      .reverse()
                      .join(", ");

                    setTempInputSource((prevTempInputSource) => {
                      return { ...prevTempInputSource, ...iInputSource };
                    });
                    setInputSource(() => ({ ...iInputSource }));
                    setDownPaymentDetails(iDownPaymentDetails);

                    handleCalculation({ iInputSource });

                    setCurrentScreen("outputBlock");
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
            <div
              className={
                isMobile ? "rbResultBodyWrapperMobile" : "rbResultBodyWrapper"
              }
            >
              <div>
                {/* <button onClick={handleCalculation}>Test </button> */}
                <Card title="Client">
                  <div>
                    <span className="rbDarkWord">
                      {inputSource["clientName"]}
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
                      {formatCurrency(inputSource["purValue"])}
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
                    <span className="rbDarkWord">{formatCurrency(2000)}</span>
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
                      {formatCurrency(inputSource["loanAmt"] || 0)}
                    </span>
                    <div className="rbWord">{inputSource["term"]} Years</div>
                    <div className="rbWord">
                      {inputSource["loanTypeText"]},
                      {inputSource["amortizeTypeText"]}, {inputSource["rate"]}%
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
                    onClick={() => handleEditMode("Loan")}
                  >
                    Edit
                  </button>
                </Card>
                {/* Co-branding Info */}
                {/* <Card title="Co-branding">
                  <div>
                    <span className="rbWord">
                      Add co-branding to your Buy vs Rent.
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
                    onClick={() => {}}
                  >
                    Add
                  </button>
                </Card> */}
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
                        Purchase Price
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
                        ZIP Code, County, State
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
                      {year} Years
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
                              Appreciation Gain
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
                              Amortization Gain
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
                              Cashflow Difference
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
                              Purchase Closing Cost
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
                              Tax Benefit Over Renting†
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
                              Cost To Sell Est. {inputSource["costToSell"]}%
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
              <div className="floatingScreen">
                <h2 style={{ textAlign: "center" }}>{editScreen}</h2>
                <div
                  style={{
                    overflow: "auto",
                    maxHeight: "80vh",
                    padding: "15px 30px",
                  }}
                >
                  {editScreen === "Client" ? (
                    <>
                      <InputBox
                        type="text"
                        style={{ marginBottom: 35 }}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              right: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            %
                          </span>
                        }
                        symbolPosition="right"
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
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
                        style={{ marginBottom: 35 }}
                        label="Location"
                        placeholder="Enter address, city, county, or ZIP code."
                        listIcon=<FontAwesomeIcon
                          icon={faLocationDot}
                          // size={25}
                          style={{ marginRight: 5 }}
                        />
                        options={locationJson.map((item) => {
                          return {
                            label:
                              item.city +
                              ", " +
                              item.county +
                              ", " +
                              item.state +
                              ", " +
                              item.zipcode +
                              ", USA",
                            //   value: item.zipcode.toString(),
                          };
                        })}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
                        style={{ marginBottom: 35 }}
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
                          County est. tax: <b>${inputSource["estPropTax"]}</b>
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
                        <div>
                          Est. tax: <b>${tempInputSource["propTax"]}</b>
                        </div>
                      </div>
                      <InputBox
                        type="text"
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Annual Property Tax"
                        placeholder="Property Tax"
                        onChangeText={({ target }) => {
                          let { value } = target,
                            amt = 0,
                            percent = 0;
                          if (propTaxView === "%") {
                            percent = parseFloat(value) / 100;
                            amt = getPercentageValue({
                              totalValue: parseFloat(
                                tempInputSource["purValue"]
                              ),
                              percentage: percent,
                            });
                          } else {
                            amt = parseFloat(value);
                            percent =
                              getValuePercentage({
                                totalValue: parseFloat(
                                  tempInputSource["purValue"]
                                ),
                                amount: amt,
                              }) / 100;
                          }

                          handleTempInputSource({
                            value: percent,
                            name: "estPropTaxPercent",
                          });
                          handleTempInputSource({
                            value: roundValue(amt, 0),
                            name: "propTax",
                          });
                        }}
                        value={
                          propTaxView === "$"
                            ? tempInputSource["propTax"]
                            : roundValue(
                                parseFloat(
                                  tempInputSource["estPropTaxPercent"]
                                ) * 100
                              )
                        }
                        symbol={
                          <div className="inputBoxControl" style={{}}>
                            <span
                              onClick={() => setPropTaxView("$")}
                              className={propTaxView === "$" ? "active" : ""}
                            >
                              $
                            </span>
                            <span
                              onClick={() => setPropTaxView("%")}
                              className={propTaxView === "%" ? "active" : ""}
                            >
                              %
                            </span>
                          </div>
                        }
                        symbolPosition="right"
                      />
                      <InputBox
                        type="text"
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
                        style={{ marginBottom: 35 }}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
                        style={{ marginBottom: 35 }}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
                        style={{ marginBottom: 35 }}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              right: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            %
                          </span>
                        }
                        symbolPosition="right"
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              right: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            %
                          </span>
                        }
                        symbolPosition="right"
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
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
                          {/* <label>
                            <input
                              type="radio"
                              value="forecast"
                              checked={
                                tempInputSource["appCalcType"] === "forecast"
                              }
                              onChange={() =>
                                handleTempInputSource({
                                  value: "forecast",
                                  name: "appCalcType",
                                })
                              }
                            />
                            Forecast: 4.252%
                          </label>
                          <label> 
                            <input
                              type="radio"
                              value="historical"
                              checked={
                                tempInputSource["appCalcType"] === "historical"
                              }
                              onChange={() =>
                                handleTempInputSource({
                                  value: "historical",
                                  name: "appCalcType",
                                })
                              }
                            />
                            Historical: {inputSource["averageHistorical"]}%
                          </label>*/}
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
                              style={{ marginBottom: 35 }}
                              inputBoxStyle={{ fontFamily: "Inter" }}
                              validate={false}
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
                              symbol={
                                <span
                                  style={{
                                    position: "absolute",
                                    right: 15,
                                    fontFamily: "inter",
                                    fontSize: 14,
                                  }}
                                >
                                  %
                                </span>
                              }
                              symbolPosition="right"
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
                        style={{ marginBottom: 35 }}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
                        style={{ marginBottom: 35 }}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              right: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            %
                          </span>
                        }
                        symbolPosition="right"
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
                        style={{ marginBottom: 35 }}
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
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
                        label="Term"
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
                        options={[
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
                        ]}
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
                          style={{ marginBottom: 35 }}
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
                        style={{ marginBottom: 35 }}
                        isValid={false}
                        label="Loan Type"
                        options={[
                          {
                            text: "Select",
                            value: "0",
                          },
                          {
                            text: "Fixed Rate",
                            value: "1",
                          },
                          {
                            text: "GPM – Graduated Payment Mortgage",
                            value: "2",
                          },
                          {
                            text: "ARM – Adjustable Rate Mortgage",
                            value: "3",
                          },
                          {
                            text: "Fixed - Interest Only",
                            value: "5",
                          },
                          {
                            text: "Other",
                            value: "4",
                          },
                          {
                            text: "Buydown",
                            value: "6",
                          },
                          {
                            text: "ARM - Interest Only",
                            value: "7",
                          },
                          {
                            text: "Balloon",
                            value: "8",
                          },
                          {
                            text: "HELOC",
                            value: "9",
                          },
                        ]}
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
                          style={{ marginBottom: 35 }}
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              right: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            %
                          </span>
                        }
                        symbolPosition="right"
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
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
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
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
                        style={{ marginBottom: 35 }}
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
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
                            style={{ marginBottom: 35 }}
                            symbol={
                              <span
                                style={{
                                  position: "absolute",
                                  left: 15,
                                  fontFamily: "inter",
                                  fontSize: 14,
                                }}
                              >
                                $
                              </span>
                            }
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
                          style={{ marginBottom: 35 }}
                          symbol={
                            <span
                              style={{
                                position: "absolute",
                                left: 15,
                                fontFamily: "inter",
                                fontSize: 14,
                              }}
                            >
                              $
                            </span>
                          }
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
                          style={{ marginBottom: 35 }}
                          symbol={
                            <span
                              style={{
                                position: "absolute",
                                left: 15,
                                fontFamily: "inter",
                                fontSize: 14,
                              }}
                            >
                              $
                            </span>
                          }
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
                        style={{ marginBottom: 35 }}
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
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
                        style={{ marginBottom: 35 }}
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
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
                        style={{ marginBottom: 35 }}
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              left: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            $
                          </span>
                        }
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
                        symbol={
                          <span
                            style={{
                              position: "absolute",
                              right: 15,
                              fontFamily: "inter",
                              fontSize: 14,
                            }}
                          >
                            %
                          </span>
                        }
                        symbolPosition="right"
                        style={{ marginBottom: 35 }}
                        inputBoxStyle={{ fontFamily: "Inter" }}
                        validate={false}
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
