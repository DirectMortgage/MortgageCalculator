import { memo, useEffect, useRef, useState } from "react";
import RowSortTable from "./RowSortTable";
import {
  calculateBlendedRate,
  cleanValue,
} from "../../CommonFunctions/CalcLibrary";
import { formatCurrency } from "../../CommonFunctions/GeneralCalculations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlay,
  faEnvelope,
  faDownload,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { formatPercentage } from "../../CommonFunctions/GeneralCalculations";
import html2pdf from "html2pdf.js";
import ModalComponent from "../../CommonFunctions/Modal";
// import "bootstrap/dist/css/bootstrap.min.css";

import { InputBox, TextAreaBox } from "../../CommonFunctions/Accessories";

const BlendedRate = (props) => {
  const { screenWidth, isMobile } = props;
  const debtList = [
      { name: "Debt 1", balance: 0, rate: 0, monthlyPayment: 0 },
      { name: "Debt 2", balance: 0, rate: 0, monthlyPayment: 0 },
      { name: "Debt 3", balance: 0, rate: 0, monthlyPayment: 0 },
    ],
    iEmailDetails = {
      name: "",
      email: "",
      message:
        "I wanted to send over this blended rate loan calculator report, which gives you a more accurate and correct rate when you’re using multiple loans to finance your home purchase. Let me know if you have any questions — I’m here to chat anytime.",
    };

  const [modalDetails, setModalDetails] = useState({
    isShow: false,
    header: "",
    body: <></>,
    footer: <></>,
  });

  const [itemList, setItemList] = useState([...debtList]);
  const [emailDetails, setEmailDetails] = useState(iEmailDetails);
  const [resultDetails, setResultDetails] = useState({
    amt: 0,
    rate: 0,
    monthlyPayment: 0,
  });
  const resultContentRef = useRef(null),
    htmlContentRef = useRef(null);

  useEffect(() => {
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

  const handlePdfBase64 = async () => {
    const base64 = btoa(
      await html2pdf().from(htmlContentRef.current).outputPdf()
    );
  };

  const handleDownloadPdf = async () => {
    const options = {
      filename: "Blended Rate",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    const file = html2pdf().from(htmlContentRef.current);
    file.set(options).save();
  };

  useEffect(() => {
    require("bootstrap/dist/css/bootstrap.min.css");
  }, []);

  // useEffect(() => {
  //   handleOpenComposeMail();
  // }, [emailDetails]);

  const handleEmailDetails = ({ name, value }) => {
    setEmailDetails((prevEmailDetails) => {
      return { ...prevEmailDetails, [name]: value };
    });
  };

  const handleOpenComposeMail = () => {
    setModalDetails(() => {
      const { name = "", email = "", message = "" } = emailDetails;
      const body = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <InputBox
              type="text"
              inputBoxLabel={{ top: -12 }}
              inputBoxStyle={{ fontFamily: "Inter", height: 30 }}
              style={{ width: "75%" }}
              validate={false}
              label="Client name"
              placeholder="Separate names with commas. E.g.) John Smith, Jane Smith."
              onChangeText={({ target }) => {
                const { value } = target;
                handleEmailDetails({ value, name: "name" });
              }}
              value={name}
            />
            <InputBox
              type="text"
              inputBoxLabel={{ top: -12 }}
              inputBoxStyle={{ fontFamily: "Inter", height: 30 }}
              style={{ width: "75%" }}
              validate={false}
              label="Email"
              placeholder="Comma separated, max 4."
              onChangeText={({ target }) => {
                const { value } = target;
                handleEmailDetails({ value, name: "email" });
              }}
              value={email}
            />

            <TextAreaBox
              type="text"
              inputBoxLabel={{ top: -12 }}
              inputBoxStyle={{ fontFamily: "Inter", height: 110 }}
              style={{ width: "75%" }}
              validate={false}
              label="Custom Message"
              placeholder=""
              onChangeText={({ target }) => {
                const { value } = target;
                handleEmailDetails({ value, name: "message" });
              }}
              value={message}
            />
          </div>
        ),
        footer = (
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div>
              <button
                type="button"
                className="brResetDebt"
                style={{ float: "right", marginRight: 10 }}
                onClick={() => {
                  handleModalClose();
                  handlePdfBase64();
                }}
              >
                <FontAwesomeIcon
                  className="download"
                  icon={faDownload}
                  style={{ alignSelf: "center", marginRight: 10 }}
                />
                Download
              </button>
              <button
                type="button"
                className="brResetDebt"
                style={{ float: "right", marginRight: 10 }}
                onClick={() => {
                  handleModalClose();
                }}
              >
                <FontAwesomeIcon
                  icon={faLink}
                  style={{ alignSelf: "center", marginRight: 8 }}
                />
                Copy Link
              </button>
            </div>
            <div>
              <button
                type="button"
                className="btnPrimary"
                style={{ float: "right", marginRight: 10 }}
                onClick={() => {
                  handleModalClose();
                }}
              >
                Send
              </button>
            </div>
          </div>
        );

      return {
        isShow: true,
        size: "lg",
        header: (
          <span
            style={{
              fontFamily: "Inter",
              fontSize: "25px",
              lineHeight: "40px",
              letterSpacing: "0.4px",
              textTransform: "none",
              color: "rgb(13, 33, 33)",
              fontWeight: 400,
            }}
          >
            Send
          </span>
        ),
        body,
        footer,
      };
    });
  };

  const ResultSection = memo(
    ({ fontSize = "md", isMobile }) => {
      return (
        <div
          ref={resultContentRef}
          style={{
            ...{
              justifyContent: "space-evenly",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              padding: "16px 12px",
              background: "rgb(255, 255, 255)",
              borderRadius: "4px",
              border: "1px solid rgb(222, 237, 235)",
              marginBottom: 40,
              position: "sticky",
              top: 0,
              zIndex: 1,
            },
            ...(isMobile ? {} : {}),
          }}
        >
          <div
            className={isMobile ? "brResultSectionMobile" : "brResultSection"}
          >
            <span
              className={isMobile ? "brResultTitleMobile" : "brResultTitle"}
              style={{ fontSize: fontSize === "sm" ? 12 : 14 }}
            >
              Total amount
            </span>
            <h4 className="brResultValue">
              <div style={{ fontSize: fontSize === "sm" ? 15 : 25 }}>
                ${resultDetails["amt"]}
              </div>
            </h4>
          </div>
          {!isMobile && (
            <div style={{ borderRight: "1px solid rgb(193, 208, 206)" }}></div>
          )}
          <div
            className={isMobile ? "brResultSectionMobile" : "brResultSection"}
          >
            <span
              className={isMobile ? "brResultTitleMobile" : "brResultTitle"}
              style={{ fontSize: fontSize === "sm" ? 12 : 14 }}
            >
              Blended rate
            </span>
            <h4 className="brResultValue">
              <div style={{ fontSize: fontSize === "sm" ? 15 : 25 }}>
                {resultDetails["rate"]}%
              </div>
            </h4>
          </div>
          {!isMobile && (
            <div style={{ borderRight: "1px solid rgb(193, 208, 206)" }}></div>
          )}

          <div
            className={isMobile ? "brResultSectionMobile" : "brResultSection"}
          >
            <span
              className={isMobile ? "brResultTitleMobile" : "brResultTitle"}
              style={{ fontSize: fontSize === "sm" ? 12 : 14 }}
            >
              Total monthly payment
            </span>
            <h4 className="brResultValue">
              <div style={{ fontSize: fontSize === "sm" ? 15 : 25 }}>
                ${resultDetails["monthlyPayment"]}
              </div>
            </h4>
          </div>
        </div>
      );
    },
    [resultDetails, isMobile]
  );
  const handleModalClose = () => {
    setModalDetails(() => {
      return {
        isShow: false,
        header: "",
        body: <></>,
        footer: <></>,
      };
    });
  };

  return (
    <div style={{ padding: 15 }}>
      {/* <div
        className="dropdownButton"
        style={{
          maxWidth: 1136,
          margin: "15px auto",
          textAlign: "right",
        }}
      >
        <ButtonDropdown
          title="Share"
          options={[
            // {
            //   label: (
            //     <>
            //       <FontAwesomeIcon
            //         icon={faEnvelope}
            //         style={{ alignSelf: "center" }}
            //       />
            //       Send
            //     </>
            //   ),
            //   value: 0,
            // },
            {
              label: (
                <>
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ alignSelf: "center" }}
                  />
                  Download
                </>
              ),
              value: 1,
            },
          ]}
          onChange={({ item, index }) => {
            const { value } = item;
            if (Number(value) === 1) {
              handleDownloadPdf();
            } else if (Number(value) === 0) {
              setEmailDetails({ ...iEmailDetails });
              handleOpenComposeMail();
            }
          }}
        />
      </div> */}

      <div className="brHeaderWrapper">
        <div className="brHeader">
          <h2 className="brHeaderText">
            Blended Rate Calculator{" "}
            <FontAwesomeIcon
              icon={faCirclePlay}
              size="xs"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setModalDetails(() => {
                  return {
                    isShow: true,
                    header: "Blended Rate Calculator",
                    body: (
                      <video
                        src={require("../../blended-rate.mp4")}
                        controls
                        autoplay
                        style={{ width: "100%" }}
                      ></video>
                    ),
                    footer: <></>,
                  };
                });
              }}
            />
          </h2>
          <p className="brHeaderDesc">
            Give your clients a more accurate and correct rate when they
            consider all of their varying debts and related interest rates.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1136,
          margin: `-${
            (isMobile || screenWidth) <= 500 ? 10 : 50
          }px auto 15rem auto`,
        }}
      >
        <ResultSection
          isMobile={isMobile || screenWidth <= 500}
          screenWidth={screenWidth}
        />
        <RowSortTable
          isMobile={isMobile || screenWidth <= 500}
          screenWidth={screenWidth}
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

        <div className={isMobile ? "" : "brFooterWrapper"}>
          <button
            type="button"
            className="btnPrimary"
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
            className="btnPrimary"
            style={{ float: "right", marginRight: 10 }}
            onClick={() => {
              handleDownloadPdf();
            }}
          >
            Download
          </button>

          <button
            type="button"
            className="secondaryBtn"
            style={{ float: "right", marginRight: 10 }}
            onClick={() => {
              setModalDetails(() => {
                return {
                  isShow: true,
                  header: (
                    <span
                      style={{
                        margin: "0px",
                        fontFamily: "Inter",
                        fontSize: "25px",
                        lineHeight: "40px",
                        letterSpacing: "0.4px",
                        textTransform: "none",
                        color: "rgb(13, 33, 33)",
                        fontWeight: 400,
                      }}
                    >
                      Confirmation
                    </span>
                  ),
                  body: (
                    <span
                      style={{
                        fontSize: 18,
                        lineHeight: "40px",
                        letterSpacing: "0.4px",
                        textTransform: "none",
                        color: "rgb(13, 33, 33)",
                        fontWeight: 400,
                      }}
                    >
                      Are you sure you want to reset debts?
                    </span>
                  ),
                  footer: (
                    <>
                      <button
                        type="button"
                        className="brResetDebt"
                        style={{ float: "right", marginRight: 10 }}
                        onClick={() => {
                          handleModalClose();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btnPrimary"
                        style={{ float: "right", marginRight: 10 }}
                        onClick={() => {
                          setItemList([...debtList]);
                          handleModalClose();
                        }}
                      >
                        Reset
                      </button>
                    </>
                  ),
                };
              });
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ display: "none" }}>
        <div style={{ margin: 25 }} ref={htmlContentRef}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              backgroundImage:
                "linear-gradient(225.19deg,rgb(17, 58, 63) 0%,rgb(55, 102, 104) 100%)",
            }}
          >
            <h4
              style={{
                fontFamily: "Financier",
                fontSize: "28px",
                letterSpacing: "1px",
                color: "rgb(255, 255, 255)",
                fontWeight: 300,
                textAlign: "center",
                margin: 0,
                padding: 15,
              }}
            >
              Blended Rate Calculator
            </h4>
          </div>
          <ResultSection fontSize="sm" />
          <div style={{ marginBottom: 15 }}>
            <div>
              <table
                className="brPreviewTable"
                style={{ width: "100%", fontSize: 12 }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                    }}
                  >
                    <th>Debt name</th>
                    <th>Debt balance</th>
                    <th>Interest rate</th>
                    <th>Minimum monthly obligation</th>
                  </tr>
                </thead>
                <tbody>
                  {itemList.map((debt, index) => (
                    <tr key={index}>
                      <td>{debt.name}</td>
                      <td>{formatCurrency(debt.balance || 0)}</td>
                      <td>{formatPercentage(debt.rate, 3)}</td>
                      <td>{formatCurrency(debt.monthlyPayment || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ModalComponent
        modalDetails={modalDetails}
        handleModalClose={handleModalClose}
      />
    </div>
  );
};

export default BlendedRate;
