/* ====== BlendedRate (Start) ===== */
const calculateBlendedRate = (loans) => {
  const weightedRates = loans.map(
    (loan) => parseInt(loan.balance) * (parseFloat(loan.rate) / 100)
  );
  const totalPrincipal = loans.reduce(
    (total, loan) => total + parseInt(loan.balance),
    0
  );
  const blendedRate =
    weightedRates.reduce((sum, weightedRate) => sum + weightedRate, 0) /
    totalPrincipal;
  return roundValue((blendedRate || 0) * 100, 3);
};

/* ====== BlendedRate (end) ===== */

/* ====== OddFactor (start) ===== */

function getFirstDateFormDisbursement(sDate) {
  let FirstPayDate;
  sDate = new Date(sDate);

  let varDate;
  if (sDate.getMonth() === 11) varDate = `1/1/${sDate.getFullYear() + 1}`;
  else varDate = `${sDate.getMonth() + 2}/1/${new Date(sDate).getFullYear()}`;

  if (
    new Date(sDate.getFullYear(), sDate.getMonth() + 1, 1) -
      new Date(sDate.getFullYear(), sDate.getMonth(), 1) <
    new Date(varDate) - new Date(sDate.getFullYear(), sDate.getMonth(), 1) + 1
  ) {
    FirstPayDate = new Date(sDate.getFullYear(), sDate.getMonth() + 2, 1);
  }

  return FirstPayDate;
}
const roundValue = (value = 0, roundOf = 2) => {
  return parseFloat(value.toFixed(roundOf));
};
function calculateFirstDate(dateString, isFormat, addMonth = 1) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  let month = date.getMonth() + addMonth,
    year = date.getFullYear();
  month = month <= 9 ? "0" + month : month;
  const currentDate = `${month}/01/${year}`,
    returnDate = isFormat ? currentDate : new Date(currentDate);

  return returnDate;
}

function calculateOddFactor(disburseDate, FirstPayDate) {
  let FirstPayDateObj = new Date(FirstPayDate),
    currentDate = new Date(disburseDate);
  FirstPayDateObj.setMonth(FirstPayDateObj.getMonth() - 1);
  currentDate.setHours(0, 0, 0, 0);
  let diffTime = FirstPayDateObj.getTime() - currentDate.getTime(),
    diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)),
    oddDays = diffDays < 0 ? 0 : diffDays;

  let oddFactor = oddDays / 30 || 0;

  return {
    oddDays,
    oddFactor,
  };
}
/* ====== OddFactor (end) ===== */

const roundNearestEighth = (targetRate) => {
  const rates = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    intRate = Math.floor(targetRate * 100),
    dblRemainder = targetRate * 100 - intRate;

  return (intRate + rates.find((rate) => dblRemainder < rate)) * 0.01;
};

const updateARMRate = (
  rate,
  curArmRateAdj,
  armGrossMargin,
  armIndexValue,
  armLifeCap
) => {
  let newRate = 0,
    targetRate = roundNearestEighth(armGrossMargin + armIndexValue);

  if (rate == targetRate) {
    newRate = rate;
  } else if (rate > targetRate) {
    newRate = rate - curArmRateAdj;
    if (newRate < targetRate) {
      newRate = targetRate;
    }
  } else {
    newRate = rate + curArmRateAdj;
    if (newRate > targetRate) {
      newRate = targetRate;
    }
    if (newRate > armLifeCap) {
      newRate = armLifeCap;
    }
  }

  return newRate;
};

const calculatePMT = (rate, payments, PV) => {
  let result = 0;
  if (rate && payments && PV !== 0) {
    result = PV / ((1 - Math.pow(1 + rate, -payments)) / rate);
  }
  return roundValue(result);
};

const loansGetFhaTerm = (loanTerm, ltv, fhaCaseDate) => {
  let miYear = 0,
    miCancel = 0;
  const loanTermYears = loanTerm / 12;

  if (!fhaCaseDate || fhaCaseDate === "1900-01-01") {
    fhaCaseDate = new Date();
  }

  fhaCaseDate = new Date(fhaCaseDate);

  if (fhaCaseDate >= new Date("2013-06-03") || fhaCaseDate === "1900-01-01") {
    if (ltv <= 90) {
      miYear = 11;
    } else {
      miYear = loanTermYears;
    }
    miCancel = 0;
  } else {
    if (loanTermYears <= 15) {
      if (ltv <= 78) {
        miYear = 0;
      } else {
        miYear = loanTermYears;
        miCancel = 1;
      }
    } else {
      if (ltv <= 78) {
        miYear = 5;
      } else {
        miYear = loanTermYears;
        miCancel = 2;
      }
    }
  }

  return { miYear, miCancel };
};

const loansCalculateMI = (
  LoanBal,
  IntRate,
  MIPFactor,
  UpFrontMIPFactor,
  PI,
  type = ""
) => {
  let finalPay,
    finalBal,
    Num = 1,
    CalAmt,
    tLoanBal = LoanBal,
    cLoanBal = LoanBal;

  while (Num <= 11) {
    CalAmt = parseFloat((cLoanBal * IntRate).toFixed(2));
    CalAmt = parseFloat((CalAmt / 12).toFixed(2));
    CalAmt = CalAmt + cLoanBal;
    cLoanBal = CalAmt - PI;
    tLoanBal = tLoanBal + cLoanBal;
    Num++;
  }

  // Calculate final balance
  CalAmt = parseFloat((cLoanBal * IntRate).toFixed(2));
  CalAmt = parseFloat((CalAmt / 12).toFixed(2));
  CalAmt = CalAmt + cLoanBal - PI;
  finalBal = CalAmt;

  // Annual MI calculation
  cLoanBal = tLoanBal / 12;
  let MIAmt = parseFloat((cLoanBal * MIPFactor).toFixed(2));
  if (type === "FHA")
    MIAmt = parseFloat((MIAmt / (1 + UpFrontMIPFactor * 100)).toFixed(2));
  MIAmt = parseFloat((MIAmt / 12).toFixed(2));

  finalPay = PI + MIAmt;

  return { MIAmt, finalBal, finalPay };
};

async function calculateAPR(tilCashFlows, zeroFlow, odd_Factor, noteRate) {
  let periodCount = tilCashFlows.length;
  let guessAmount = 0;
  let loopCount = 0;

  if (Math.abs(zeroFlow) === 0 || periodCount < 10) {
    return { guessAmount, loopCount };
  }

  let NPV;
  let monthlyGuess;
  let incrementSign = 1;
  let incrementFactor = 0.001;
  let loopDirection = 0;
  let nearestNpv = 0.01;
  let prevGuess = 0;
  let sameAprCount = 0;

  try {
    loopCount = 0;
    guessAmount = noteRate; // Based on assumption that APR is always greater than Note rate
    guessAmount = guessAmount <= 0 ? 0.00001 : guessAmount;
    prevGuess = guessAmount;
    monthlyGuess = guessAmount / 12;

    let onePlusGuess = 1 + monthlyGuess;
    let oddMultiple = 1 + odd_Factor * monthlyGuess;

    NPV = tilCashFlows.reduce((acc, cashflow) => {
      return (
        acc +
        cashflow.paymentWithMi /
          parseFloat(
            (
              Math.pow(onePlusGuess, cashflow.paymentNumber) * oddMultiple
            ).toFixed(6)
          )
      );
    }, 0);

    if (NPV === 0) {
      return { guessAmount: 0, loopCount: 0 };
    }

    NPV += zeroFlow;
    incrementFactor = 0.001;
    nearestNpv = 0.01;

    if (NPV < 0) {
      incrementSign = -1;
    }

    loopDirection = NPV > 0 ? 1 : 0;

    while (
      loopCount < 100 &&
      Math.abs(NPV) > 0.5 &&
      sameAprCount <= 5 &&
      ((NPV > 0 && incrementSign === 1) || (NPV < 0 && incrementSign === -1)) &&
      Math.abs(NPV) > nearestNpv
    ) {
      guessAmount += incrementFactor * incrementSign;
      monthlyGuess = guessAmount / 12;

      if (monthlyGuess > 0.2) {
        monthlyGuess = 0.2;
      }

      onePlusGuess = 1 + monthlyGuess;
      oddMultiple = 1 + odd_Factor * monthlyGuess;

      NPV = tilCashFlows.reduce((acc, cashflow) => {
        return (
          acc +
          cashflow.paymentWithMi /
            parseFloat(
              (
                Math.pow(onePlusGuess, cashflow.paymentNumber) * oddMultiple
              ).toFixed(6)
            )
        );
      }, 0);

      NPV += zeroFlow;
      loopCount++;

      if (
        (loopDirection === 1 && NPV < 0) ||
        (loopDirection === 0 && NPV > 0)
      ) {
        loopDirection = loopDirection ? 0 : 1;
        incrementFactor /= 2;
      }
      if (guessAmount.toFixed(7) === prevGuess.toFixed(7)) {
        sameAprCount++;
      } else {
        incrementSign = NPV > 0 ? 1 : -1;
      }

      prevGuess = guessAmount;
    }

    return { guessAmount, loopCount };
  } catch (error) {
    throw new Error(error.message);
  }
}

const cleanValue = (value = 0) => {
  value = value
    .toString()
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll("$", "")
    .replaceAll("%", "")
    .replaceAll(",", "");

  return Number(value);
};

const calculateCashFlows = (
  loanAmount,
  term,
  firstPayment,
  ratesArray,
  mipAmt
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
        stBalance: roundValue(stBalance),
        Amount: roundValue(payment),
        Interest: roundValue(monthlyInterest),
        Principal: roundValue(monthlyPrincipal),
        intRate: noteRate,
        Balance: roundValue(endBalance),
        miAmount: mipAmt,
        paymentWithMi: roundValue(payment) + mipAmt,
      });

      balance = endBalance;
      termCnt++;
      periodId++;
    }
  });

  return cashFlows;
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
  ltvRatio = 0,
}) => {
  console.log({
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
    ltvRatio,
  });
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
  if (ltvRatio) {
    appVal78 = lesserOf * ltvRatio;
    appVal80 = wsFunded === "" ? appVal78 : lesserOf * ltvRatio;
  } else {
    appVal78 = lesserOf * 0.78;
    appVal80 = wsFunded === "" ? appVal78 : lesserOf * 0.8;
  }

  //FHA
  if (loanType === 2) {
    //yet to test
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
    miCancelLtvAmt = appVal78;
  } else if (loanType === 3) {
    //Conventional
    if (mipAmt > 0) {
      miYear = loanTerm / 12;
      miCancelLtvAmt = appVal80;
      miCancel = 1;
    } else {
      miYear = 0;
    }
  } else if (loanType === 4) {
    //USDA/RHS
    upFrontMIPFactor = 0;
    miCancelLtvAmt = appVal78;
    miYear = loanTerm / 12;
  }
  upFrontMIPFactor = upFrontMIPFactor / 100; //Convert to %

  let miYearCount = 1,
    miMonthStartAmt = loanAmount,
    miMonthEndAmt = 0,
    miMonthStart = 0,
    miMonthEnd = 0;

  while (miYearCount <= miYear) {
    //MIAmt - update to cashflow
    if ([2, 4].includes(loanType)) {
      const { MIAmt, finalBal, finalPay } = loansCalculateMI(
        Number(miMonthStartAmt),
        movingRate,
        Number(iMiPercent),
        upFrontMIPFactor,
        monthlyPayment,
        loanType === 2 ? "FHA" : "USD"
      );
      mipAmt = roundValue(MIAmt / 100, 2);
      miMonthStartAmt = finalBal;
    }

    miMonthStart = (miYearCount - 1) * 12 + 1;
    miMonthEnd = miYearCount * 12;

    if (loanType === 3) {
      //Conventional
      let blHpa = 0;
      if (
        [1, 2].includes(PropertyBe) &&
        [1, 15, 16, 2, 4, 5, 6, 7, 8, 9].includes(propType)
      ) {
        blHpa = 1;
      }

      if (miMonthStart > 120) {
        mipAmt = roundValue((loanAmount * 0.002) / 12, 2);
      }
      if (blHpa === 1 && miMonthStart > loanTerm * 0.5) {
        mipAmt = 0;
        miCancel = 1;
      }
    } else {
      miCancel = 0;
    }
    if (miYearCount > 0) {
      for (
        let index = Math.abs(miMonthStart - 1);
        index <= Math.abs(miMonthEnd - 1);
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

  const { guessAmount } = await calculateAPR(
    cashFlow,
    zeroFlow,
    oddFactor,
    noteRate
  );

  return roundValue(guessAmount * 100, 4) || 0;
};
const getPercentageValue = ({ totalValue, percentage }) => {
  return totalValue * (percentage % 100);
};
const getValuePercentage = ({ totalValue, amount }) => {
  return (amount / totalValue) * 100;
};

export {
  calculatePMT,
  cleanValue,
  calculateFirstDate,
  getFirstDateFormDisbursement,
  calculateOddFactor,
  updateARMRate,
  loansGetFhaTerm,
  loansCalculateMI, //dmloans_CalFHAMI
  calculateAPR,
  roundValue,
  calculateCashFlows,
  handleCalculateARP,
  calculateBlendedRate,
  getPercentageValue,
  getValuePercentage,
};
