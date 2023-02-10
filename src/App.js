import './App.css';
import React from 'react';
import { RecycleList } from './recycle-view-components/RecycleView';
import { SimpleListItem } from './recycle-view-components/SimpleListItem';


function App() {
  return (
    <RecycleList
      
      ListItem = {SimpleListItem}
      itemHeight = {100}
      getData = {()=>{
        return new Array(200).fill("sono un pollo")
      }}
    />
  );
}

export default App;
