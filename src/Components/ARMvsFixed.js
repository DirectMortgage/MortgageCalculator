import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import {
  formatCurrency,
  formatDateTimeNew,
  formatPercentage,
} from "../CommonFunctions/GeneralCalculations";
import { Button, Dropdown, InputBox } from "../CommonFunctions/Accessories";
import { Fragment } from "react";
import "../styles.css";
import {
  calculateAPR,
  calculateFirstDate,
  calculateOddFactor,
  calculatePMT,
  cleanValue,
  getFirstDateFormDisbursement,
  loansCalculateMI,
  loansGetFhaTerm,
  updateARMRate,
} from "../CommonFunctions/CalcLibrary";

const isMobile = window.innerWidth <= 400,
  screenWidth = window.innerWidth;

const styles = {
  tableInnerTitle: {
    fontSize: isMobile ? 15 : 30,
    color: "#053d5d",
    fontWeight: 600,
    display: "block",
    margin: "5px 0",
  },
  tableDivWrapper: {
    padding: isMobile ? 10 : "10px 40px",
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
                <>
                  <tr style={{ fontWeight: "bold" }}>
                    <td>{`${isYearly ? "Year" : "Pmt"} ${index + 1}`}</td>
                    <td style={{ textAlign: "right" }}>Fixed</td>
                    <td style={{ textAlign: "right" }}>ARM</td>
                  </tr>
                  {columns.map((column, cIndex) => {
                    return ["Month", "Year"].includes(column) ? (
                      <></>
                    ) : (
                      <tr key={cIndex}>
                        <td>{column}:</td>
                        <td style={{ textAlign: "right" }}>
                          {formatCurrency(row[column])}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {formatCurrency(armPaymentsArray[index][column])}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td>Difference:</td>
                    <td colSpan={2} style={{ textAlign: "center" }}>
                      {" "}
                      {formatCurrency(
                        Math.abs(
                          row["Balance"] - armPaymentsArray[index]["Balance"]
                        )
                      )}
                    </td>
                  </tr>
                </>
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
                        : formatCurrency(row[column])}
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

const ARMvsFixed = () => {
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
      name: "Cash From Borrower",
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
      name: "First Payment Date",
      value: "",
      resetValue: "",
      defaultValue: formatDateTimeNew(calculateFirstDate(new Date(), true), 2),
      type: 1,
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      formatType: "date",
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
      value: 0,
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
      value: 0,
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
    let { armTerm = 0 } = inputDetails,
      yearLength = 0;
    armTerm = parseInt(armTerm);
    if ([5, 7, 10].includes(armTerm)) {
      yearLength = 3;
    } else if (armTerm === 9) {
      yearLength = 1;
    }

    setArmAdjustmentYears(
      Array.from({ length: yearLength }, (_, i) => armTerm + i + 1)
    );
  }, [inputDetails]);

  const handleFieldValueChange = ({ name, value }) => {
    setInputDetails((prevInputDetails) => {
      return { ...prevInputDetails, [name]: value };
    });
  };

  const handleLoanFieldValueChange = (index, { name, value }) => {
    setLoanInputDetails((prevLoanInputDetails) => {
      prevLoanInputDetails[index]["value"] = value;
      return [...prevLoanInputDetails];
    });
  };

  const handleFillResetValues = (isFill) => {
    setScreenStatus(null);
    setInputDetails((prevInputDetails) => {
      return isFill
        ? {
            loanAmount: formatCurrency(400000, 2),
            loanTerm: 30,
            fixedRate: formatPercentage(6.75, 4),
            armTerm: 7,
            armRate: formatPercentage(6, 4),
            "Year(8)": 2,
            "Year(9)": 2,
            "Year(10)": 2,
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
      { cashFlow: armCashFlow } = await handleGetAmortizationSchedule(
        3 || 7,
        false
      ); //ARM

    setFixedPayments(fixedCashFlow);
    setArmPayments(armCashFlow);
    setFixedAPRValue(ARP);

    setScreenStatus("showOutput");
    console.timeEnd("handleCalculate");
  };

  const handleCalculateARP = async ({
    cashFlow,
    loanType,
    appraisedValue,
    purchasePrice,
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
  }) => {
    const valueForLtv =
      appraisedValue > purchasePrice && purchasePrice !== 0
        ? purchasePrice
        : appraisedValue;

    let miYear = 11,
      miCancel = 11, //check here
      lesserOf = 0,
      appVal78 = 0,
      appVal80 = 0,
      wsFunded = "",
      miCancelLtvAmt = 0,
      ltv = valueForLtv ? (loanAmount / valueForLtv) * 100 : 0;

    if ([5, 8].includes(loanType)) loanType = 3;

    if (loanType === 1) miYear = 0;

    if (
      (purchasePrice || 0) !== 0 &&
      (purchasePrice || 0) < (purchasePrice || loanAmount * 1.1112)
    ) {
      lesserOf = purchasePrice || 0;
    } else {
      lesserOf = purchasePrice || loanAmount * 1.1112;
    }
    appVal78 = lesserOf * 0.78;
    appVal80 = wsFunded === "" ? appVal78 : lesserOf * 0.8;

    //FHA
    if (loanType === 2) {
      lesserOf = lesserOf * (1 + upFrontMIPFactor);
      appVal78 = appVal78 * (1 + upFrontMIPFactor);
      appVal80 = appVal80 * (1 + upFrontMIPFactor);
      const { miCancel: iMiCancel, miYear: iMiYear } = loansGetFhaTerm(
        loanTerm,
        ltv,
        fhaCaseDate
      );
      miCancel = iMiCancel;
      miYear = iMiYear;
      miCancelLtvAmt = miCancelLtvAmt;
    } else if (loanType === 3) {
      if (mipAmt > 0) {
        miYear = loanTerm / 12;
        miCancelLtvAmt = appVal80;
        miCancel = 1;
      } else {
        miYear = 0;
      }
    } else if (loanType === 4) {
      upFrontMIPFactor = 0;
      miCancelLtvAmt = appVal78;
      miYear = loanTerm / 12;
    }
    upFrontMIPFactor = upFrontMIPFactor / 100; //Convert to %

    let miYearCount = 0,
      miMonthStartAmt = 0,
      miMonthEndAmt = 0;

    while (miYearCount <= miYear) {
      //MIAmt - update to cashflow
      if ([2, 4].includes(loanType)) {
        const { MIAmt, finalBal, finalPay } = loansCalculateMI(
          Number(loanAmount),
          movingRate,
          Number(iMiPercent),
          upFrontMIPFactor,
          monthlyPayment,
          loanType === 2 ? "FHA" : "USD"
        );
        mipAmt = MIAmt;
        miMonthStartAmt = finalBal;
      }

      miMonthStartAmt = (miYearCount - 1) * 12 + 1;
      miMonthEndAmt = miYearCount * 12;

      if (loanType === 3) {
        let blHpa = 0;
        if (
          [1, 2].includes(PropertyBe) &&
          [1, 15, 16, 2, 4, 5, 6, 7, 8, 9].includes(propType)
        ) {
          blHpa = 1;
        }

        if (miMonthStartAmt > 120) {
          mipAmt = Math.round((loanAmount * 0.002) / 12, 2);
        }
        if (blHpa === 1 && miMonthStartAmt > loanTerm * 0.5) {
          mipAmt = 0;
          miCancel = 1;
        }
      } else {
        miCancel = 0;
      }
      if (miYearCount > 0) {
        for (
          let index = Math.abs(miMonthStartAmt - 1);
          index <= Math.abs(miMonthEndAmt - 1);
          index++
        ) {
          cashFlow[index]["paymentWithMi"] = cashFlow[index]["Amount"] + mipAmt;
          cashFlow[index]["miAmount"] = mipAmt;
        }
      }
      miYearCount++;
    }

    if ((miCancel || 0) > 0 && ![3, 7].includes(amortizeType)) {
      for (let i = 0; i < cashFlow.length; i++) {
        if (
          cashFlow[i].stBalance < miCancelLtvAmt &&
          (miCancel === 1 || (miCancel === 2 && cashFlow[i].paymentNumber > 60))
        ) {
          cashFlow[i].paymentWithMi = cashFlow[i]["Amount"];
        }
      }
    }

    const { guessAmount, loopCount } = await calculateAPR(
      cashFlow,
      zeroFlow,
      oddFactor,
      noteRate
    );
    console.log({ cashFlow, guessAmount, loopCount });
    return guessAmount.toFixed(3) * 100 || 0;
  };

  const getValuesFromLoanInputDetails = () => {
    let extractedObject = {};

    loanInputDetails.forEach((item) => {
      let { name, value } = item;
      extractedObject[name] = value;
    });
    return extractedObject;
  };

  const calculateCashFlows = (
    loanAmount,
    term,
    firstPayment,
    ratesArray,
    paidInCash
  ) => {
    let cashFlows = [];
    let balance = loanAmount;
    let cashflowDate = new Date(firstPayment);
    let periodId = 1;

    ratesArray.forEach((rate) => {
      let { startTerm, endTerm, noteRate } = rate,
        termCnt = 1,
        movingTerm = endTerm - startTerm + 1,
        remainingTerm = term - startTerm + 1;

      let monthlyRate = noteRate / 12;

      let payment = calculatePMT(monthlyRate, remainingTerm, balance);
      while (termCnt <= movingTerm) {
        cashflowDate.setMonth(cashflowDate.getMonth());
        let stBalance = balance;
        let monthlyInterest = parseFloat((balance * monthlyRate).toFixed(2));

        if (termCnt === term && stBalance + monthlyInterest !== payment) {
          payment = stBalance + monthlyInterest;
        }

        let monthlyPrincipal = payment - monthlyInterest;
        let endBalance = stBalance + monthlyInterest - payment;

        cashFlows.push({
          paymentNumber: periodId,
          cashflowDate: cashflowDate.toISOString().split("T")[0],
          cashflowType: 1,
          stBalance: stBalance,
          Amount: payment,
          Interest: monthlyInterest,
          Principal: monthlyPrincipal,
          intRate: noteRate,
          Balance: endBalance,
          miAmount: paidInCash,
          paymentWithMi: payment + paidInCash,
        });

        balance = endBalance;
        termCnt++;
        periodId++;
      }
    });

    return cashFlows;
  };

  const handleGetAmortizationSchedule = async (amortizeType, getAPR) => {
    let armRateInitialAdj = 12,
      armRateSubAdj = 12,
      armGrossMargin = 2,
      armLifeCap = 5,
      armIndexValue = 0, //check this value
      ratesArray = [];

    try {
      const disbursementDates = new Date("2024-03-06"),
        firstPaymentDate = getFirstDateFormDisbursement(disbursementDates),
        { oddFactor, oddDays } = calculateOddFactor(
          disbursementDates,
          firstPaymentDate
        );

      let { fixedRate, loanAmount, loanTerm, armTerm, armRate } = inputDetails;

      fixedRate = cleanValue(fixedRate);
      loanAmount = cleanValue(loanAmount);
      loanTerm = cleanValue(loanTerm);
      armTerm = cleanValue(armTerm);
      armRate = cleanValue(armRate);

      armRate = armRate / 100;
      loanTerm = loanTerm * 12;
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
        ["Cash From Borrower"]: tilPrePay,
      } = getValuesFromLoanInputDetails();

      paidInCash = cleanValue(paidInCash);
      mipAmt = cleanValue(mipAmt);
      lienPosition = cleanValue(lienPosition);
      rate2 = cleanValue(rate2);
      iMiPercent = cleanValue(iMiPercent);
      loanType = cleanValue(loanType);
      upFrontMIPFactor = cleanValue(upFrontMIPFactor);
      purchasePrice = cleanValue(purchasePrice);
      appraisedValue = cleanValue(appraisedValue);
      PropertyBe = cleanValue(PropertyBe);
      propType = cleanValue(propType);
      tilPrePay = cleanValue(tilPrePay);

      let rate = fixedRate,
        miPercent = !iMiPercent ? 0.0085 : iMiPercent,
        // tilPrePay = 0, //Not payment done - get it form (GetPFCLoanValueM_hud901 loanId)
        adjustHud901 = 0,
        initialAmt = 0,
        zeroFlow = 0;

      rate = (lienPosition === 2 ? rate2 : rate) / 100;

      if (loanType === 4) {
        miPercent = 0.005;
      }

      if (miPercent > 0.2) miPercent = miPercent * 0.01;

      if (paidInCash === 1) upFrontMIPFactor = 0;

      if (tilPrePay < 0) {
        adjustHud901 = 1;
        //tilPrePay - get it form vHUDDesc table
        initialAmt = tilPrePay;
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
        let newRate = 0;
        armLifeCap = armLifeCap + rate;
        ratesArray.push({
          startTerm: 1,
          endTerm: armTerm * 12,
          totalTerm: loanTerm,
          noteRate: parseFloat(armRate),
        });

        armAdjustmentYears.map((year) => {
          newRate = updateARMRate(
            armRate,
            0,
            armGrossMargin,
            armIndexValue,
            armLifeCap
          );
          ratesArray.push({
            startTerm: (year - 1) * 12 + 1,
            endTerm: year * 12,
            totalTerm: loanTerm,
            noteRate:
              ratesArray[ratesArray.length - 1]["noteRate"] +
              parseFloat(inputDetails[`Year(${year})`] / 100),
          });
        });
        ratesArray.push({
          startTerm: ratesArray[ratesArray.length - 1]["endTerm"] + 1,
          endTerm: loanTerm,
          totalTerm: loanTerm,
          noteRate: ratesArray[ratesArray.length - 1]["noteRate"],
        });
      }

      const cashFlow = calculateCashFlows(
        loanAmount,
        loanTerm,
        firstPaymentDate,
        ratesArray,
        mipAmt
      );
      const {
        Amount: monthlyPayment,
        Interest: movingRate,
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
      return { cashFlow, ARP };
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
      adjRate = parseFloat(inputDetails["armRate"] || 0);
    return (
      <>
        {armAdjustmentYears.map((year, index) => {
          FixedArmDifferent = index === 0 ? index : FixedArmDifferent;
          const sIndex = (year - 1) * 12 - 1,
            eIndex = sIndex + 12,
            { Balance: fixedStartBalance, Amount: fixedMonthlyPI } =
              fixedPayments[sIndex],
            { Balance: adjStartBalance } = armPayments[sIndex],
            { Balance: fixedEndBalance, Amount: fixedEndPayment } =
              fixedPayments[eIndex],
            { Balance: adjEndBalance, Amount: adjEndPayment } =
              armPayments[eIndex],
            balanceDifference = adjEndBalance - fixedEndBalance,
            paymentDifference = (adjEndPayment - fixedEndPayment) * 12;

          FixedArmDifferent = FixedArmDifferent + paymentDifference;

          const balance = balanceDifference + FixedArmDifferent;

          adjRate += parseFloat(inputDetails[`Year(${year})`]);

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
                          <tr className="tableRow">
                            <td></td>
                            <td>Fixed</td>
                            <td>ARM</td>
                          </tr>{" "}
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
    let adjRate = 0,
      lastAdjYear = armAdjustmentYears[armAdjustmentYears.length - 1];
    armAdjustmentYears.map((year, index) => {
      adjRate += parseFloat(inputDetails[`Year(${year})`]);
    });
    const { Balance: fixedEndBalance, Amount: fixedEndPayment } =
        fixedPayments[lastAdjYear * 12 - 1],
      { Balance: adjEndBalance, Amount: adjEndPayment } =
        armPayments[lastAdjYear * 12 - 1];

    const remainingPaymentCount =
      inputDetails["loanTerm"] * 12 - lastAdjYear * 12;

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
                    <tr className="tableRow">
                      <td></td>
                      <td>Fixed</td>
                      <td>ARM</td>
                    </tr>{" "}
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
                      <td>
                        {formatPercentage(
                          inputDetails["armRate"] + adjRate || 0,
                          4
                        )}
                      </td>
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
          color: "#053d5d",
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
          color: "#84329b",
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
            maxWidth: isMobile ? screenWidth - 20 : 950,
            margin: "auto",
            overflow: "hidden",
            border: "1px solid",
          },
        }}
      >
        <div>
          <div
            className="screenTitle"
            style={{
              fontSize: isMobile ? "1.8em" : "3.5em",
              fontWeight: "bold",
            }}
          >
            ARM vs Fixed Calculator
          </div>
          <p
            style={{
              margin: "auto 20px",
              fontSize: 16,
              fontFamily: '"Libre Franklin", Arial, sans-serif',
              fontWeight: 300,
            }}
          >
            95% of borrowers take out a Fixed Rate Mortgage, even though it may
            not be the best option for them. Most borrowers stay in their home
            on average 10 years and keep the same mortgage for only 7 years.
            It’s not our job to steer a customer into a certain product, but it
            is our job to present the options. By sharing this calculator with
            your clients, you will become a trusted resource and show that you
            are a lot smarter than your competition.
          </p>
          <div
            className="container"
            style={{ width: isMobile ? "80%" : "450px" }}
          >
            <InputBox
              disabled={screenStatus === "showOutput"}
              type="number"
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
              type="number"
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
                  type="float"
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
                    console.log(value);
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
                <Dropdown
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
                />
                <InputBox
                  disabled={screenStatus === "showOutput"}
                  type="float"
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
            {armAdjustmentYears.length ? (
              <div
                style={{
                  backgroundColor: "#f7f6f6",
                  padding: "25px 15px 0",
                  margin: "0 -15px",
                }}
              >
                <div className="blueHeader" style={{ marginBottom: 25 }}>
                  Rate Adjustments
                </div>
                <div>
                  {armAdjustmentYears.map((year, index) => {
                    return (
                      <Fragment key={index}>
                        <InputBox
                          disabled={screenStatus === "showOutput"}
                          type="float"
                          style={{
                            width: isMobile ? "23%" : "27%",
                            minWidth: 60,
                            marginRight: 10,
                            display: "inline-block",
                          }}
                          validate={false}
                          label={`Year(${year})`}
                          // placeholder={`Year(${year})`}
                          onBlur={() => {}}
                          onChangeText={({ target }) => {
                            const { value } = target;
                            handleFieldValueChange({
                              name: `Year(${year})`,
                              value,
                            });
                          }}
                          value={(
                            inputDetails[`Year(${year})`] || ""
                          )?.toString()}
                        />
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            ) : (
              <></>
            )}

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
                } = field;

                if (name === "FHA Case # Date") {
                  const loanType = loanInputDetails.filter(
                    (item) => item["name"] === "Agency (Loan) Type"
                  )[0];
                  if (Number(loanType["value"]) !== 2) {
                    return <></>;
                  }
                }

                return (
                  <Fragment key={index}>
                    {type === 1 ? (
                      <>
                        <InputBox
                          style={{ width: isMobile ? "100%" : "45%" }}
                          disabled={screenStatus === "showOutput"}
                          validate={false}
                          label={name}
                          placeholder={name}
                          onFocus={onFocus}
                          onBlur={(e) => {
                            if (["date", "$", "%"].includes(formatType)) {
                              const { value } = e.target;
                              handleLoanFieldValueChange(index, {
                                name,
                                value:
                                  formatType === "date"
                                    ? formatDateTimeNew(value, 2)
                                    : formatType === "$"
                                    ? formatCurrency(value)
                                    : formatType === "%"
                                    ? formatPercentage(value, 4)
                                    : value,
                              });
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
                          disabled={screenStatus === "showOutput"}
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
                style={{ backgroundColor: "#34495e" }}
                title="Start Over"
                onClick={() => handleFillResetValues()}
              />
              <Button
                style={{ backgroundColor: "#179b55" }}
                title="Calculate and Compare"
                onClick={handleCalculate}
              />
              <Button
                style={{ backgroundColor: "#e5a31f" }}
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
