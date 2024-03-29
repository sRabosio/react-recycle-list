import React from "react";
import RecycleList from "./recycle-view-components/RecycleList";
import { SimpleListItem } from "./recycle-view-components/SimpleListItem";
import { SimplePlaceholder } from "./recycle-view-components/SimplePlaceholder";

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

  const toTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        placeItems: "center",
        overflow: "hidden",
        height: "100%",
        position: "relative",
      }}
    >
      <RecycleList
        itemHeight={50}
        placeholder={SimplePlaceholder}
        staticData={data}
      >
        <SimpleListItem />
      </RecycleList>
      <button
        // style={{ position: "absolute", top: "50px", right: "50px" }}
        onClick={toTop}
      >
        AAAAAAA
      </button>
    </div>
  );
};
