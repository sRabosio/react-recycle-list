import './App.css';
import React from 'react';
import { RecycleList } from './recycle-view-components/RecycleList';
import { SimpleListItem } from './recycle-view-components/SimpleListItem';

const data = [
  "pollo",
  "pello",
  "pille",
  "lello",
  "lalle",
  "lello"
]


function App() {
  return (
    <RecycleList
      
      createListItem = {(data, key)=><SimpleListItem data={data} key={key}/>}
      itemHeight = {50}
      getData = {(index, chunkSize)=>{
        console.log("fetching data");
        if(index > data.length-1) return []
        console.log("next data", {index, chunkSize, data});
        return data.slice(index, index+chunkSize)
      }}
    />
  );
}

export default App;
