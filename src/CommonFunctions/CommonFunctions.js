const API_CONTROLLER_NAME = "GenericAPI",
  API_URL = `../../../${API_CONTROLLER_NAME}/api/`;

const handleAPI = async ({
  name,
  params = {},
  method,
  requestOptions = null,
  apiName = null,
}) => {
  let url = API_URL;

  params = Object.keys(params)
    .map(
      (key) => `${key}=${params[key]?.toString()?.replaceAll("&", "U00026")}`
    )
    .join("&");

  if (window.location.host.includes("localhost")) {
    url = url.replace("../../..", "https://www.solutioncenter.biz");
  }
  if (apiName) {
    url = url.replace(API_CONTROLLER_NAME, apiName);
  }
  try {
    return fetch(
      `${url}${name}?${params}`,
      requestOptions
        ? requestOptions
        : {
            method: method || "POST",
            mode: "cors",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
    )
      .then(async function (response) {
        return await response.json();
      })
      .catch(function (err) {
        console.log(`Error from handleAPI (${name}) ====>  ${err}`);
      });
  } catch (error) {}
};
const handleGetLoanData = async (loanId) =>
  await handleAPI({
    name: "GetLoanDetails",
    params: {
      loanId,
    },
  })
    .then((response) => {
      response = JSON["parse"](response)["Table"][0];
      return response;
    })
    .catch((e) => console.error("Error From GetLoanDetails ====>", e));

const handleGetDownPaymentDetails = ({ loanAmt, purValue }) => {
  const downPaymentPercent = [3, 3.5, 5, 10, 15, 20, 25, 100],
    iDownPaymentDetails = downPaymentPercent.map((percentage) => {
      const downPayment = purValue * (percentage / 100);
      return {
        percentage,
        downPayment,
        loanAmt: purValue - downPayment,
      };
    });
  return iDownPaymentDetails;
};
function useDebounce(func, delay) {
  let timeoutId;

  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export {
  handleAPI,
  handleGetLoanData,
  handleGetDownPaymentDetails,
  useDebounce,
};
