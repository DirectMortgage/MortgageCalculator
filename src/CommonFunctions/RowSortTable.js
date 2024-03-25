import React, { useRef, useState } from "react";
// import "./styles.css";
import { InputBox } from "./Accessories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatCurrency, formatPercentage } from "./GeneralCalculations";

// const RowSortTable_ = ({ params }) => {
//   const [itemList, setItemList] = useState([
//     { name: "test", balance: "123", rate: 6, monthlyPayment: 456 },
//     { name: "test", balance: "123", rate: 6, monthlyPayment: 456 },
//   ]);

//   const handleDrop = (droppedItem) => {
//     if (!droppedItem.destination) return;
//     var updatedList = [...itemList];
//     const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
//     updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
//     setItemList(updatedList);
//   };

//   return (
//     <div className="">
//       <DragDropContext onDragEnd={handleDrop}>
//         <Droppable droppableId="list-container">
//           {(provided) => (
//             <div
//               className="drag-container"
//               {...provided.droppableProps}
//               ref={provided.innerRef}
//             >
//               {itemList.map((item, index) => (
//                 <Draggable key={index} draggableId={item} index={index}>
//                   {(provided) => (
//                     <div
//                       className="drag-child"
//                       ref={provided.innerRef}
//                       {...provided.dragHandleProps}
//                       {...provided.draggableProps}
//                     >
//                       <RowDrag item={item} />
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>
//     </div>
//   );
// };
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
        style={{ alignSelf: "center" }}
        onClick={() => {
          onDelete({ index });
        }}
      >
        <FontAwesomeIcon icon={faTrash} color="#000000" size="lg" />
      </div>
    </div>
  );
};
// const [itemList, setItemList] = useState([
//   { name: "Debt 1", balance: 0, rate: 0, monthlyPayment: 0 },
//   { name: "Debt 2", balance: 0, rate: 0, monthlyPayment: 0 },
// ]);

const RowSortTable = (props) => {
  const {
    itemList,
    setItemList,
    onValueChange = () => {},
    onDelete = () => {},
  } = props;

  const dragItem = useRef();
  const dragOverItem = useRef();
  const dragStart = (e, position) => {
    dragItem.current = position;
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
    console.log(e.target.innerHTML);
  };

  const drop = (e) => {
    const copyListItems = [...itemList];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setItemList(copyListItems);
  };

  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
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

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div>
      {itemList.map((item, index) => (
        <div
          onDragStart={(e) => dragStart(e, index)}
          onDragEnter={(e) => dragEnter(e, index)}
          onDragEnd={drop}
          key={index}
          className={draggedIndex === index ? "dragged" : ""}
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
