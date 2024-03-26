import React, { useRef, useState } from "react";
import { InputBox } from "../../CommonFunctions/Accessories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  formatCurrency,
  formatPercentage,
} from "../../CommonFunctions/GeneralCalculations";

const RowDrag = ({ item, index, onValueChange, onDelete, isMobile }) => {
  return (
    <div
      style={{
        flexDirection: "row",
        display: "flex",
        border: "1px solid #c1d0ce",
        justifyContent: "space-between",
        backgroundColor: "#f4f8f8",
        padding: 20,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignSelf: "center",
          transform: "rotate(90deg)",
          fontSize: 20,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <span style={{ lineHeight: 0 }}>...</span>
        <span style={{ lineHeight: 0.7 }}>...</span>
      </div>
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",
          gap: 20,
        }}
      >
        <InputBox
          inputBoxLabel={{ backgroundColor: "#f4f8f8", fontSize: 13 }}
          style={{
            margin: 0,
            width: isMobile ? "85%" : "20%",
            minWidth: 220,
          }}
          type="text"
          inputBoxStyle={{ fontFamily: "Inter", height: 30 }}
          validate={false}
          label="Debt name"
          placeholder={"Debt name"}
          onBlur={() => {}}
          onChangeText={({ target }) => {
            const { value } = target;
            onValueChange({ value, name: "name", index });
          }}
          value={item["name"]?.toString()}
        />
        <InputBox
          inputBoxLabel={{ backgroundColor: "#f4f8f8", fontSize: 13 }}
          inputBoxStyle={{ fontFamily: "Inter", height: 30 }}
          style={{
            margin: 0,
            width: isMobile ? "85%" : "20%",
            minWidth: 220,
          }}
          type="text"
          validate={false}
          symbol={
            <span
              style={{
                position: "absolute",
                left: 15,
                fontFamily: "inter",
                fontSize: 14,
              }}
            >
              $
            </span>
          }
          label="Debt balance"
          placeholder={"Debt balance"}
          onBlur={() => {}}
          onChangeText={({ target }) => {
            const { value } = target;
            onValueChange({ value, name: "balance", index });
          }}
          value={formatCurrency(item["balance"] || 0).replace("$", "")}
        />
        <InputBox
          inputBoxLabel={{ backgroundColor: "#f4f8f8", fontSize: 13 }}
          inputBoxStyle={{ fontFamily: "Inter", height: 30 }}
          style={{
            margin: 0,
            width: isMobile ? "85%" : "20%",
            minWidth: 220,
          }}
          type="text"
          validate={false}
          label="Interest rate"
          symbol={
            <span
              style={{
                position: "absolute",
                right: 15,
                fontFamily: "inter",
                fontSize: 14,
              }}
            >
              %
            </span>
          }
          symbolPosition="right"
          placeholder={"Interest rate"}
          onBlur={() => {}}
          onChangeText={({ target }) => {
            const { value } = target;
            onValueChange({ value, name: "rate", index });
          }}
          value={formatPercentage(item["rate"] || 0, 3, true).replace("%", "")}
        />
        <InputBox
          inputBoxLabel={{ backgroundColor: "#f4f8f8", fontSize: 13 }}
          inputBoxStyle={{ fontFamily: "Inter", height: 30 }}
          style={{
            margin: 0,
            width: isMobile ? "85%" : "20%",
            fontFamily: "Inter",
            minWidth: 220,
          }}
          type="text"
          validate={false}
          label="Min monthly payment (Optional)"
          placeholder={"Monthly payment"}
          symbol={
            <span
              style={{
                position: "absolute",
                left: 15,
                fontFamily: "inter",
                fontSize: 14,
              }}
            >
              $
            </span>
          }
          onBlur={() => {}}
          onChangeText={({ target }) => {
            const { value } = target;
            onValueChange({ value, name: "monthlyPayment", index });
          }}
          value={formatCurrency(item["monthlyPayment"] || 0).replace("$", "")}
        />
      </div>
      <div
        style={{ alignSelf: "center", cursor: "pointer" }}
        onClick={() => {
          onDelete({ index });
        }}
      >
        <FontAwesomeIcon icon={faTrash} size="lg" />
      </div>
    </div>
  );
};

const RowSortTable = (props) => {
  const {
    itemList,
    setItemList,
    onValueChange = () => {},
    onDelete = () => {},
    isMobile,
    screenWidth,
  } = props;

  const dragItem = useRef(),
    dragOverItem = useRef(),
    dragWrapper = useRef(),
    [draggedIndex, setDraggedIndex] = useState(null);

  const dragStart = (e, position) => {
    setDraggedIndex(position);
    dragItem.current = position;
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
    setDraggedIndex(position);
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }
    const newItemList = [...itemList];
    const draggedItem = newItemList[draggedIndex];
    newItemList.splice(draggedIndex, 1);
    newItemList.splice(index, 0, draggedItem);

    setItemList(newItemList);
    setDraggedIndex(index);
  };
  const dragEnd = (e) => {
    setDraggedIndex(null);
  };

  return (
    <div ref={dragWrapper}>
      {itemList.map((item, index) => (
        <div
          onDragStart={(e) => dragStart(e, index)}
          onDragEnter={(e) => dragEnter(e, index)}
          onDragEnd={dragEnd}
          onDragOver={(e) => handleDragOver(index, e)}
          key={index}
          className={`draggedRow ${
            draggedIndex === index ? "dragged" : "dragElement"
          }`}
          draggable={draggedIndex !== index}
        >
          <RowDrag
            isMobile={isMobile}
            item={item}
            index={index}
            onValueChange={onValueChange}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default RowSortTable;
