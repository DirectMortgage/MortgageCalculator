import { Fragment, useEffect, useState } from "react";
import { Dropdown, InputBox } from "../../../CommonFunctions/Accessories";
import {
  formatCurrency,
  formatNewDate,
  formatPercentage,
  queryStringToObject,
} from "../../../CommonFunctions/GeneralCalculations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  calculateCashFlows,
  calculateFirstDate,
  cleanValue,
  getFirstDateFormDisbursement,
  updateARMRate,
} from "../../../CommonFunctions/CalcLibrary";
import { handleGetLoanData } from "../../../CommonFunctions/CommonFunctions";

const { type, w, f, loanId, p } = queryStringToObject(
  window.location?.href || ""
);
const isMobile = f == "m",
  isApp = Boolean(parseInt(p));
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
];

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
          position: "sticky",
          top: 0,
          textAlign: "right",
          zIndex: 1,
          borderRadius: 4,
        }}
      >
        <div
          style={{
            display: "inline-block",
            margin: 10,
          }}
        >
          <div
            style={{
              border: "1px solid #508bc9",
              width: "100%",
              justifyContent: "end",
              display: "flex",
              zIndex: 1,
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
                    maxHeight: 28,
                    fontSize: 10,
                    left: index === 0 ? -1 : 0,
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

      <table className="amortSchedule hPTable" cellSpacing="0">
        <thead style={{ top: 49 }}>
          <tr>
            <th style={{ textAlign: "center" }}>
              {activeTab == 0 ? "Month" : "Year"}
            </th>
            <th>Paid</th>
            <th>Interest</th>
            <th>Principal</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((payment, index) => (
            <Fragment key={payment.paymentNumber}>
              {activeTab !== 0 ? (
                <tr>
                  <td style={{ textAlign: "center" }}>
                    {payment.paymentNumber}
                  </td>
                  <td>{formatCurrency(parseInt(payment.Amount), 0)}</td>
                  <td>{formatCurrency(parseInt(payment.Interest), 0)}</td>
                  <td>{formatCurrency(parseInt(payment.Principal), 0)}</td>
                  <td>
                    {formatCurrency(
                      parseInt(payment.Balance > 0 ? payment.Balance : 0),
                      0
                    )}
                  </td>
                </tr>
              ) : (
                <CollapsibleRow
                  payment={payment}
                  defaultIsOpen={true}
                  stickyHeaderIndex={index + 1}
                >
                  {payment["childRows"]?.map((row) => {
                    return (
                      <tr key={row.paymentNumber}>
                        <td style={{ textAlign: "center" }}>
                          {row.paymentNumber}
                        </td>
                        <td>{formatCurrency(parseInt(row.Amount), 0)}</td>
                        <td>{formatCurrency(parseInt(row.Interest), 0)}</td>
                        <td>{formatCurrency(parseInt(row.Principal), 0)}</td>
                        <td>{formatCurrency(parseInt(row.Balance), 0)}</td>
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
const CollapsibleRow = ({
  payment,
  defaultIsOpen = false,
  children,
  stickyHeaderIndex = 0,
}) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  return (
    <>
      <tr
        key={payment.paymentNumber}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...{ backgroundColor: "#f4f8f8", cursor: "pointer" },
          ...(stickyHeaderIndex
            ? {
                position: "sticky",
                top: 80,
                zIndex: stickyHeaderIndex,
              }
            : {}),
        }}
      >
        <td>
          <b>
            <FontAwesomeIcon
              icon={isOpen ? faAngleUp : faAngleDown}
              style={{ fontSize: 15, top: 2, position: "relative" }}
            />
            {"  "}
            Year {payment.paymentNumber}
          </b>
        </td>
        <td>{!isOpen ? formatCurrency(Math.round(payment.Amount), 0) : ""}</td>
        <td>
          {!isOpen ? formatCurrency(Math.round(payment.Interest), 0) : ""}
        </td>
        <td>
          {!isOpen ? formatCurrency(Math.round(payment.Principal), 0) : ""}
        </td>
        <td>{!isOpen ? formatCurrency(Math.round(payment.Balance), 0) : ""}</td>
      </tr>
      {isOpen && children}
    </>
  );
};

const HousePayment = () => {
  const [inputSource, setInputSource] = useState({
      loanAmount: "",
      loanTerm: 30,
      rate: "",
      loanType: "",
    }),
    [processingStatus, setProcessingStatus] = useState(""),
    [currentScreen, setCurrentScreen] = useState("inputBlock"),
    [amortSchedule, setAmortSchedule] = useState([]);

  const handleInputSource = ({ name, value }) => {
    setInputSource((prevInputSource) => {
      return { ...prevInputSource, [name]: value };
    });
  };
  const handleCalculation = ({
    loanTerm,
    rate,
    loanAmount,
    loanType,
    miAmt = 0,
  }) => {
    debugger;
    let ratesArray = [],
      firstPaymentDate = new Date();
    loanTerm = loanTerm * 12;

    firstPaymentDate =
      new Date(firstPaymentDate) ||
      formatNewDate(
        getFirstDateFormDisbursement(calculateFirstDate(new Date(), true, 2))
      );

    //Non ARM loans block
    if (loanType !== 3 && loanType !== 7) {
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
        } = inputSource;

      armGrossMargin = armGrossMargin || 0.2;
      armRateInitialAdj = armRateInitialAdj || 12;
      armLifeCap = armLifeCap || 0.5;
      armIndexValue = armIndexValue || 0;
      armRateSubAdj = armRateSubAdj || 12;
      armRateAdjCap = armRateAdjCap || 0;

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
      loanAmount,
      loanTerm,
      firstPaymentDate,
      ratesArray,
      miAmt
    );
    console.log({ ratesArray, cashFlow });
    setAmortSchedule(cashFlow);
  };
  const handlePageLoad = async () => {
    if (loanId !== "undefined" && loanId) {
      let response = await handleGetLoanData(loanId),
        {
          "Mortgage Insurance Premium": miAmt,
          loanTerm,
          rate,
          loanAmount,
          ["Monthly Payment Factor %"]: iMiPercent,
          amortizeType: loanType,
        } = response;

      loanTerm = loanTerm / 12;
      rate = formatPercentage(cleanValue(rate) * 100);
      setProcessingStatus((prevProcessingStatus) => {
        return prevProcessingStatus.replace("loanData,", "");
      });
      setInputSource((prevInputSource) => {
        return {
          ...prevInputSource,
          ...response,
          rate,
          loanTerm,
          miAmt,
          loanAmount,
          iMiPercent,
          loanType,
        };
      });
    }
  };
  useEffect(() => {
    handlePageLoad();
  }, [loanId]);

  useEffect(() => {
    let { loanTerm, rate, loanAmount, loanType, miAmt = 0 } = inputSource;
    loanType = Number(loanType);
    loanAmount = Number(cleanValue(loanAmount));
    rate = Number(cleanValue(rate));
    loanTerm = Number(loanTerm);

    if (loanTerm && rate && loanAmount && loanType) {
      handleCalculation({ loanTerm, rate, loanAmount, loanType, miAmt });
    } else {
      setAmortSchedule([]);
    }
  }, [inputSource]);

  return (
    <>
      <div className="brHeaderWrapper">
        <div className="brHeader">
          <h2
            className="brHeaderText"
            style={{ height: 100, alignContent: "center" }}
          >
            Payment Calculator
          </h2>
        </div>
      </div>
      {currentScreen === "inputBlock" ? (
        <>
          <div className="bsBodyTab" style={{ margin: "20px 10px" }}>
            <div style={{ margin: 15 }}>
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
                  handleInputSource({ value, name: "loanAmount" });
                }}
                value={inputSource["loanAmount"]}
              />
              <InputBox
                type="text"
                inputMode="numeric"
                style={{ marginBottom: 25 }}
                inputBoxStyle={{ fontFamily: "Inter" }}
                validate={false}
                label="Term"
                placeholder="Term"
                onChangeText={({ target }) => {
                  const { value } = target;
                  handleInputSource({ value, name: "loanTerm" });
                }}
                value={inputSource["loanTerm"]}
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
              <InputBox
                type="text"
                format="percentage"
                style={{ marginBottom: 25 }}
                inputBoxStyle={{ fontFamily: "Inter" }}
                validate={false}
                label="Rate"
                placeholder="0.00"
                onChangeText={({ target }) => {
                  const { value } = target;
                  handleInputSource({ value, name: "rate" });
                }}
                value={inputSource["rate"]}
              />
              <Dropdown
                isValid={false}
                label="Loan Type"
                options={loanTypeOption}
                value={inputSource["loanType"]}
                onSelect={({ value, text }) => {
                  handleInputSource({
                    value,
                    name: "loanType",
                  });
                }}
                isMap={false}
              />
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 18,
                    color: "black",
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Monthly Payment
                </div>
                <div style={{ fontSize: 30, color: "black", fontWeight: 700 }}>
                  {formatCurrency(amortSchedule?.[0]?.["Amount"])}
                </div>
              </div>
            </div>
          </div>
          <div
            className="bsFooterTab"
            style={{
              marginTop: 25,
              marginRight: 10,
              textAlign: "right",
              zIndex: 1,
              position: "relative",
            }}
          >
            <button
              className="btnPrimary"
              style={{ padding: "10px 15px" }}
              type="button"
              disabled={amortSchedule.length === 0}
              onClick={() => {
                setCurrentScreen("resultBlock");
                setTimeout(() => {
                  document.querySelector("#btn-card-edit")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }, 300);
              }}
            >
              View Schedule{"  "}
              <FontAwesomeIcon icon={faChevronRight} color="#fff" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: 10 }}>
            <button
              className="btnPrimary"
              type="button"
              onClick={() => {
                setCurrentScreen("inputBlock");
                setInputSource({
                  loanAmount: "",
                  loanTerm: 30,
                  rate: "",
                  loanType: "",
                });
              }}
              style={{ marginBottom: 0 }}
            >
              Create New
            </button>
          </div>
          <div
            className="rbBodyContainer"
            style={{
              margin: "5px 10px 20px 10px",
              width: "unset",
              padding: 20,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 18,
                  color: "black",
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                Monthly Payment
              </div>
              <div style={{ fontSize: 25, color: "#216c2a", fontWeight: 700 }}>
                {formatCurrency(amortSchedule?.[0]?.["Amount"])}
              </div>
            </div>
          </div>
          <div
            className="rbBodyContainer"
            style={{ margin: "20px 10px", width: "unset", padding: 0 }}
          >
            <AmortSchedule amortSchedule={amortSchedule} />
          </div>
        </>
      )}
    </>
  );
};

export default HousePayment;
