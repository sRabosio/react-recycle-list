import './App.css';
import React from 'react';
import { RecycleView } from './recycle-view-components/RecycleView';
import { SimpleListItem } from './recycle-view-components/SimpleListItem';


function App() {
  return (
    <RecycleView
      
      ListItem = {SimpleListItem}
      itemHeight = {50  }
      getData = {()=>{}}
    />
  );
}

export default App;
