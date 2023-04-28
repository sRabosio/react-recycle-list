import React from "react";
import { RecycleList } from "./recycle-view-components/RecycleList";
import { SimpleListItem } from "./recycle-view-components/SimpleListItem";

let data = [
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello",
  " ",
];

export const List = () => {
  const dataCallback = (index, chunkSize) => {
    let d = [...data];
    return [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
    ];
    //await new Promise((r) => setTimeout(r, 2000));
    // if (index > d.length - 1) return [];
    // return d.slice(index, index + chunkSize);
  };

  return (
    <div
      style={{
        display: "flex",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "800px",
          width: "800px",
          border: "1px solid black",
          overflow: "hidden",
        }}
      >
        <RecycleList
          itemHeight={50}
          getData={async () => {
            return [
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "10",
              "11",
              "12",
              "13",
              "14",
              "15",
              "16",
            ];
          }}
        >
          <SimpleListItem />
        </RecycleList>
      </div>
    </div>
  );
};
