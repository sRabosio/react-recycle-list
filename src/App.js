import "./App.css";
import React, { useCallback, useEffect, useState } from "react";
import { RecycleList } from "./recycle-view-components/RecycleList";
import { SimpleListItem } from "./recycle-view-components/SimpleListItem";
import Asd from "./recycle-view-components/Asd";

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

function App() {
  const [depo, setDepo] = useState("");
  const [s, setS] = useState([]);
  const dataCallback = (index, chunkSize) => {
    console.log("s", s);
    let d = s.length > 0 ? s : data;
    //await new Promise((r) => setTimeout(r, 2000));
    if (index > d.length - 1) return [];
    return d.slice(index, index + chunkSize);
  };

  useEffect(() => {
    console.log("render");
  }, [s]);

  return (
    <>
      <button
        onClick={() =>
          setS([
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
            "b",
          ])
        }
      >
        switch
      </button>
      <div
        style={{
          display: "flex",
          placeItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "800px",
            width: "800px",
            border: "1px solid black",
          }}
        >
          <RecycleList
            createListItem={(data, key) => (
              <SimpleListItem data={data} key={key} />
            )}
            itemHeight={50}
            getData={dataCallback}
            deps={[s]}
          />
        </div>
      </div>
    </>
  );
}

export default App;