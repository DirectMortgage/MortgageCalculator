import { useEffect, useState } from "react";
import RowSortTable from "../CommonFunctions/RowSortTable";
import {
  calculateBlendedRate,
  cleanValue,
} from "../CommonFunctions/CalcLibrary";
import { formatCurrency } from "../CommonFunctions/GeneralCalculations";

const BlendedRate = (props) => {
  const { screenWidth } = props;
  const debtList = [
    { name: "Debt 1", balance: 0, rate: 0, monthlyPayment: 0 },
    { name: "Debt 2", balance: 0, rate: 0, monthlyPayment: 0 },
    { name: "Debt 3", balance: 0, rate: 0, monthlyPayment: 0 },
  ];
  const [itemList, setItemList] = useState([...debtList]);
  const [resultDetails, setResultDetails] = useState({
    amt: 0,
    rate: 0,
    monthlyPayment: 0,
  });

  useEffect(() => {
    console.log(itemList);
    let rate = calculateBlendedRate(itemList),
      amt = itemList.reduce(
        (total, item) => total + parseInt(cleanValue(item["balance"]) || 0),
        0
      ),
      monthlyPayment = itemList.reduce(
        (total, item) => total + parseInt(item["monthlyPayment"] || 0),
        0
      );

    setResultDetails((prevResultDetails) => {
      return {
        ...prevResultDetails,
        amt: formatCurrency(amt || 0).replace("$", ""),
        monthlyPayment: formatCurrency(monthlyPayment || 0).replace("$", ""),
        rate,
      };
    });
  }, [itemList]);

  return (
    <>
      <div className="brHeaderWrapper">
        <div className="brHeader">
          <h2 className="brHeaderText">Blended Rate Calculator</h2>
          <p className="brHeaderDesc">
            Give your clients a more accurate and correct rate when they
            consider all of their varying debts and related interest rates.
          </p>
        </div>
      </div>

      <div className="brBodyContainer">
        <div
          style={{
            justifyContent: "space-evenly",
            display: "flex",
            flexDirection: "row",
            padding: "16px 12px",
            background: "rgb(255, 255, 255)",
            borderRadius: "4px",
            border: "1px solid rgb(222, 237, 235)",
            marginBottom: 40,
          }}
        >
          <div className="brResultSection">
            <span className="brResultTitle">Total amount</span>
            <h4 className="brResultValue">
              $<div>{resultDetails["amt"]}</div>
            </h4>
            <div style={{ flex: 1 }}></div>
          </div>
          <div style={{ borderRight: "1px solid rgb(193, 208, 206)" }}></div>
          <div className="brResultSection">
            <span className="brResultTitle">Blended rate</span>
            <h4 className="brResultValue">
              <div>{resultDetails["rate"]}</div>%
            </h4>
            <div style={{ flex: 1 }}></div>
          </div>
          <div style={{ borderRight: "1px solid rgb(193, 208, 206)" }}></div>

          <div className="brResultSection">
            <span className="brResultTitle">Total monthly payment</span>
            <h4 className="brResultValue">
              $<div>{resultDetails["monthlyPayment"]}</div>
            </h4>
            <div style={{ flex: 1 }}></div>
          </div>
        </div>

        <RowSortTable
          itemList={itemList}
          setItemList={setItemList}
          onDelete={({ index }) => {
            setItemList((prevItemList) => {
              prevItemList = prevItemList.filter(
                (item, iIndex) => iIndex !== index
              );
              return prevItemList;
            });
          }}
          onValueChange={({ name, value, index }) => {
            setItemList((prevItemList) => {
              prevItemList[index][name] = value;
              return [...prevItemList];
            });
          }}
        />

        <div>
          <button
            type="button"
            className="brAddDebt"
            style={{ float: "right" }}
            onClick={() => {
              setItemList((prevItemList) => {
                const newDebt = {
                  name: "Debt " + (prevItemList.length + 1),
                  balance: 0,
                  rate: 0,
                  monthlyPayment: 0,
                };
                return [...prevItemList, newDebt];
              });
            }}
          >
            + Add debt
          </button>
          <button
            type="button"
            className="brResetDebt"
            style={{ float: "right" }}
            onClick={() => {
              setItemList([...debtList]);
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
};

export default BlendedRate;
