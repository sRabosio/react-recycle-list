import React, { useEffect, useRef, useState } from 'react'

const itemListObj = {
    items: []
}

const dataObj = {
    dataIndex: 0,
    chunkSize: 10,
    dataArray: [],
    getPrevData:function(){
        const prevIndex = this.dataIndex-itemListObj.items.length-1
        if(prevIndex < 0) return
        const result = this.dataArray[prevIndex]
        this.dataIndex--
        return result
    },
    getNextData: function(){
        if(this.dataIndex > this.dataArray.length-5) this.getData(this.dataArray);
        if(this.dataIndex >= this.dataArray.length-1) return
        const result = this.dataArray[this.dataIndex]
        this.dataIndex++;
        return result
    },
    getData: dataArray=>[]
}


const testData = new Array(200).fill("sono un pollo")

export const RecycleList = ({ListItem, itemHeight}) => {
    const listContainer = useRef(null)
    let [items, setItems] = useState([])
    const [y, setY] = useState(0)
    dataObj.dataArray = testData

    //TODO: remove

    //list initialization
    useEffect(()=>{
        dataObj.dataIndex = 0
        itemListObj.topLevel = 0
        const ratio = parseInt(getRatio())
        itemListObj.items = initArray(ratio)
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
                data: "",
                ref: null,
                top: 0
            }})
        
        //javascript fa cose senza senso
        //sparatemi
        if(newItems.length < 1) return
        newItems.forEach((item, index, array)=>{
            if(!dataObj.dataArray[index]) return
            item.index = index
            item.data = dataObj.getNextData()
            item.ref = React.createRef()
            item.top = array[index-1] ? array[index-1].top+itemHeight : 0
            itemListObj.topLevel += itemHeight
        })
        return newItems
    }

    //moving components
    const onScroll = e=>{
        console.log(items.length);
        //highest & lowest pixel
        const yTop = e.currentTarget.scrollTop 
        const yBottom = e.currentTarget.scrollTop+listContainer.current.clientHeight
        const yCenter = e.currentTarget.scrollTop+listContainer.current.clientHeight/2
        const lowestItem = items.at(-1).ref.current
        const highestItem = items.at(0).ref.current
        const newItemArray = [...items]
        const direction = yCenter<y ? "top" : "bottom"
        let newItem = null;
        let data = null;

        //TODO: full recycling

        if(yTop > highestItem.offsetTop+lowestItem.clientHeight && direction === "bottom"){
            data = dataObj.getNextData();
            if(!data) return
            newItem = newItemArray.shift()
            newItem.data = data
            newItem.top = newItemArray.at(-1).top + itemHeight
            newItem.ref.current.style.top = newItem.top;
            newItemArray.push(newItem)
            setItems(newItemArray)
        }else if(yBottom < lowestItem.offsetTop-lowestItem.clientHeight && direction === "top"){
            data = dataObj.getPrevData()
            if(!data) return
            newItem = newItemArray.pop()
            newItem.data = data
            newItem.top = newItemArray.at(0).top - itemHeight
            newItem.ref.current.style.top = newItem.top
            newItemArray.unshift(newItem)
            setItems(newItemArray)
        }
        //console.log("direction", {direction, y, yCenter});
        setY(yCenter)

    }

    

    const getRatio = ()=>{
        return (listContainer.current.clientHeight/itemHeight)+3;
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
                const result = <div style={{height: itemHeight, position: "absolute", left: "0", top:value.top}} key={index} ref={ref}>
                    <ListItem key={index} data={value.data}/>
                    </div>
                itemListObj.topLevel += itemHeight
                return result
                })}
        </div>
  )
}
