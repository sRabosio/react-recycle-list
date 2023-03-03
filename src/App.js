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
        return data
      }}
    />
  );
}

export default App;
