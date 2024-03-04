/* ===== No. of Payment based on year count (Start) ===== */
const noOfPayments = (termCount) => {
  return termCount * 12;
};
/* ===== No. of Payment (end) ===== */

/* ===== APR (Start) ===== */
const calculateAPR = (
  startingAmount,
  termYears,
  adjMonthlyPayment,
  decimalPlaces
) => {
  decimalPlaces = decimalPlaces == 0 ? 0 : decimalPlaces || 3; //sets a default if no input provider
  let rate = 0;
  for (let i = 0; i < decimalPlaces + 1; i++) {
    rate = rateApproximator(
      startingAmount,
      termYears,
      adjMonthlyPayment,
      rate,
      i
    );
  }
  let result =
    Math.round(rate * Math.pow(10, decimalPlaces)) /
    Math.pow(10, decimalPlaces);
  let stringifiedResult = result.toString().split(".");
  if (stringifiedResult.length < 2) {
    result = result.toString() + "." + "0".repeat(decimalPlaces);
  } else if (stringifiedResult[1].length < decimalPlaces) {
    const missingPlace = decimalPlaces - stringifiedResult[1].length;
    result = result.toString() + "0".repeat(missingPlace);
  }
  return result;
};

const rateApproximator = (
  startingAmount,
  term,
  adjMonthlyPayment,
  startRate,
  decimalPlace
) => {
  const increment = 1 / Math.pow(10, decimalPlace);
  let loopBreaker = 0;
  let estimatedPayment = 0;
  while (estimatedPayment < adjMonthlyPayment && loopBreaker < 100) {
    estimatedPayment = mortgagePayment(
      startingAmount,
      startRate + increment,
      term
    );
    if (estimatedPayment >= adjMonthlyPayment) {
      return startRate;
    } else {
      startRate += increment;
    }
    loopBreaker++;
  }
  return startRate;
};

function mortgagePayment(amount, yearRateInPercent, years) {
  var calcNumberOfPayments = years * 12;
  var monthlyPayment = mortgageMonthPay(
    amount,
    yearRateInPercent,
    calcNumberOfPayments
  );
  return monthlyPayment;
}

function mortgageMonthPay(balance, annualRate, months) {
  var result = 0;
  var pmts = months;
  var monthlyRateInDec = annualRate / 1200;
  if (annualRate != 0) {
    var topEq = monthlyRateInDec * Math.pow(1 + monthlyRateInDec, pmts);
    var botEq = Math.pow(1 + monthlyRateInDec, pmts) - 1;
    result = balance * (topEq / botEq);
  } else {
    result = balance / months;
  }
  return result || 0;
}
/* ===== APR (end) ===== */

/* ===== Monthly/ARM Fixed P & I (Start) ===== */
const monthlyPayment = (
  LnAmt = 444000,
  noOfPayments = 30 * 12,
  rate = 6.75
) => {
  rate = rate / 100 / 12;
  return Math.round(
    (LnAmt * rate * Math.pow(1 + rate, noOfPayments)) /
      (Math.pow(1 + rate, noOfPayments) - 1)
  );
};
/* ===== Monthly/ARM Fixed P & I (End) ===== */

/* ===== Amortization Schedule for fixed Loan (Start) ===== */
function amortirizeFixed(subLoanAmount, calcRate, monthlyPayment) {
  let i = 1,
    fixedPayments = [];
  while (subLoanAmount > 0) {
    interest = ((calcRate / 100) * subLoanAmount) / 12;
    if (subLoanAmount < monthlyPayment) {
      principal = subLoanAmount;
      monthlyPayment = principal + interest;
      subLoanAmount = 0;
    } else {
      principal = monthlyPayment - interest;
      subLoanAmount = subLoanAmount - principal;
    }
    if (subLoanAmount < 0) {
      subLoanAmount = 0;
    }

    let payment = {
      thisPayment: Math.round(monthlyPayment),
      thisInterest: Math.round(interest),
      thisPrincipal: Math.round(principal),
      thisPaymentNumber: i,
      thisLoanAmountLeft: Math.round(subLoanAmount),
    };
    fixedPayments.push(payment);
    i++;
  }
  return fixedPayments;
}
/* ===== Amortization Schedule for fixed Loan (End) ===== */

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
