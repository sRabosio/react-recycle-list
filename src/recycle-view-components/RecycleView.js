import React, { useEffect, useRef, useState } from 'react'

const itemListObj = {
    dataIndex: 0,
    items: []
}

export const RecycleList = ({ListItem, itemHeight, getData}) => {
    const listContainer = useRef(null)
    let [items, setItems] = useState([])
    let dataArray = getData();    

    useEffect(()=>{
        const ratio = parseInt(getRatio())
        itemListObj.items = initArray(ratio)
        itemListObj.dataIndex = 0
        setItems(itemListObj.items)
    }, [
        listContainer.current !== null ?
        listContainer.current.clientHeight : null,
        items[0].ref.current !== null ? 
        items[0].ref.current.clientHeight : null
    ])

    const initArray = (ratio)=>{   
        const newItems = Array.from(Array(ratio),
            ()=>{return {
                index: -1,
                value: "",
                ref: null
            }})
        
        //javascript fa cose senza senso
        //sparatemi
        if(newItems.length < 1) return
        newItems.forEach((item, index)=>{
            if(!dataArray[index]) return
            item.index = index
            item.value = getNextData()
            item.ref = React.createRef()
        })
        return newItems
    }

    const onScroll = e=>{
        //highest & lowest pixel
        const yTop = e.currentTarget.scrollTop 
        const yBottom = e.currentTarget.scrollTop+listContainer.current.clientHeight
        const lowestItem = items.at(-1).ref.current
        const newItemArray = [...items]
        let newItem = null;
        let data = null;

        //TODO: full recycling

        if(yBottom < lowestItem.offsetTop+itemHeight){
            data = getNextData();
            if(!data) return
            newItem = {
                index: null,
                data: data,
                ref: React.createRef()
            }
            newItemArray.push(newItem)
            setItems(newItemArray)
        }

    }

    const getNextData = ()=>{
        const dataIndex = itemListObj.dataIndex
        const result = dataArray[dataIndex]

        if(dataIndex > dataArray.length-5) getData();
        if(dataIndex >= dataArray.length-1) return null

        itemListObj.dataIndex++;
        return result
    }

    const getRatio = ()=>{
        return (listContainer.current.clientHeight/itemHeight)+2;
    }

  return (
    <div ref={listContainer} style={{
        position: "absolute",
        left: "0",
        top: "0",
        display: "flex",
         flexDirection: "column",
         overflowY: "scroll",
          height: "100%",
           minWidth: "100%"}}
           onScroll={onScroll}>
            {items.map((value, index)=>{
                //map fa una copia dell'array quindi per settare ref devo farmi dare il puntatore direttamente dall'items originale
                const ref = items[index].ref;
                return <ListItem style={{height: itemHeight}} key={index} innerRef={ref} data={value.data}/>
                })}
        </div>
  )
}
