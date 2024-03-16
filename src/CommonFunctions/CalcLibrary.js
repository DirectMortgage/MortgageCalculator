/* ====== BlendedRate (Start) ===== */
const calculateBlendedRate = (loans) => {
  const weightedRates = loans.map((loan) => loan.principal * loan.rate);
  const totalPrincipal = loans.reduce(
    (total, loan) => total + loan.principal,
    0
  );
  const blendedRate =
    weightedRates.reduce((sum, weightedRate) => sum + weightedRate, 0) /
    totalPrincipal;
  return blendedRate;
};

// const loans = [
//     { principal: 45000, rate: 0.05 },
//     { principal: 46000, rate: 0.06 },
//     { principal: 47000, rate: 0.07 }
// ];
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

function calculateFirstDate(dateString, isFormat) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  let month = date.getMonth() + 2,
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
    // result *= -1;
  }
  return result;
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
          (Math.pow(onePlusGuess, cashflow.paymentNumber) * oddMultiple)
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
            (Math.pow(onePlusGuess, cashflow.paymentNumber) * oddMultiple)
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

      if (Math.round(guessAmount, 7) === Math.round(prevGuess, 7)) {
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

const cleanValue = (value) => {
  value = value
    .toString()
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll("$", "")
    .replaceAll("%", "")
    .replaceAll(",", "");

  return Number(value);
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
};
