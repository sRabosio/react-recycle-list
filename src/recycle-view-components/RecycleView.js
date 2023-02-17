import React, { useEffect, useRef, useState } from 'react'

const itemListObj = {
    items: []
}

/**
 * @callback getData
 * @param {number} dataIndex - current position in the data array
 * @param {number} chunkSize - amount of item requested
 * @returns {any[]} array of new data to append to the data array
 */


/**
 * object that manages the data of the list
 */
const dataObj = {
    getData: ()=>{return []},
    dataIndex: 0,
    chunkSize: null,
    dataArray: [],
    getPrevData:function(){
        const prevIndex = this.dataIndex-itemListObj.items.length-1
        if(prevIndex < 0) return null
        const result = this.dataArray[prevIndex]
        this.dataIndex--
        return result
    },
    getNextData: function(){
        if(this.dataIndex > this.dataArray.length-5) this.dataArray.push(...this.getData(this.dataIndex, this.chunkSize));
        if(this.dataIndex >= this.dataArray.length-1) return null
        const result = this.dataArray[this.dataIndex]
        this.dataIndex++;
        return result
    },
    init: function(chunkSize, getData){
        this.chunkSize = chunkSize ? chunkSize : 10
        this.getData = getData ? getData : ()=>[]
    }
}


/**
 * Infinite list of items that uses an n amount of components
 * to display data.
 * @param {Component} ListItem - components tasked with displaying data 
 * @param {number} itemHeight - desired height for the list item
 * @param {getData} getData - function tasked with periodically retrieving data
 * @param {number} chunkSize - number of items to get from every call of getData 
 */
export const RecycleList = ({ListItem, itemHeight, getData, chunkSize}) => {
    const listContainer = useRef(null)
    let [items, setItems] = useState([])
    let [scrollTarget, setscrollTarget] = useState(null)
    const [y, setY] = useState(0)
    dataObj.init(chunkSize, getData)

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

    /**
     * initializes the array of components in the list
     * @param {number} ratio - amount of components to be created 
     * @returns {Component[]} array of created components
     */
    const initArray = (ratio)=>{
        
        const newItems = Array.from(Array(ratio),
            ()=>{return {
                index: -1,
                data: "",
                ref: null,
                top: 0
            }})

        if(newItems.length < 1) return
        newItems.forEach((item, index, array)=>{
            item.index = index
            item.data = dataObj.getNextData()
            item.ref = React.createRef()
            item.top = array[index-1] ? array[index-1].top+itemHeight : 0
            itemListObj.topLevel += itemHeight
        })
        return newItems
    }

    const scrollDirection = posProp=>{
        return posProp.yCenter<y ? "top" : "bottom"
    }
    const goDown = posProp=>{
        return posProp.yTop > posProp.highestItem.offsetTop+posProp.highestItem.clientHeight && scrollDirection(posProp) === "bottom"
    }
    const goUp = posProp=>{
        return posProp.yBottom < posProp.lowestItem.offsetTop-posProp.lowestItem.clientHeight && scrollDirection(posProp) === "top"
    }

    const getPosProp = itemArray=>{
        if(!scrollTarget) return null
        return {
            yTop: scrollTarget.scrollTop,
            yBottom: scrollTarget.scrollTop+listContainer.current.clientHeight,
            yCenter: scrollTarget.scrollTop+listContainer.current.clientHeight/2,
            lowestItem: itemArray.at(-1).ref.current,
            highestItem: itemArray.at(0).ref.current,
        }
    }

    
    //moving components
    const onScroll = ()=>{
        if(!scrollTarget) return
        console.log("number of items: ",items.length);
        //highest & lowest pixel
        const posProp = getPosProp(items)
        if(goDown(posProp))
            pushdown(posProp, [...items])
        else if(goUp(posProp))
            pushup(posProp, [...items])
        setY(posProp.yCenter)
        setscrollTarget(null)
    }
    
    useEffect(onScroll, [scrollTarget])
    
    
    /**
     * moves the first item of the list to the bottom
     */
    const pushdown = (posProp, newItemArray)=>{
        let newItem = null;
        const data = dataObj.getNextData();
        if(!data) return
        newItem = newItemArray.shift()
        newItem.data = data
        newItem.top = newItemArray.at(-1).top + itemHeight
        newItem.ref.current.style.top = newItem.top;
        newItemArray.push(newItem)
        
        posProp = getPosProp(newItemArray)

        setItems(newItemArray)
        if(goDown(posProp)) pushdown(posProp, [...newItemArray])
    }

    /**
     * moves the last item of the list to the top
     */
    const pushup = (posProp, newItemArray)=>{
        let newItem = null;
        const data = dataObj.getPrevData()
        if(!data) return
        newItem = newItemArray.pop()
        newItem.data = data
        newItem.top = newItemArray.at(0).top - itemHeight
        newItem.ref.current.style.top = newItem.top
        newItemArray.unshift(newItem)

        posProp = getPosProp(newItemArray)


        setItems(newItemArray)
        if(goUp(posProp)) pushup(posProp, [...newItemArray])
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
           onScroll={e=>{
            if(scrollTarget) return
            setscrollTarget(e.currentTarget)
           }}>
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
