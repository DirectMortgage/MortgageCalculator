import React, { useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import {
  formatCurrency,
  formatPercentage,
} from "../../CommonFunctions/GeneralCalculations";
import { useScrollIndicator } from "../../CommonFunctions/Accessories";
import { cleanValue } from "../../CommonFunctions/CalcLibrary";
import { useDebounce } from "../../CommonFunctions/CommonFunctions";

const homeBase64 =
  "data:image/png;base64,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";

const handleChartStyle = (index) => {
    document.querySelectorAll(".js-fill").forEach((e, i) => {
      e.style.fill = `url(#${i === 0 ? "negativeArea" : "positiveArea"})`;
    });
    const annotationElements = Array.from(
      document.querySelectorAll(".infolayer .annotation")
    );
    annotationElements.pop();
    annotationElements.forEach((e, i) => {
      const y = i >= index ? 15 : -15;
      e.style.transform = `translate(0px, ${y}px)`;
    });
  },
  isFloat = (n) => Number(n) === n && n % 1 !== 0,
  insertZeroAfterLastNegative = (arr) => {
    let lastNegativeIndex = -1;

    arr.forEach((value, index) => {
      if (value < 0) lastNegativeIndex = index;
    });

    if (lastNegativeIndex !== -1) {
      arr.splice(lastNegativeIndex + 1, 0, 0);
    }

    return arr;
  };

const ChartComponent = ({
  isMobile,
  isApp,
  chartData = [],
  bidExceedMonths = 0,
  year = 5,
}) => {
  let yValues = [],
    xValues = [],
    percentChangeArray = [],
    appreciationArray = [];

  let showIndex =
    year === 7
      ? [0, 2, 4, 6, 7]
      : year === 8
      ? [0, 2, 4, 6, 8]
      : year === 9
      ? [0, 2, 4, 6, 8, 9]
      : year === 10
      ? [0, 2, 4, 6, 8, 10]
      : year === 11
      ? [0, 2, 4, 6, 8, 10, 11]
      : year === 12
      ? [0, 2, 4, 6, 8, 10, 12]
      : year === 13
      ? [0, 2, 4, 6, 8, 10, 12, 13]
      : year === 14
      ? [0, 2, 4, 6, 8, 10, 12, 14]
      : year === 15
      ? [0, 3, 6, 9, 12, 15]
      : [0, 1, 2, 3, 4, 5, 6, 7, 8].slice(0, year + 1);

  chartData
    .slice(0, year + 1)
    .forEach(
      ({ year, percentChangeFormatted, price, value, valueFormatted }) => {
        yValues.push(value);
        xValues.push(year);
        percentChangeArray.push(percentChangeFormatted);
        appreciationArray.push({ price, value: valueFormatted });
      }
    );

  xValues = xValues
    .filter((_, index) => showIndex.includes(index))
    .map((value) => Number(value));

  yValues = yValues
    .filter((_, index) => showIndex.includes(index))
    .map((value) => Number(value));

  percentChangeArray = percentChangeArray.filter((_, index) =>
    showIndex.includes(index)
  );

  appreciationArray = appreciationArray.filter((_, index) =>
    showIndex.includes(index)
  );

  yValues = insertZeroAfterLastNegative(yValues);

  const zeroCrossingYear = bidExceedMonths / 12,
    index = yValues.indexOf(0);

  xValues.splice(index, 0, zeroCrossingYear);
  percentChangeArray.splice(index, 0, 0);
  appreciationArray.splice(index, 0, {});

  const negativeY = yValues.map((y) => (y <= 0 ? y : null)),
    positiveY = yValues.map((y) => (y >= 0 ? y : null)),
    data = [
      {
        type: "scatter",
        mode: "lines+markers",
        x: xValues,
        y: negativeY,

        marker: {
          size: isMobile ? 25 : 30,
          color: "#d22537",
          symbol: "circle",
          opacity: xValues.map((_, index) => (yValues[index] == 0 ? 0 : 1)),
        },
        hoverinfo: "none",
        line: {
          shape: "spline",
          color: "#d72637",
        },
        fill: "tozeroy",
        fillcolor: "rgba(215, 38, 55, 0.3)",
      },
      {
        type: "scatter",
        mode: "lines+markers",
        x: xValues,
        y: positiveY,
        fill: "tozeroy",
        marker: {
          size: isMobile ? 25 : 30,
          color: "#44bab4",
          symbol: "circle",
          opacity: xValues.map((_, index) => (yValues[index] == 0 ? 0 : 1)),
        },
        hoverinfo: "none",
        line: {
          shape: "spline",
          color: "#44bab4",
        },
        fillcolor: "rgba(68, 186, 180, 0.3)",
      },
      {
        type: "scatter",
        mode: "lines",
        x: [-0.7, year],
        y: [0, 0],
        line: {
          color: "#0d2121",
          width: 1,
          dash: "dot",
        },
      },
    ],
    images = xValues.map((x, index) =>
      yValues[index] === 0
        ? null
        : {
            source: homeBase64,
            xref: "x",
            yref: "y",
            x: x,
            y: yValues[index],
            // sizex: 0.15,
            // sizey:
            //   20 ||
            //   // sizeyArray[showIndexLength - 2] ||
            //   Math.max(...yValues.map((e) => Math.abs(e))),
            xanchor: "center",
            yanchor: "middle",
            layer: "above",
          }
    ),
    layout = {
      xaxis: {
        title: "<b>Years</b>",
        range: [-1, Math.max(...xValues) + 1],
        showgrid: false,
        zeroline: false,
        tickvals: xValues,
        ticktext: xValues.map((e) => (isFloat(e) ? "" : e)),
        tickangle: 0,
      },
      yaxis: {
        title: "",
        tickformat: ",.0s",
        tickprefix: "$",
        range: [Math.min(...yValues) - 5500, Math.max(...yValues) + 5500],
        zeroline: false,
        automargin: true,
        tick0: 0,
      },
      shapes: [
        {
          type: "line",
          x0: zeroCrossingYear,
          x1: zeroCrossingYear,
          y0: -100000000,
          y1: 100000000,
          line: {
            color: "#0d2121",
            width: 1,
            dash: "dot",
          },
        },
      ],
      annotations: [
        ...yValues.map((val, i) => {
          const { price, value } = appreciationArray[i],
            color = val > 0 ? "#216c2a" : "#d22537";
          return val == 0
            ? null
            : {
                x: xValues[i],
                y: yValues[i],
                text: `<b style="color:black">${price}</b><br><b style="color:${color}">${value}</b>`,
                xanchor: "center",
                yanchor: "bottom",
                showarrow: true,
                ax: 0,
                ay: -6.5,
                bgcolor: "white",
                arrowcolor: "#c1d0ce",
                font: {
                  size: 13,
                },
                borderpad: 5,
                bordercolor: "#c1d0ce",
              };
        }),
        ...yValues.map((val, i) => {
          const color = val > 0 ? "#216c2a" : "#d22537";
          return val == 0
            ? null
            : {
                x: xValues[i],
                y: yValues[i],
                text: `<b style="color:${color}">${percentChangeArray[i]}</b>`,
                xanchor: "center",
                yanchor: "top",
                showarrow: true,
                ax: 0,
                ay: 6.5,
                bgcolor: "white",
                arrowcolor: "#c1d0ce",
                font: {
                  size: 13,
                },
                borderpad: 5,
                bordercolor: "#c1d0ce",
              };
        }),
        {
          x: zeroCrossingYear,
          y: Math.max(...yValues.map((e) => Math.abs(e))),
          text: `<b>${(zeroCrossingYear * 12).toFixed(
            1
          )} Mos</b><br><b>BREAK-EVEN</b>`,
          xanchor: "center",
          yanchor: "bottom",
          showarrow: false,
          ax: 0,
          ay: -6,
          bgcolor: "#113a3f",
          arrowcolor: "#c1d0ce",
          font: {
            size: 13,
            color: "#fff",
          },
          borderpad: 8,
          bordercolor: "#c1d0ce",
        },
      ],
      images: images,
      showlegend: false,
      staticPlot: true,
      dragmode: false,
      margin: { t: 70, b: 70, l: 40, r: 0 },
    };
  if (isMobile) {
    layout["width"] = "unset";
  }

  useScrollIndicator(".netGainChart", ".netGainChartScrollIndicator");
  return (
    <div
      style={{
        fontSize: 30,
        textAlign: "center",
        margin: "0 0 30px 0",
        position: "relative",
        marginTop: 50,
      }}
    >
      <h5 className="chart-title">
        Cumulative Gain / Custom Year Over Year Appreciation
      </h5>
      <Plot
        onUpdate={() => handleChartStyle(showIndex.length)}
        className="netGainChart"
        style={{
          width: "100%",
          overflowX: "auto",
        }}
        data={data}
        layout={layout}
        config={{ displayModeBar: false, doubleClick: false }}
      />
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="negativeArea" x1="0%" x2="0%" y1="0%" y2="40%">
            <stop offset="0%" stopColor="#fffdfd" />
            <stop offset="100%" stopColor="#d22537" />
          </linearGradient>
        </defs>
        <defs>
          <linearGradient id="positiveArea" x1="0%" x2="0%" y1="100%" y2="60%">
            <stop offset="0%" stopColor="#fffdfd" />
            <stop offset="100%" stopColor="#44bab4" />
          </linearGradient>
        </defs>
      </svg>
      {isMobile && isApp && (
        <div
          className="scrollIndicatorWrapper"
          style={{ backgroundColor: "#f4f8f8" }}
        >
          <div className="netGainChartScrollIndicator scrollIndicator"></div>
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
