import React, { useRef, useState } from "react";
import { InputBox } from "../../CommonFunctions/Accessories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  formatCurrency,
  formatPercentage,
} from "../../CommonFunctions/GeneralCalculations";

const RowDrag = ({ item, index, onValueChange, onDelete }) => {
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

      <InputBox
        style={{ margin: 0, minWidth: "20%" }}
        type="text"
        inputBoxStyle={{ fontFamily: "Inter" }}
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
        style={{ margin: 0, minWidth: "20%" }}
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
        style={{ margin: 0, minWidth: "20%" }}
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
        style={{ margin: 0, minWidth: "20%", fontFamily: "Inter" }}
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
      <div
        style={{ alignSelf: "center", cursor: "pointer" }}
        onClick={() => {
          onDelete({ index });
        }}
      >
        <FontAwesomeIcon icon={faTrash} color="#000000" size="lg" />
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

  const handleDragOver = (index) => {
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
    // const { current: index } = dragItem;
    // if (index) {
    //   const copyListItems = [...itemList];
    //   const dragItemContent = copyListItems[index];
    //   copyListItems.splice(index, 1);
    //   copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    //   dragItem.current = null;
    //   dragOverItem.current = null;
    //   setItemList(copyListItems);
    setDraggedIndex(null);
    // }
  };

  return (
    <div ref={dragWrapper}>
      {itemList.map((item, index) => (
        <div
          onDragStart={(e) => dragStart(e, index)}
          onDragEnter={(e) => dragEnter(e, index)}
          onDragEnd={dragEnd}
          onDragOver={() => handleDragOver(index)}
          key={index}
          className={`draggedRow ${
            draggedIndex === index ? "dragged" : "dragElement"
          }`}
          draggable
        >
          <RowDrag
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
