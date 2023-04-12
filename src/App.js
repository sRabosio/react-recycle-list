import "./App.css";
import React, { useCallback, useEffect, useState } from "react";
import { RecycleList } from "./recycle-view-components/RecycleList";
import { SimpleListItem } from "./recycle-view-components/SimpleListItem";
import Asd from "./recycle-view-components/Asd";
import { List } from "./List";

function App() {
  const [depo, setDepo] = useState("list");
  const [s, setS] = useState([]);

  const lookup = {
    list: List,
    asd: Asd,
  };
  return (
    <>
      {/* <button
        onClick={() => {
          setDepo("asd");
        }}
      >
        switch
      </button>
      {lookup[depo]()} */}
      <List />
    </>
  );
}

export default App;