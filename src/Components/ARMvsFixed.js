import React, { useEffect } from "react";
import Plot from "react-plotly.js";
import {
  CalculateLoanPayment,
  getValueByKey,
} from "../CommonFunctions/GeneralCalculations";
import { Button, Dropdown, InputBox } from "../CommonFunctions/Accessories";

const ARMvsFixed = () => {
  const iData = [
    {
      Fixed: 4260,
      ARM: 7331,
      Years: 1,
    },
    {
      Fixed: 8820,
      ARM: 15115,
      Years: 2,
    },
    {
      Fixed: 13697,
      ARM: 23379,
      Years: 3,
    },
    {
      Fixed: 18913,
      ARM: 32153,
      Years: 4,
    },
    {
      Fixed: 24492,
      ARM: 41469,
      Years: 5,
    },
    {
      Fixed: 30460,
      ARM: 51360,
      Years: 6,
    },
    {
      Fixed: 36844,
      ARM: 61859,
      Years: 7,
    },
  ];

  const data = [
    {
      type: "bar",
      x: getValueByKey(iData, "Years"),
      y: getValueByKey(iData, "Fixed"),
      name: "Fixed",
      marker: {
        color: "#053d5d",
      },
      // width: iData.map((item) => 0.3),
    },
    {
      type: "bar",
      x: getValueByKey(iData, "Years"),
      y: getValueByKey(iData, "ARM"),
      name: "ARM",

      marker: {
        color: "#84329b",
      },
      // width: iData.map((item) => 0.3),
    },
  ];

  const layout = {
    barmode: "group",
    bargroupgap: 0.08,
    xaxis: {
      title: "Years",
      tickvals: [...iData.map((item, index) => index), iData.length], // Explicitly set tick values
      ticktext: [...iData.map((item, index) => index), iData.length],
    },
    yaxis: {
      automargin: true,
      title: { text: "$", standoff: 10 },
      tickformat: ",.0f",
    },
    width: 360,
    margin: {
      l: 10,
      r: 0,
      b: 10,
      t: 10,
      pad: 4,
    },
    // legend: { },
    legend: {
      x: -0.2,
      y: -0.09,
      orientation: "h",
    },
  };

  const config = {
    // displayModeBar: false,
  };

  return (
    <>
      <div>
        <div
          style={{
            alignSelf: "center",
            fontSize: 18,
            textAlign: "center",
            fontWeight: "bold",
            borderTop: "1px solid #999",
            paddingTop: 15,
            marginBottom: 15,
          }}
        >
          ARM vs Fixed Calculator
        </div>
        <div style={{ margin: 10 }}>
          <InputBox
            validate={false}
            label="Loan Amount"
            placeholder={"Loan Amount"}
            onBlur={() => {}}
            onChangeText={(text) => {}}
            value={""?.toString()}
          />
          <InputBox
            validate={false}
            label="Term (Years)"
            placeholder={"Term"}
            onBlur={() => {}}
            onChangeText={(text) => {}}
            value={""?.toString()}
          />
          <InputBox
            validate={false}
            label="Annual Fixed Interest Rate (%)"
            placeholder={"Interest Rate"}
            onBlur={() => {}}
            onChangeText={(text) => {}}
            value={""?.toString()}
          />
          <Dropdown
            isValid={false}
            label="ARM Term"
            options={[
              { value: 1, label: "5" },
              { value: 2, label: "7" },
              { value: 3, label: "9" },
              { value: 3, label: "10" },
            ]}
            value={null}
            onSelect={(item_) => {}}
            isMap={false}
          />
          <InputBox
            validate={false}
            label="Annual Adjustable Interest Rate (%)"
            placeholder={"Interest Rate"}
            onBlur={() => {}}
            onChangeText={(text) => {}}
            value={""?.toString()}
          />
          <Button title="Calculate" onClick={() => {}} />
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: 80,
        }}
      >
        <div style={{ width: 360 }}>
          <Plot data={data} layout={layout} config={config} />
        </div>
      </div>
    </>
  );
};

export default ARMvsFixed;
