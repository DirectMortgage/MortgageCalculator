import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import {
  formatCurrency,
  formatDate,
  formatNewDate,
  formatPercentage,
  queryStringToObject,
} from "../../CommonFunctions/GeneralCalculations";
import { Button, Dropdown, InputBox } from "../../CommonFunctions/Accessories";
import { Fragment } from "react";
import "../../styles.css";
import {
  calculateCashFlows,
  calculateFirstDate,
  calculateOddFactor,
  cleanValue,
  getFirstDateFormDisbursement,
  handleCalculateARP,
  updateARMRate,
} from "../../CommonFunctions/CalcLibrary";
import { handleGetLoanData } from "../../CommonFunctions/CommonFunctions";

const { w, f, loanId } = queryStringToObject(window.location?.href || "");
const isMobile = f == "m";

const styles = {
  tableInnerTitle: {
    fontSize: isMobile ? 15 : 30,
    color: "#053d5d",
    fontWeight: 600,
    display: "block",
    margin: "5px 0",
  },
  tableDivWrapper: {
    padding: isMobile ? 10 : "10px",
  },
};

const GenerateTable = ({
  columns = [],
  array = [],
  isBalance = false,
  rowRange = { start: 0, end: 7 },
  isYearly,
  armPaymentsArray = [],
}) => {
  const { start, end } = rowRange;

  if (isYearly && isBalance) {
    const yearArray = [];
    for (let i = 11; i < array.length; i += 12) {
      yearArray.push(array[i]);
    }
    array = yearArray;
  } else if (isYearly) {
    let yearArray = [];
    for (let i = 0; i < array.length; i += 12) {
      const yearArr = array.slice(i, i + 12);
      if (i > 0) {
        yearArr.push(yearArray[yearArray.length - 1]);
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
        (yearArray[yearArray.length - 1]?.["paymentNumber"] || 0) + 1;

      yearArray.push(totals);
    }
    array = yearArray;

    if (armPaymentsArray.length) {
      yearArray = [];
      for (let i = 0; i < armPaymentsArray.length; i += 12) {
        const yearArr = armPaymentsArray.slice(i, i + 12);
        if (i > 0) {
          yearArr.push(yearArray[yearArray.length - 1]);
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
          (yearArray[yearArray.length - 1]?.["paymentNumber"] || 0) + 1;

        yearArray.push(totals);
      }
      armPaymentsArray = yearArray;
    }
  }

  return (
    <div
      className="tableDivWrapper"
      style={{
        ...styles.tableDivWrapper,
        ...(isMobile ? { width: "90%" } : {}),
      }}
    >
      {isMobile ? (
        <>
          <table className="tableWrapper tableWrapperSmallView">
            <tbody>
              {array.slice(start, end).map((row, index) => (
                <Fragment key={index}>
                  <tr style={{ fontWeight: "bold" }}>
                    <td>{`${isYearly ? "Year" : "Pmt"} ${
                      row.paymentNumber
                    }`}</td>
                    <td style={{ textAlign: "right" }}>Fixed</td>
                    <td style={{ textAlign: "right" }}>ARM</td>
                  </tr>
                  {columns.map((column, cIndex) => {
                    return (
                      !["Month", "Year"].includes(column) && (
                        <tr key={cIndex}>
                          <td>{column}:</td>
                          <td style={{ textAlign: "right" }}>
                            {formatCurrency(row[column])}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {formatCurrency(armPaymentsArray[index][column])}
                          </td>
                        </tr>
                      )
                    );
                  })}
                  <tr>
                    <td>Difference:</td>
                    <td colSpan={2} style={{ textAlign: "center" }}>
                      {formatCurrency(
                        Math.abs(
                          row["Balance"] - armPaymentsArray[index]["Balance"]
                        )
                      )}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <table className="tableWrapper">
          <thead className="tableRow headerRow">
            <tr>
              {columns.map((head, index) => (
                <td key={index}>{head === "Month" ? "Pmt" : head}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {array.slice(start, end).map((row, index) => (
              <tr
                key={index}
                className={`tableRow ${index % 2 !== 0 ? "oddRow" : ""}`}
              >
                {columns.map((column, cIndex) => {
                  column = ["Month", "Year"].includes(column)
                    ? "paymentNumber"
                    : column;

                  return (
                    <td
                      key={cIndex}
                      style={{
                        textAlign:
                          cIndex === 0 && !isBalance ? "center" : "right",
                      }}
                    >
                      {cIndex === 0 && !isBalance
                        ? row[column]
                        : formatCurrency(
                            parseInt(row[column] > 0 ? row[column] : 0)
                          )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const ARMvsFixed = (props) => {
  const { screenWidth } = props;
  const [inputDetails, setInputDetails] = useState({});
  const [screenStatus, setScreenStatus] = useState(null);
  const [armAdjustmentYears, setArmAdjustmentYears] = useState([]);
  const [fixedPayments, setFixedPayments] = useState([]);
  const [armPayments, setArmPayments] = useState([]);
  const [balanceDiff, setBalanceDiff] = useState([]);
  const [toggleView, setToggleView] = useState("Yearly");
  const [loanInputDetails, setLoanInputDetails] = useState([
    {
      name: "Monthly Payment Factor %",
      value: "0.0000%",
      resetValue: "0.0000%",
      defaultValue: formatPercentage(0.0084, 4),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "%",
    },
    {
      name: "MIP %",
      value: "0.0000%",
      resetValue: "0.0000%",
      defaultValue: formatPercentage(0.0, 4),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "%",
    },
    {
      name: "Paid In Cash",
      value: "$0.00",
      resetValue: "$0.00",
      defaultValue: formatCurrency(0, 2),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "$",
    },
    {
      name: "Til Prepayment",
      value: "$0.00",
      resetValue: "$0.00",
      defaultValue: formatCurrency(0, 2),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "$",
    },
    // {
    //   name: "Amortization Type",
    //   value: 0,
    //   type: 2,
    //   onChange: () => {},
    //   onBlur: () => {},
    //   onFocus: () => {},
    //   options: [
    //     {
    //       text: "Select",
    //       value: "0",
    //     },
    //     {
    //       text: "Fixed Rate",
    //       value: "1",
    //     },
    //     {
    //       text: "GPM – Graduated Payment Mortgage",
    //       value: "2",
    //     },
    //     {
    //       text: "ARM – Adjustable Rate Mortgage",
    //       value: "3",
    //     },
    //     {
    //       text: "Fixed - Interest Only",
    //       value: "5",
    //     },
    //     {
    //       text: "Other",
    //       value: "4",
    //     },
    //     {
    //       text: "Buydown",
    //       value: "6",
    //     },
    //     {
    //       text: "ARM - Interest Only",
    //       value: "7",
    //     },
    //     {
    //       text: "Balloon",
    //       value: "8",
    //     },
    //     {
    //       text: "HELOC",
    //       value: "9",
    //     },
    //   ],
    // },
    {
      name: "Agency (Loan) Type",
      value: 0,
      resetValue: 0,
      defaultValue: 3,
      type: 2,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      options: [
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
        {
          text: "Other >>",
          value: 5,
        },
      ],
    },
    {
      name: "Disbursement Date",
      value: "",
      resetValue: "",
      defaultValue: formatDate(calculateFirstDate(new Date(), true, 2)),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "date",
    },
    {
      name: "First Payment Date",
      value: "",
      resetValue: "",
      defaultValue: formatNewDate(
        getFirstDateFormDisbursement(calculateFirstDate(new Date(), true, 2))
      ),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "date",
      disabled: true,
    },

    {
      name: "FHA Case # Date",
      value: "",
      resetValue: "",
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "date",
    },
    {
      name: "Purchase Price",
      value: "$0.00",
      resetValue: "$0.00",
      defaultValue: formatCurrency(400000, 2),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "$",
    },
    {
      name: "Appraised Value",
      value: "$0.00",
      resetValue: "$0.00",
      defaultValue: formatCurrency(400000, 2),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "$",
    },
    {
      name: "Mortgage Insurance Premium",
      value: "$0.00",
      resetValue: "$0.00",
      defaultValue: formatCurrency(0, 2),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "$",
    },
    {
      name: "Lien Position",
      value: 0,
      resetValue: 0,
      defaultValue: 1,
      type: 2,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      options: [
        {
          text: "Select",
          value: 0,
        },
        {
          text: "1st Lien",
          value: 1,
        },
        {
          text: "2nd Lien",
          value: 2,
        },
      ],
    },
    {
      name: "Annual Fixed Interest Rate 2nd",
      value: "0.0000%",
      resetValue: "0.0000%",
      defaultValue: formatPercentage(7, 4),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "%",
    },
    {
      name: "Property Category",
      value: 0,
      resetValue: 0,
      type: 2,
      defaultValue: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      options: [
        {
          text: "Select",
          value: 0,
        },
        {
          text: "Primary Residence",
          value: 1,
        },
        {
          text: "Secondary Residence",
          value: 2,
        },
        {
          text: "Investment",
          value: 3,
        },
      ],
    },
    {
      name: "Property Type",
      value: 0,
      resetValue: 0,
      defaultValue: 1,
      type: 2,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      options: [
        {
          text: "Select",
          value: 0,
        },
        {
          text: "Single Family Residence - Detached",
          value: 1,
        },
        {
          text: "Single Family Residence - Attached",
          value: 2,
        },
        {
          text: "PUD – Detached (Planned Unit Development)",
          value: 4,
        },
        {
          text: "PUD – Attached (Planned Unit Development)",
          value: 5,
        },
        {
          text: "Condo - Low Rise to 4 stories",
          value: 6,
        },
        {
          text: "Condo - High Rise 5+ stories",
          value: 7,
        },
        {
          text: "Condo - Detached",
          value: 8,
        },
        {
          text: "Condo - Low Rise (Approved Project)",
          value: 9,
        },
        {
          text: "Condo - High Rise (Approved Project)",
          value: 16,
        },
        {
          text: "Second Home Two Unit",
          value: 11,
        },
        {
          text: "Manufactured - Single Wide",
          value: 12,
        },
        {
          text: "Manufactured - Multiwide",
          value: 33,
        },
        {
          text: "Mobile",
          value: 13,
        },
        {
          text: "Modular",
          value: 14,
        },
        {
          text: "2 Unit Owner Occupied",
          value: 3,
        },
        {
          text: "3 Unit Owner Occupied",
          value: 26,
        },
        {
          text: "4 Unit Owner Occupied",
          value: 27,
        },
        {
          text: "2 Unit Investment",
          value: 29,
        },
        {
          text: "3 Unit Investment",
          value: 30,
        },
        {
          text: "4 Unit Investment",
          value: 31,
        },
      ],
    },
  ]);
  const [fixedAPRValue, setFixedAPRValue] = useState(0);

  useEffect(() => {
    (async () => {
      if (loanId !== "undefined" && loanId) {
        let response = await handleGetLoanData(loanId);
        let {
          loanAmount,
          "Monthly Payment Factor %": monthlyPaymentFactorPercent,
          amortizeType,
          loanTerm,
          rate,
          armGrossMargin = 0.2,
          armRateInitialAdj = 84,
          armLifeCap = 0.5,
          armIndexValue = 0,
          armRateSubAdj = 12,
          armRateAdjCap = 0,
        } = response;
        armGrossMargin = armGrossMargin || 0.2;
        armRateInitialAdj = armRateInitialAdj || 84;
        armLifeCap = armLifeCap || 0.5;
        armIndexValue = armIndexValue || 0;
        armRateSubAdj = armRateSubAdj || 12;
        armRateAdjCap = armRateAdjCap || 0;

        response["Monthly Payment Factor %"] =
          monthlyPaymentFactorPercent * 100;

        loanTerm = loanTerm / 12;
        debugger;
        setInputDetails({
          loanAmount: formatCurrency(loanAmount),
          loanTerm,
          armGrossMargin,
          armRateInitialAdj,
          armTerm: 7,
          armLifeCap,
          armIndexValue,
          armRateSubAdj,
          armRateAdjCap,
          [[3, 7].includes(parseInt(amortizeType)) ? "armRate" : "fixedRate"]:
            formatPercentage(rate * 100),
          [![3, 7].includes(parseInt(amortizeType)) ? "armRate" : "fixedRate"]:
            formatPercentage(
              ![3, 7].includes(parseInt(amortizeType)) ? 6 : 6.75
            ),
          initialAdjustmentMonths: armRateInitialAdj,
        });
        setArmAdjustmentYears(armRateInitialAdj / 12);
        const iLoanInputDetails = loanInputDetails;
        iLoanInputDetails.forEach((field) => {
          const { name, formatType } = field,
            value = response[name];

          field["value"] =
            formatType === "%"
              ? formatCurrency(value)
              : formatType === "$"
              ? formatCurrency(value)
              : value;
        });

        setLoanInputDetails([...iLoanInputDetails]);
      }
    })();
  }, []);

  useEffect(() => {
    if (armPayments.length && fixedPayments.length) {
      let iBalanceDiff = [];
      for (let i = 0; i < armPayments.length; i++) {
        iBalanceDiff.push({
          Difference: Math.abs(
            -armPayments[i]["Balance"] + fixedPayments[i]["Balance"]
          ),
        });
      }
      setBalanceDiff(iBalanceDiff);
    }
  }, [fixedPayments, armPayments]);

  useEffect(() => {
    let { initialAdjustmentMonths } = inputDetails;
    setArmAdjustmentYears([initialAdjustmentMonths / 12]);
  }, [inputDetails]);

  useEffect(() => {
    const styleElement = document.createElement("style");

    styleElement.innerHTML = `
    *{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif}
    @media screen and (max-width: ${parseInt(w)}px) {
      .tableRow td {
        font-size: 14px;
      }
      .titleContent{
        font-size: 20px;
      }
      .tableLoanComparisonWrapper .tableDivWrapper {
        width: 90%;  
      }
      
      .darkWord {
        font-size: 25px;
      }
    }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleFieldValueChange = ({ name, value }) => {
    setInputDetails((prevInputDetails) => {
      return { ...prevInputDetails, [name]: value };
    });
  };

  const handleLoanFieldValueChange = (index, { value, dependencyUpdate }) => {
    setLoanInputDetails((prevLoanInputDetails) => {
      prevLoanInputDetails[index]["value"] = value;
      if (dependencyUpdate === "Disbursement Date") {
        prevLoanInputDetails[index + 1]["value"] = formatNewDate(
          getFirstDateFormDisbursement(
            calculateFirstDate(new Date(value || null), true)
          )
        );
      }
      return [...prevLoanInputDetails];
    });
  };

  const handleFillResetValues = (isFill) => {
    setScreenStatus(null);
    setInputDetails(() => {
      return isFill
        ? {
            loanAmount: formatCurrency(400000, 2),
            loanTerm: 30,
            fixedRate: formatPercentage(6.75, 4),
            armTerm: 7,
            armRate: formatPercentage(6, 4),
            // initialNoteRate: formatPercentage(6.75, 4),
            initialAdjustmentMonths: 84,
          }
        : {
            loanAmount: "",
            loanTerm: "",
            fixedRate: "",
            armTerm: 0,
            armRate: "",
          };
    });
    setLoanInputDetails((prevLoanInputDetails) => {
      prevLoanInputDetails.forEach(
        (field) =>
          (field["value"] = field[isFill ? "defaultValue" : "resetValue"])
      );
      return [...prevLoanInputDetails];
    });
  };

  const handleCalculate = async () => {
    console.time("handleCalculate");
    const { cashFlow: fixedCashFlow, ARP } =
        await handleGetAmortizationSchedule(1, true), //fixed
      { cashFlow: armCashFlow, finalAdjRate } =
        await handleGetAmortizationSchedule(3 || 7, !false); //ARM

    setFixedPayments(fixedCashFlow);
    setArmPayments(armCashFlow);
    setFixedAPRValue(ARP);
    setInputDetails((prevInputDetails) => {
      return { ...prevInputDetails, initialNoteRate: finalAdjRate * 100 };
    });
    setScreenStatus("showOutput");
    console.timeEnd("handleCalculate");
  };

  const getValuesFromLoanInputDetails = () => {
    let extractedObject = {};

    loanInputDetails.forEach((item) => {
      let { name, value } = item;
      extractedObject[name] = value;
    });
    return extractedObject;
  };

  const handleGetAmortizationSchedule = async (amortizeType, getAPR) => {
    let ratesArray = [],
      finalAdjRate = 0;

    try {
      let {
        ["Paid In Cash"]: paidInCash,
        ["Mortgage Insurance Premium"]: mipAmt,
        ["Lien Position"]: lienPosition,
        ["Annual Fixed Interest Rate 2nd"]: rate2,
        ["Monthly Payment Factor %"]: iMiPercent,
        ["Agency (Loan) Type"]: loanType,
        ["MIP %"]: upFrontMIPFactor,
        ["Purchase Price"]: purchasePrice,
        ["Appraised Value"]: appraisedValue,
        ["FHA Case # Date"]: fhaCaseDate,
        ["Property Category"]: PropertyBe,
        ["Property Type"]: propType,
        ["Til Prepayment"]: tilPrePay,
        ["Disbursement Date"]: disbursementDates,
        ["First Payment Date"]: firstPaymentDate,
      } = getValuesFromLoanInputDetails();

      paidInCash = cleanValue(paidInCash);
      mipAmt = cleanValue(mipAmt);
      lienPosition = cleanValue(lienPosition);
      rate2 = cleanValue(rate2);
      iMiPercent = cleanValue(iMiPercent);
      loanType = cleanValue(loanType);
      upFrontMIPFactor = cleanValue(upFrontMIPFactor) / 100;
      purchasePrice = cleanValue(purchasePrice);
      appraisedValue = cleanValue(appraisedValue);
      PropertyBe = cleanValue(PropertyBe);
      propType = cleanValue(propType);
      tilPrePay = cleanValue(tilPrePay);

      firstPaymentDate = new Date(firstPaymentDate); //getFirstDateFormDisbursement(disbursementDates)
      const { oddFactor } = calculateOddFactor(
        new Date(disbursementDates),
        firstPaymentDate
      );

      let {
        fixedRate,
        loanAmount,
        loanTerm,
        armTerm,
        armRate,
        initialNoteRate,
        initialAdjustmentMonths,
        armGrossMargin = 0.2,
        armLifeCap = 0.5,
        armIndexValue = 0,
        armRateInitialAdj = 12,
        armRateSubAdj = 12,
        armRateAdjCap = 0,
      } = inputDetails;

      fixedRate = cleanValue(fixedRate);
      loanAmount = cleanValue(loanAmount);
      loanTerm = cleanValue(loanTerm);
      armTerm = cleanValue(armTerm);
      armRate = cleanValue(armRate);
      initialNoteRate = cleanValue(initialNoteRate);

      armRateInitialAdj =
        Number(initialAdjustmentMonths || armRateInitialAdj) || 0;

      armRate = armRate / 100;
      initialNoteRate = initialNoteRate / 100;
      loanTerm = loanTerm * 12;

      let rate = fixedRate,
        miPercent = !iMiPercent ? 0.0085 : iMiPercent,
        // tilPrePay = 0, //Not payment done - get it form (GetPFCLoanValueM_hud901 loanId)
        // adjustHud901 = 0,
        // initialAmt = 0,
        zeroFlow = 0;

      rate = (lienPosition === 2 ? rate2 : rate) / 100;

      if (loanType === 4) {
        miPercent = 0.005;
      }

      if (miPercent > 0.2) miPercent = miPercent * 0.01;

      if (paidInCash === 1) upFrontMIPFactor = 0;

      if (tilPrePay < 0) {
        // adjustHud901 = 1;
        //tilPrePay - get it form vHUDDesc table
        // initialAmt = tilPrePay;
      }

      zeroFlow = tilPrePay - loanAmount;

      if (zeroFlow >= 0) {
        throw new Error("Invalid zeroFlow");
      }

      //Non ARM loans block
      if (amortizeType !== 3 && amortizeType !== 7) {
        ratesArray.push({
          startTerm: 1,
          endTerm: loanTerm,
          totalTerm: loanTerm,
          noteRate: rate,
        });
      }
      // ARM loans block
      else {
        //do this later
        let newRate = parseFloat(armRate);
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

        finalAdjRate = newRate;
      }
      console.log({
        loanAmount,
        loanTerm,
        firstPaymentDate,
        ratesArray,
        mipAmt,
      });
      const cashFlow = calculateCashFlows(
        loanAmount,
        loanTerm,
        firstPaymentDate,
        ratesArray,
        mipAmt
      );

      const {
        Amount: monthlyPayment,
        intRate: movingRate,
        intRate: noteRate,
      } = cashFlow[0];

      const ARP = getAPR
        ? await handleCalculateARP({
            cashFlow,
            loanType,
            purchasePrice,
            appraisedValue,
            loanAmount,
            upFrontMIPFactor,
            loanTerm,
            fhaCaseDate,
            iMiPercent,
            mipAmt,
            monthlyPayment,
            movingRate,
            PropertyBe,
            propType,
            amortizeType,
            zeroFlow,
            oddFactor,
            noteRate,
          })
        : 0;
      console.log(ARP);
      return { cashFlow, ARP, finalAdjRate };
    } catch (error) {
      console.error("Error form handleGetAmortizationSchedule ===> ", error);
    }
  };

  //Components
  const LoanComparison = () => {
    const loanAmount = formatCurrency(inputDetails["loanAmount"]),
      armTerm = inputDetails["armTerm"] * 12;
    return (
      <>
        <h3 className="titleContent">Loan Comparison</h3>

        <div className="tableLoanComparisonWrapper">
          {isMobile ? (
            <div
              style={{ border: "1px solid #999", padding: 10, width: "100%" }}
            >
              <table className="tableWrapper">
                <tbody>
                  <tr className="tableRow">
                    <td></td>
                    <td>Fixed</td>
                    <td>ARM</td>
                  </tr>
                  <tr className="tableRow">
                    <td>Loan Amount:</td>
                    <td>{loanAmount}</td>
                    <td>{loanAmount}</td>
                  </tr>
                  <tr className="tableRow">
                    <td>Num Payments:</td>
                    <td>{armTerm}</td>
                    <td>{armTerm}</td>
                  </tr>
                  <tr className="tableRow">
                    <td>Annual Rate:</td>
                    <td>{formatPercentage(inputDetails["fixedRate"], 4)}</td>
                    <td>{formatPercentage(inputDetails["armRate"], 4)}</td>
                  </tr>
                  <tr className="tableRow">
                    <td>APR:</td>
                    <td>{formatPercentage(fixedAPRValue || 0, 4)}</td>
                    <td></td>
                  </tr>
                  <tr className="tableRow">
                    <td>Monthly P & I:</td>
                    <td>
                      {formatCurrency(parseInt(fixedPayments?.[0]["Amount"]))}
                    </td>
                    <td>
                      {formatCurrency(parseInt(armPayments?.[0]["Amount"]))}
                    </td>
                  </tr>
                  <tr className="tableRow">
                    <td>
                      <b style={{ fontSize: 13 }}>
                        Savings Compared to Fixed Rate Mortgage:
                      </b>
                    </td>
                    <td></td>
                    <td>
                      <b>
                        {formatCurrency(
                          Math.abs(
                            fixedPayments?.[0]["Amount"] -
                              armPayments?.[0]["Amount"]
                          )
                        )}
                      </b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="tableDivWrapper" style={styles.tableDivWrapper}>
                <h3
                  style={styles.tableInnerTitle}
                >{`Fixed Loan - ${inputDetails["loanTerm"]}yr`}</h3>

                <table className="tableWrapper">
                  <tbody>
                    <tr className="tableRow">
                      <td>Loan Amount:</td>
                      <td>{loanAmount}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Num Payments:</td>
                      <td>{inputDetails["armTerm"] * 12}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Annual Rate:</td>
                      <td>{formatPercentage(inputDetails["fixedRate"], 4)}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>APR:</td>
                      <td>{formatPercentage(fixedAPRValue || 0, 4)}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Monthly P & I:</td>
                      <td>{formatCurrency(fixedPayments?.[0]["Amount"])}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tableDivWrapper" style={styles.tableDivWrapper}>
                <h3
                  style={styles.tableInnerTitle}
                >{`Adjustable Loan - ${inputDetails["armTerm"]}/1`}</h3>
                <table className="tableWrapper">
                  <tbody>
                    <tr className="tableRow">
                      <td>Loan Amount:</td>
                      <td>{formatCurrency(inputDetails["loanAmount"])}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Num Payments:</td>
                      <td>{inputDetails["armTerm"] * 12}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Annual Rate:</td>
                      <td>{formatPercentage(inputDetails["armRate"], 4)}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>ARM P & I:</td>
                      <td>{formatCurrency(armPayments?.[0]["Amount"])}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>
                        <b>Savings Compared to Fixed Rate Mortgage:</b>
                      </td>
                      <td>
                        <b>
                          {formatCurrency(
                            Math.abs(
                              fixedPayments?.[0]["Amount"] -
                                armPayments?.[0]["Amount"]
                            )
                          )}
                        </b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const SummaryDetails = () => {
    let FixedArmDifferent = 0,
      adjRate = parseFloat(cleanValue(inputDetails["initialNoteRate"]) || 0);
    return (
      <>
        {armAdjustmentYears.map((year, index) => {
          FixedArmDifferent = index === 0 ? index : FixedArmDifferent;
          const sIndex = (year - 1) * 12 - 1,
            eIndex = sIndex + 12,
            { Balance: fixedStartBalance } = fixedPayments[sIndex],
            { Balance: adjStartBalance } = armPayments[sIndex],
            { Balance: fixedEndBalance, Amount: fixedEndPayment } =
              fixedPayments[eIndex],
            { Balance: adjEndBalance, Amount: adjEndPayment } =
              armPayments[eIndex],
            balanceDifference = adjEndBalance - fixedEndBalance,
            paymentDifference = (adjEndPayment - fixedEndPayment) * 12;

          FixedArmDifferent = FixedArmDifferent + paymentDifference;

          const balance = balanceDifference + FixedArmDifferent;

          {
            /* adjRate += parseFloat(inputDetails[`Year(${year})`]); */
          }

          return (
            <Fragment key={index}>
              <div
                style={{
                  fontSize: isMobile ? 25 : 30,
                  textAlign: "center",
                  margin: "20px 0",
                }}
              >
                After
                <span className="greenNumber"> {year} </span>
                years,{" "}
                <span className="darkWord">
                  {balance > 0 ? "Fixed" : "ARM"}
                </span>{" "}
                saves you a total of{" "}
                <span className="greenNumber">
                  {" "}
                  {formatCurrency(Math.abs(balance))}{" "}
                </span>
              </div>

              <div
                className="tableLoanComparisonWrapper"
                style={{ marginBottom: 50 }}
              >
                {isMobile ? (
                  <>
                    <div
                      className="tableDivWrapper"
                      style={{
                        ...styles.tableDivWrapper,
                        ...{ width: "100%" },
                      }}
                    >
                      <h3
                        style={{
                          ...styles.tableInnerTitle,
                          ...{ fontSize: 20 },
                        }}
                      >{`Summary Year ${year}`}</h3>

                      <table className="tableWrapper">
                        <tbody>
                          <tr
                            className="tableRow"
                            style={{ fontWeight: "bold" }}
                          >
                            <td></td>
                            <td>Fixed</td>
                            <td>ARM</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Beginning of the Year Loan Balance:</td>
                            <td>{formatCurrency(fixedStartBalance)}</td>
                            <td>{formatCurrency(adjStartBalance)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>End of Year Balance:</td>
                            <td>{formatCurrency(fixedEndBalance)}</td>
                            <td>{formatCurrency(adjEndBalance)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Num Payments:</td>
                            <td>12</td>
                            <td>12</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Annual Rate:</td>
                            <td>
                              {formatPercentage(
                                inputDetails["fixedRate"] || 0,
                                4
                              )}
                            </td>
                            <td>{formatPercentage(adjRate || 0, 4)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Payment:</td>
                            <td>{formatCurrency(fixedEndPayment)}</td>
                            <td>{formatCurrency(adjEndPayment)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Payment Difference:</td>
                            <td colSpan={2} style={{ textAlign: "center" }}>
                              {formatCurrency(
                                Math.abs(fixedEndPayment - adjEndPayment)
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="tableDivWrapper"
                      style={styles.tableDivWrapper}
                    >
                      <h3
                        style={styles.tableInnerTitle}
                      >{`Fixed Summary Year ${year}`}</h3>

                      <table className="tableWrapper">
                        <tbody>
                          <tr className="tableRow">
                            <td>Beginning of the Year Loan Balance:</td>
                            <td>{formatCurrency(fixedStartBalance)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>End of Year Balance:</td>
                            <td>{formatCurrency(fixedEndBalance)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Num Payments:</td>
                            <td>12</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Annual Rate:</td>
                            <td>
                              {formatPercentage(
                                inputDetails["fixedRate"] || 0,
                                4
                              )}
                            </td>
                          </tr>
                          <tr className="tableRow">
                            <td>ARM P & I:</td>
                            <td>{formatCurrency(fixedEndPayment)}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div
                      className="tableDivWrapper"
                      style={styles.tableDivWrapper}
                    >
                      <h3 style={styles.tableInnerTitle}>
                        {`Adjustable Summary Year ${year}`}
                      </h3>

                      <table className="tableWrapper">
                        <tbody>
                          <tr className="tableRow">
                            <td>Beginning of the Year Loan Balance:</td>
                            <td>{formatCurrency(adjStartBalance)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>End of Year Balance:</td>
                            <td>{formatCurrency(adjEndBalance)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Num Payments:</td>
                            <td>12</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Annual Rate:</td>
                            <td>{formatPercentage(adjRate || 0, 4)}</td>
                          </tr>
                          <tr className="tableRow">
                            <td>Monthly P & I:</td>
                            <td>{formatCurrency(adjEndPayment)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </Fragment>
          );
        })}
      </>
    );
  };

  const FinalSummary = () => {
    let adjRate = cleanValue(inputDetails["initialNoteRate"]) || 0,
      lastAdjYear = armAdjustmentYears[armAdjustmentYears.length - 1];
    // armAdjustmentYears.forEach((year) => {
    //   adjRate += parseFloat(inputDetails[`Year(${year})`]);
    // });

    const { Balance: fixedEndBalance, Amount: fixedEndPayment } =
        fixedPayments[lastAdjYear * 12 - 1],
      { Balance: adjEndBalance, Amount: adjEndPayment } =
        armPayments[lastAdjYear * 12 - 1],
      remainingPaymentCount = inputDetails["loanTerm"] * 12 - lastAdjYear * 12;

    return (
      <>
        <h3 className="titleContent">{`Snapshot after the ARM adjusts in year ${
          lastAdjYear + 1
        }, and we assume a scenario of a ${adjRate}% increase over the first ${lastAdjYear} years:`}</h3>

        <div
          className="tableLoanComparisonWrapper"
          style={{ marginBottom: 50 }}
        >
          {isMobile ? (
            <>
              <div
                className="tableDivWrapper"
                style={{ ...styles.tableDivWrapper, ...{ width: "100%" } }}
              >
                <h3 style={styles.tableInnerTitle}>Fixed Summary</h3>

                <table className="tableWrapper">
                  <tbody>
                    <tr className="tableRow" style={{ fontWeight: "bold" }}>
                      <td></td>
                      <td>Fixed</td>
                      <td>ARM</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Initial Loan Amount:</td>
                      <td>{formatCurrency(inputDetails["loanAmount"])}</td>
                      <td>{formatCurrency(inputDetails["loanAmount"])}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Remaining Loan Balance:</td>
                      <td>{formatCurrency(fixedEndBalance)}</td>
                      <td>{formatCurrency(adjEndBalance)}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Remaining Payments:</td>
                      <td>{remainingPaymentCount}</td>
                      <td>{remainingPaymentCount}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Adjusted Annual Rate:</td>
                      <td>
                        {formatPercentage(inputDetails["fixedRate"] || 0, 4)}
                      </td>
                      <td>
                        {formatPercentage(
                          inputDetails["armRate"] + adjRate || 0,
                          4
                        )}
                      </td>
                    </tr>
                    <tr className="tableRow">
                      <td>Payment</td>
                      <td>{formatCurrency(fixedEndPayment)}</td>
                      <td>{formatCurrency(adjEndPayment)}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Payment Difference:</td>
                      <td colSpan={2} style={{ textAlign: "center" }}>
                        {formatCurrency(
                          Math.abs(fixedEndPayment - adjEndPayment)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="tableDivWrapper" style={styles.tableDivWrapper}>
                <h3 style={styles.tableInnerTitle}>Fixed Summary</h3>

                <table className="tableWrapper">
                  <tbody>
                    <tr className="tableRow">
                      <td>Initial Loan Amount:</td>
                      <td>{formatCurrency(inputDetails["loanAmount"])}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Remaining Loan Balance:</td>
                      <td>{formatCurrency(fixedEndBalance)}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Remaining Payments:</td>
                      <td>{remainingPaymentCount}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Adjusted Annual Rate:</td>
                      <td>
                        {formatPercentage(inputDetails["fixedRate"] || 0, 4)}
                      </td>
                    </tr>
                    <tr className="tableRow">
                      <td>Monthly P & I:</td>
                      <td>{formatCurrency(fixedEndPayment)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tableDivWrapper" style={styles.tableDivWrapper}>
                <h3 style={styles.tableInnerTitle}>Adjustable Summary</h3>

                <table className="tableWrapper">
                  <tbody>
                    <tr className="tableRow">
                      <td>Initial Loan Amount:</td>
                      <td>{formatCurrency(inputDetails["loanAmount"])}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Remaining Loan Balance:</td>
                      <td>{formatCurrency(adjEndBalance)}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Remaining Payments:</td>
                      <td>{remainingPaymentCount}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Adjusted Annual Rate:</td>
                      <td>{formatPercentage(adjRate || 0, 4)}</td>
                    </tr>
                    <tr className="tableRow">
                      <td>Monthly P & I:</td>
                      <td>{formatCurrency(adjEndPayment)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const AmortizationSchedule = ({ type }) => {
    const rowRange =
      type === "initialSchedule"
        ? {
            start: 0,
            end: inputDetails["armTerm"] * (toggleView === "Monthly" ? 12 : 1),
          }
        : {
            start:
              inputDetails["armTerm"] * (toggleView === "Monthly" ? 12 : 1),
            end: inputDetails["loanTerm"] * 12,
          };
    return (
      <>
        {isMobile ? (
          <>
            <div>
              <h3
                style={{
                  ...styles.tableInnerTitle,
                  ...{ fontSize: 20, textAlign: "center" },
                }}
              >
                Amortization Schedule - {toggleView}
              </h3>
              <GenerateTable
                isYearly={toggleView === "Yearly"}
                rowRange={rowRange}
                array={fixedPayments}
                armPaymentsArray={armPayments}
                columns={[
                  toggleView === "Monthly" ? "Month" : "Year",
                  "Amount",
                  "Interest",
                  "Principal",
                  "Balance",
                ]}
              />
            </div>
          </>
        ) : (
          <div className="amortizationTableWrapper">
            <>
              <div>
                <h3
                  style={{
                    ...styles.tableInnerTitle,
                    ...{ fontSize: 20, textAlign: "center" },
                  }}
                >
                  Amortization Schedule - Fixed Loan
                </h3>
                <div>
                  <GenerateTable
                    isYearly={toggleView === "Yearly"}
                    rowRange={rowRange}
                    array={fixedPayments}
                    columns={[
                      toggleView === "Monthly" ? "Month" : "Year",
                      "Amount",
                      "Interest",
                      "Principal",
                      "Balance",
                    ]}
                  />
                </div>
              </div>

              <div>
                <h3 style={{ ...styles.tableInnerTitle, ...{ fontSize: 20 } }}>
                  Balance
                </h3>
                <GenerateTable
                  isYearly={toggleView === "Yearly"}
                  rowRange={rowRange}
                  array={balanceDiff}
                  isBalance={true}
                  columns={["Difference"]}
                />
              </div>

              <div>
                <h3
                  style={{
                    ...styles.tableInnerTitle,
                    ...{ fontSize: 20, textAlign: "center" },
                  }}
                >
                  Amortization Schedule - Adjustable Loan
                </h3>
                <div>
                  <GenerateTable
                    isYearly={toggleView === "Yearly"}
                    rowRange={rowRange}
                    array={armPayments}
                    columns={[
                      toggleView === "Monthly" ? "Month" : "Year",
                      "Amount",
                      "Interest",
                      "Principal",
                      "Balance",
                    ]}
                  />
                </div>
              </div>
            </>
          </div>
        )}
      </>
    );
  };

  const EquityBarChart = () => {
    const chartData = {
      Years: [],
      Fixed: [],
      ARM: [],
    };

    for (let i = 0; i < inputDetails["armTerm"] * 12; i += 12) {
      chartData["Years"].push(i / 12 + 1);
      const fixedYearArr = fixedPayments.slice(i, i + 12);

      let totals = fixedYearArr.reduce(
        (acc, payment) => {
          acc.Principal += payment.Principal;
          return acc;
        },
        { Principal: 0 }
      );
      chartData["Fixed"].push(
        totals["Principal"] +
          (chartData["Fixed"][chartData["Fixed"]?.length - 1] || 0)
      );

      const armYearArr = armPayments.slice(i, i + 12);

      totals = armYearArr.reduce(
        (acc, payment) => {
          acc.Principal += payment.Principal;
          return acc;
        },
        { Principal: 0 }
      );
      chartData["ARM"].push(
        totals["Principal"] +
          (chartData["ARM"][chartData["ARM"]?.length - 1] || 0)
      );
    }

    const data = [
      {
        type: "bar",
        x: chartData["Years"],
        y: chartData["Fixed"],
        name: "Fixed",
        hoverinfo: "y",
        marker: {
          color: "#a6cbf2",
        },
        width: 0.2,
      },
      {
        type: "bar",
        x: chartData["Years"],
        y: chartData["ARM"],
        name: "ARM",
        hoverinfo: "y",
        marker: {
          color: "#508bc9",
        },
        width: 0.2,
      },
    ];
    const layout = {
      barmode: "group",
      bargap: 0.5,
      dragmode: false,
      xaxis: {
        title: "Years",
      },
      yaxis: {
        automargin: true,
        title: { text: "$", standoff: 10 },
        tickformat: ",.0f",
        range: [
          0,
          Math.max(...[...chartData["ARM"], ...chartData["Fixed"]]) + 5000,
        ],
      },
      // width: 1000,
      margin: {
        l: 10,
        r: 0,
        b: 10,
        t: 10,
        pad: 4,
      },
      legend: {
        x: -0.05,
        y: -0.09,
        orientation: "h",
      },
    };

    const config = {
      displayModeBar: false,
    };

    data.forEach((item) => {
      item.hoverlabel = {
        bgcolor: "#fff",
        bordercolor: item.marker.color,
        font: { size: 11, color: "#4e4f51" },
      };
    });

    return (
      <div
        style={{
          fontSize: 30,
          textAlign: "center",
          margin: "50px 0 80px 0",
        }}
      >
        <span
          className="darkWord"
          style={{ display: "block", margin: "30px 0 5px 0" }}
        >
          Your Equity
        </span>
        <span className="darkWord">Fixed Rate vs ARM (Yearly)</span>
        <Plot
          style={{ width: "100%" }}
          data={data}
          layout={layout}
          config={config}
        />
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          ...{
            maxWidth: isMobile ? screenWidth : 1100,
            margin: "auto",
            overflow: "hidden",
          },
        }}
      >
        <div>
          <div
            className="screenTitle"
            style={{
              fontSize: isMobile ? "1.8em" : "2.5em",
              fontWeight: "bold",
            }}
          >
            ARM vs Fixed Calculator
          </div>

          <div
            className="container"
            style={{ width: isMobile ? "80%" : "450px" }}
          >
            <InputBox
              disabled={screenStatus === "showOutput"}
              type="text"
              inputMode="numeric"
              style={{ width: isMobile ? "100%" : "45%" }}
              validate={false}
              label="Loan Amount"
              placeholder={"Loan Amount"}
              onBlur={() => {
                handleFieldValueChange({
                  name: "loanAmount",
                  value: formatCurrency(inputDetails["loanAmount"], 2),
                });
              }}
              onChangeText={({ target }) => {
                const { value } = target;
                handleFieldValueChange({
                  name: "loanAmount",
                  value,
                });
              }}
              value={inputDetails["loanAmount"]?.toString()}
            />
            <InputBox
              disabled={screenStatus === "showOutput"}
              type="text"
              inputMode="numeric"
              style={{ width: isMobile ? "100%" : "45%" }}
              validate={false}
              label="Term (Years)"
              placeholder={"Term"}
              onBlur={() => {}}
              onChangeText={({ target }) => {
                const { value } = target;
                handleFieldValueChange({
                  name: "loanTerm",
                  value,
                });
              }}
              value={inputDetails["loanTerm"]?.toString()}
            />

            <div
              style={{
                width: "100%",
                display: isMobile ? "block" : "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ width: isMobile ? "100%" : "49%" }}>
                <div className="blueHeader">Fixed</div>
                <InputBox
                  disabled={screenStatus === "showOutput"}
                  type="text"
                  format="percentage"
                  validate={false}
                  label="Annual Fixed Interest Rate"
                  placeholder="Interest Rate"
                  onBlur={() => {
                    handleFieldValueChange({
                      name: "fixedRate",
                      value: formatPercentage(inputDetails["fixedRate"], 4),
                    });
                  }}
                  onChangeText={({ target }) => {
                    const { value } = target;
                    handleFieldValueChange({
                      name: "fixedRate",
                      value,
                    });
                  }}
                  value={inputDetails["fixedRate"]?.toString()}
                />
              </div>
              <div style={{ width: isMobile ? "100%" : "49%" }}>
                <div className="blueHeader">ARM</div>
                {/* <Dropdown
                  disabled={screenStatus === "showOutput"}
                  isValid={false}
                  label="ARM Term"
                  options={[
                    { value: 0, text: "Select" },
                    { value: 5, text: "5" },
                    { value: 7, text: "7" },
                    { value: 9, text: "9" },
                    { value: 10, text: "10" },
                  ]}
                  value={inputDetails["armTerm"]}
                  onSelect={({ value }) => {
                    handleFieldValueChange({
                      name: "armTerm",
                      value,
                    });
                  }}
                  isMap={false}
                /> */}
                <InputBox
                  disabled={screenStatus === "showOutput"}
                  type="text"
                  format="numeric"
                  validate={false}
                  label="Initial Adjustment (months)"
                  placeholder="Initial Adjustment (months)"
                  onBlur={() => {
                    handleFieldValueChange({
                      name: "initialAdjustmentMonths",
                      value: inputDetails["initialAdjustmentMonths"],
                    });
                  }}
                  onChangeText={({ target }) => {
                    const { value } = target;
                    handleFieldValueChange({
                      name: "initialAdjustmentMonths",
                      value,
                    });
                    setArmAdjustmentYears(value / 12);
                  }}
                  value={inputDetails["initialAdjustmentMonths"]?.toString()}
                />
                <InputBox
                  disabled={screenStatus === "showOutput"}
                  type="text"
                  format="percentage"
                  validate={false}
                  label="ARM Rate"
                  placeholder="ARM Rate"
                  onBlur={() => {
                    handleFieldValueChange({
                      name: "armRate",
                      value: formatPercentage(inputDetails["armRate"], 4),
                    });
                  }}
                  onChangeText={({ target }) => {
                    const { value } = target;
                    handleFieldValueChange({
                      name: "armRate",
                      value,
                    });
                  }}
                  value={inputDetails["armRate"]?.toString()}
                />
              </div>
            </div>

            <div
              style={{
                paddingTop: 25,
                marginTop: 25,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                borderTop: "1px solid #999",
                width: "100%",
              }}
            >
              {loanInputDetails.map((field, index) => {
                const {
                  name,
                  value,
                  type,
                  onBlur = () => {},
                  onFocus = () => {},
                  options = [],
                  formatType = "",
                  disabled = false,
                } = field;

                if (name === "FHA Case # Date") {
                  const loanType = loanInputDetails.filter(
                    (item) => item["name"] === "Agency (Loan) Type"
                  )[0];
                  if (Number(loanType["value"]) !== 2) {
                    return <Fragment key={index}></Fragment>;
                  }
                }

                return (
                  <Fragment key={index}>
                    {type === 1 ? (
                      <>
                        <InputBox
                          format={
                            formatType === "$"
                              ? "Currency"
                              : formatType === "%"
                              ? "percentage"
                              : null
                          }
                          type="text"
                          style={{ width: isMobile ? "100%" : "45%" }}
                          disabled={screenStatus === "showOutput" || disabled}
                          validate={false}
                          label={name}
                          placeholder={name}
                          onFocus={onFocus}
                          onBlur={(e) => {
                            if (["date", "$", "%"].includes(formatType)) {
                              const { value } = e.target;
                              handleLoanFieldValueChange(
                                index,
                                {
                                  name,
                                  value:
                                    formatType === "date"
                                      ? formatDate(value, 2)
                                      : formatType === "$"
                                      ? formatCurrency(value)
                                      : formatType === "%"
                                      ? formatPercentage(value, 4)
                                      : value,
                                  dependencyUpdate:
                                    name === "Disbursement Date" ? name : "",
                                },
                                name
                              );
                            }
                            onBlur(e);
                          }}
                          onChangeText={({ target }) => {
                            const { value } = target;
                            handleLoanFieldValueChange(index, {
                              name,
                              value,
                            });
                          }}
                          value={value?.toString()}
                        />
                      </>
                    ) : (
                      <>
                        <Dropdown
                          style={{
                            width: isMobile ? "100%" : "45%",
                            maxWidth: isMobile ? "95%" : "45%",
                          }}
                          fieldStyle={{ height: 24 }}
                          disabled={screenStatus === "showOutput" || disabled}
                          isValid={false}
                          label={name}
                          options={options}
                          value={value}
                          onSelect={({ value }) => {
                            handleLoanFieldValueChange(index, { name, value });
                          }}
                          isMap={false}
                        />
                      </>
                    )}
                  </Fragment>
                );
              })}
            </div>

            <div
              style={{
                flexDirection: isMobile ? "column" : "row",
                display: "flex",
                // flexWrap: "wrap",
                justifyContent: "space-between",
                marginTop: 17,
                width: "100%",
              }}
            >
              <Button
                title="Start Over"
                onClick={() => handleFillResetValues()}
                className="btnPrimary"
              />
              <Button
                className="secondaryBtn"
                title="Calculate and Compare"
                onClick={handleCalculate}
              />
              <Button
                className="btnPrimary"
                title="Run a Demo"
                onClick={() => handleFillResetValues(true)}
              />
            </div>
          </div>
        </div>

        {screenStatus === "showOutput" && (
          <div style={{ margin: isMobile ? 20 : 0 }}>
            <LoanComparison />

            <h3 className="titleContent">
              {`If savings of ${formatCurrency(
                Math.abs(
                  fixedPayments?.[0]["Amount"] - armPayments?.[0]["Amount"]
                )
              )} is applied toward principal, the monthly payment
        would be the same as the Fixed Payment, and would result in the
        following:`}
            </h3>
            <h3 className="titleContent">{`Snapshot after ${inputDetails["armTerm"]} Years`}</h3>
            <div>
              <div className="toggleView">
                <span
                  className={toggleView === "Yearly" ? "selected" : ""}
                  onClick={() => setToggleView("Yearly")}
                >
                  Yearly
                </span>
                <span
                  className={toggleView === "Monthly" ? "selected" : ""}
                  onClick={() => setToggleView("Monthly")}
                >
                  Monthly
                </span>
              </div>

              <AmortizationSchedule type="initialSchedule" />

              <div
                style={{
                  fontSize: isMobile ? 25 : 30,
                  textAlign: "center",
                  margin: "20px 0",
                }}
              >
                After{" "}
                <span className="greenNumber"> {inputDetails["armTerm"]} </span>{" "}
                years, you have
                <span className="darkWord"> gained </span>
                an additional
                <span className="greenNumber">
                  {" "}
                  {formatCurrency(
                    balanceDiff[inputDetails["armTerm"] * 12 - 1]?.[
                      "Difference"
                    ]
                  )}{" "}
                </span>{" "}
                in equity
              </div>
            </div>

            <EquityBarChart />

            <SummaryDetails />

            <FinalSummary />

            <AmortizationSchedule type="remainingSchedule" />
          </div>
        )}
      </div>
    </>
  );
};

export default ARMvsFixed;
