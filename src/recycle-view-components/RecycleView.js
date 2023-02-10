import React, { useEffect, useRef, useState } from 'react'

//TODO: remove
const testData = [
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
    "ciao",
]

export const RecycleView = ({ListItem, itemHeight, getData}) => {
    const listContainer = useRef(null)
    let [items, setItems] = useState([])
    const dataArray = testData;

    //runs once after render
    useEffect(()=>{
        const ratio = parseInt(getRatio())
         initArray(ratio)
    }, [
        listContainer.current !== null ?
        listContainer.current.clientHeight : null
    ])

    const  initArray = (ratio)=>{
        setItems(
            Array.from(Array(ratio),
            ()=>{return {
                index: -1,
                value: ""
            }})
            )
        //javascript fa cose senza senso
        //sparatemi
        if(items.length < 1) return
        items.forEach((item, index)=>{
            if(!dataArray[index]) return
            item.index = index
            item.value = dataArray[index]
        })
        console.log(items)
    }

    const updateData = ()=>{
        
    }

    const getRatio = ()=>{
        return listContainer.current.clientHeight/itemHeight+3;
    }

  return (
    <div ref={listContainer} style={{
        position: "absolute",
        left: "0",
        top: "0",
        display: "flex",
         flexDirection: "column",
         overflowY: "scroll",
          maxHeight: "100%",
           minWidth: "100%"}}>
            {items.map((value, index)=>{
                return <ListItem key={index} />
            })}
        </div>
  )
}
