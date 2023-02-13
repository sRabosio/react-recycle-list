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
        itemListObj.topLevel = 0
        const ratio = parseInt(getRatio())
        itemListObj.items = initArray(ratio)
        itemListObj.dataIndex = 0
        itemListObj.bottomLevel = listContainer.current.clientHeight
        setItems(itemListObj.items)
    }, [
        listContainer.current !== null ?
        listContainer.current.clientHeight : null
    ])

    const initArray = (ratio)=>{
        
        const newItems = Array.from(Array(ratio),
            ()=>{return {
                index: -1,
                value: "",
                ref: null,
                top: 0
            }})
        
        //javascript fa cose senza senso
        //sparatemi
        if(newItems.length < 1) return
        newItems.forEach((item, index, array)=>{
            if(!dataArray[index]) return
            item.index = index
            item.value = getNextData()
            item.ref = React.createRef()
            item.top = array[index-1] ? array[index-1].top+itemHeight : 0
            itemListObj.topLevel += itemHeight
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

        if(yBottom > lowestItem.offsetTop-lowestItem.clientHeight*3){
            data = getNextData();
            if(!data) return
            newItem = newItemArray.shift()
            newItem.data = data
            newItem.top = newItemArray.at(-1).top + itemHeight
            newItem.ref.current.style.top = newItem.top;
            
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
        return (listContainer.current.clientHeight/itemHeight)+1;
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
                const result = <div style={{height: itemHeight, position: "absolute", left: "0", top:value.top}} ref={ref}><ListItem key={index} data={value.data}/></div>
                itemListObj.topLevel += itemHeight
                return result
                })}
        </div>
  )
}
