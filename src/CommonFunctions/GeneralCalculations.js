const replaceAll = (strText, strRepText, strTextToRep) => {
  try {
    let intIndexOfMatch = strText.indexOf(strRepText);
    while (intIndexOfMatch != -1) {
      strText = strText.replace(strRepText, strTextToRep);
      intIndexOfMatch = strText.indexOf(strRepText);
    }
  } catch (e) {}
  return strText;
};

const roundNumber = (number, decimals) => {
  try {
    var newNumber = new Number(number + "").toFixed(parseInt(decimals));
    if (newNumber.indexOf(".") < 0) {
      newNumber = newNumber + ".";
      for (let i = 0; i < decimals; i++) {
        newNumber = newNumber + "" + "0";
      }
    } else {
      var sNum = newNumber;
      var nNum = newNumber.split(".");
      for (let i = nNum[1].length; i < decimals; i++) {
        newNumber = newNumber + "" + "0";
      }
    }
    return newNumber;
  } catch (e) {}
};

const CalculatePayments_SP_PMT = (fltRate, intPayments, fltPV) => {
  let fltResult = 0;

  if (
    parseFloat(fltRate) > 0 &&
    parseInt(intPayments) > 0 &&
    parseFloat(fltPV) != 0
  ) {
    try {
      fltResult =
        parseFloat(fltPV) /
        ((1 - Math.pow(1 + parseFloat(fltRate), -parseInt(intPayments))) /
          parseFloat(fltRate));
      fltResult =
        parseFloat(fltPV) /
        ((1 - Math.pow(1 + parseFloat(fltRate), -parseInt(intPayments))) /
          parseFloat(fltRate));
      fltResult = parseFloat(fltResult) * -1;
    } catch (e) {}
  }
  return fltResult;
};

// function TestMoney(MyNum) {
//   MyNum1 = MyNum.value.trim();
//   MyNum1 = replaceAll(MyNum1, "$", "");
//   MyNum1 = replaceAll(MyNum1, ",", "");
//   if (!TestBlank(MyNum1)) {
//     return false;
//   }

//   resTestMoney = !isNaN(MyNum1);
//   if (resTestMoney) {
//     MyNum.value = FormatCurrency(MyNum1, 2, -1, 0);
//     return true;
//   } else {
//     return false;
//   }
// }

const CalculateLoanPayment = (loanTerm, IntRate, LnAmt, AmortizeType) => {
  let sPmt = "$0.00";
  try {
    if (parseFloat(IntRate) > 0 && parseInt(loanTerm) > 0) {
      IntRate = replaceAll(IntRate, "%", "");
      IntRate = parseFloat(IntRate) / 100;
      IntRate = parseFloat(IntRate) / 12;

      LnAmt = replaceAll(LnAmt, "$", "");
      LnAmt = replaceAll(LnAmt, ",", "");
      if (
        parseInt(AmortizeType) == 5 ||
        parseInt(AmortizeType) == 7 ||
        parseInt(AmortizeType) == 9
      ) {
        sPmt = (parseFloat(IntRate) / 12) * parseFloat(LnAmt);
      } else {
        sPmt = CalculatePayments_SP_PMT(IntRate, loanTerm, LnAmt);
        sPmt = parseFloat(sPmt) * -1;
      }

      sPmt = roundNumber(sPmt, 2);

      //   document.getElementById("hdnTempCtrl").value = sPmt;
      //   if (TestMoney(document.getElementById("hdnTempCtrl"))) {
      //     sPmt = document.getElementById("hdnTempCtrl").value;
      //   } else {
      //     sPmt = "$0.00";
      //   }
    }
  } catch (e) {
    console.error("Error form CalculateLoanPayment ====> ", e.message);
  }
  return sPmt;
};
const getValueByKey = (array, key) => {
  return array.map((item) => item[key]);
};
const formatCurrency = (value, digit = 2) => {
  let num = parseFloat(
      (value || "").toString().replace("$", "").replace(",", "")
    ),
    numParts = num?.toFixed(digit).split("."),
    dollars = numParts[0],
    cents = numParts[1] || "",
    sign = num == (num = Math.abs(num));
  dollars = dollars.replace(/\$|\,/g, "");
  if (isNaN(dollars)) dollars = "0";
  dollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let val = "$" + ((sign ? "" : "-") + dollars); //+ (cents ? "." + cents : ".00");
  val = val.replaceAll("-", "");
  if (val == "$-0.00") val = "$0.00";
  return val;
};
function formatPercentage(value, prefix = 4) {
  const floatValue = parseFloat(value || 0);
  if (!isNaN(floatValue)) {
    const formattedPercentage = floatValue.toFixed(prefix) + "%";
    return formattedPercentage;
  } else {
    return "";
  }
}

const formatNewDate = (date) => {
  const currentDate = new Date(date);

  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDate.getFullYear();

  return `${month}/${day}/${year}`;
};
const formatDate = (date) => {
  if (date === "") return "";
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();

  let [month, day, year] = date.split("/");

  if (!day) {
    day = month;
    month = currentDate.getMonth() + 1;
  }

  const parsedMonth = parseInt(month);
  const parsedDay = parseInt(day);

  const isValidMonth =
    !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12;
  const isValidDay = !isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31;

  if (!isValidMonth || !isValidDay) {
    const formattedCurrentMonth = (currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const formattedCurrentDay = currentDate
      .getDate()
      .toString()
      .padStart(2, "0");
    return `${formattedCurrentMonth}/${formattedCurrentDay}/${currentYear}`;
  }

  if (year && year.length === 2) {
    year = currentYear.slice(0, 2) + year;
  } else if (!year) {
    year = currentYear;
  }

  const formattedMonth = parsedMonth.toString().padStart(2, "0");
  const formattedDay = parsedDay.toString().padStart(2, "0");

  return `${formattedMonth}/${formattedDay}/${year}`;
};
export {
  CalculateLoanPayment,
  getValueByKey,
  formatCurrency,
  formatDate,
  formatPercentage,
  formatNewDate,
};
