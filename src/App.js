import './App.css';
import React from 'react';
import { RecycleList } from './recycle-view-components/RecycleList';
import { SimpleListItem } from './recycle-view-components/SimpleListItem';


function App() {
  return (
    <RecycleList
      
      ListItem = {SimpleListItem}
      itemHeight = {50}
      getData = {(dataIndex, chunkSize)=>{
        console.log("fetching data");
        return [
          "pollo",
          "pello",
          "pille",
          "lello",
          "lalle",
          "lello"
        ]
      }}
    />
  );
}

export default App;
