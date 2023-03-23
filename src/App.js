import "./App.css";
import React, { useState } from "react";
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

function App() {
  const [depo, setDepo] = useState("");

  setTimeout(() => {
    data = new Array(50).fill("a");
    setDepo("ciao");
  }, 5000);

  return (
    <div
      style={{ display: "flex", placeItems: "center", position: "relative" }}
    >
      <div
        style={{ height: "800px", width: "800px", border: "1px solid black" }}
      >
        <RecycleList
          createListItem={(data, key) => (
            <SimpleListItem data={data} key={key} />
          )}
          itemHeight={50}
          getData={async (index, chunkSize) => {
            await new Promise((r) => setTimeout(r, 2000));
            if (index > --data.length) return [];
            return data.slice(index, index + chunkSize);
          }}
          deps={[depo]}
        />
      </div>
    </div>
  );
}

export default App;
