import React, { Component, useEffect, useRef, useState } from "react";

const itemListObj = {
  items: [],
};

/**
 * @callback getData
 * @param {number} dataIndex - current position in the data array
 * @param {number} chunkSize - amount of item requested
 * @returns {any[]} array of new data to append to the data array
 * **/

/**
 * @callback createListItem
 * @param {object} data - data given by the list to be passed in the props of the list item
 * @param {number} key
 * @return {Component} react component
 */

/**
 * object that manages the data of the list
 */
const dataObj = {
  getData: () => {
    return [];
  },
  dataIndex: 0,
  chunkSize: null,
  dataArray: [],
  getPrevData: function () {
    const prevIndex = this.dataIndex - itemListObj.items.length - 1;
    if (prevIndex < 0) return null;
    const result = this.dataArray[prevIndex];
    this.dataIndex--;
    return result;
  },
  getNextData: function () {
    if (this.dataIndex > this.dataArray.length - 5)
      this.dataArray.push(
        ...this.getData(this.dataArray.length === 0 ? 0 : this.dataArray.length, this.chunkSize)
        );
    if (this.dataIndex >= this.dataArray.length) return null;
    const result = this.dataArray[this.dataIndex];
    this.dataIndex++
    return result;
  },
};

/**
 * Infinite list of items that uses an n amount of components
 * to display data.
 * @param {createListItem} createListItem - components tasked with displaying data
 * @param {number} itemHeight - desired height for the list item
 * @param {getData} getData - function tasked with periodically retrieving data
 * @param {number} chunkSize - number of records to get from every call of getData
 * @param {object} listItemStyles - additional styles to be applied to the listitem wrapper
 */
export const RecycleList = ({
  createListItem,
  itemHeight,
  getData,
  chunkSize,
  listItemStyles,
  buffer
  }) => {
  const bufferSize = buffer ? buffer : 10 
  const listContainer = useRef(null);
  let [items, setItems] = useState([]);
  let [scrollTarget, setscrollTarget] = useState(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    dataObj.chunkSize = chunkSize ? chunkSize : 10;
    dataObj.getData = getData ? getData : () => [];
  }, []);

  const init = ()=>{
    dataObj.dataIndex = 0;
    itemListObj.topLevel = 0;
    const ratio = parseInt(getRatio());
    itemListObj.items = initArray(ratio);
    itemListObj.bottomLevel = listContainer.current.clientHeight;
    setItems(itemListObj.items);
  }

  //list initialization
  useEffect(() => {
    init()
  }, [
    listContainer.current !== null ? listContainer.current.clientHeight : null,
  ]);

  /**
   * initializes the array of components in the list
   * @param {number} ratio - amount of components to be created
   * @returns {object[]} array of created components
   */
  const initArray = (ratio) => {
    const newItems = Array.from(Array(ratio), () => {
      return {
        index: -1,
        data: "",
        ref: null,
        top: 0,
      };
    });

    if (newItems.length < 1) return;
    newItems.forEach((item, index, array) => {
      item.index = index;
      item.data = dataObj.getNextData();
      item.ref = React.createRef();
      item.top = array[index - 1] ? array[index - 1].top + itemHeight : 0;
      itemListObj.topLevel += itemHeight;
    });

    //adding buffer
    for(let i = 0; i < bufferSize; i++){
      newItems.unshift({
        data: dataObj.getPrevData(),
        ref: React.createRef(),
        top: newItems[0].top-itemHeight
      })
      newItems.push({
        data: dataObj.getNextData(),
        ref: React.createRef(),
        top: newItems.at(-1).top + itemHeight
      })
    }

    return newItems.filter(e=>e.data!==null || e.top<0)
  };

  const scrollDirection = (posProp) => {
    return posProp.yCenter < y ? "top" : "bottom";
  };


  //TODO: recalculate heights
  const goDown = (posProp) => {
    return (
      posProp.yTop >
        posProp.highestItem.offsetTop + posProp.highestItem.clientHeight &&
      scrollDirection(posProp) === "bottom"
    );
  };
  const goUp = (posProp) => {
    return (
      posProp.yBottom <
        posProp.lowestItem.offsetTop - posProp.lowestItem.clientHeight &&
      scrollDirection(posProp) === "top"
    );
  };

  const getPosProp = (itemArray) => {
    if (!scrollTarget) return null;
    return {
      yTop: scrollTarget.scrollTop,
      yBottom: scrollTarget.scrollTop + listContainer.current.clientHeight,
      yCenter: scrollTarget.scrollTop + listContainer.current.clientHeight / 2,
      lowestItem: itemArray.at(-1).ref.current,
      highestItem: itemArray.at(0).ref.current,
    };
  };

  //moving components
  const onScroll = () => {
    if (!scrollTarget) return;
    console.log("number of items: ", items.length);
    //highest & lowest pixel
    const posProp = getPosProp(items);
    if (goDown(posProp)) pushdown(posProp, [...items]);
    else if (goUp(posProp)) pushup(posProp, [...items]);
    setY(posProp.yCenter);
    setscrollTarget(null);
  };

  //onResize
  useEffect(() => {
    if (!listContainer.current) return; // wait for the elementRef to be available
    const resizeObserver = new ResizeObserver(() => {
      init()
    });
    resizeObserver.observe(listContainer.current);
    return () => resizeObserver.disconnect(); // clean up 
  }, []);

  useEffect(onScroll, [scrollTarget]);

  /**
   * moves the first item of the list to the bottom
   */
  const pushdown = (posProp, newItemArray) => {
    let newItem = null;
    const data = dataObj.getNextData();
    if (!data) return;
    newItem = newItemArray.shift();
    newItem.data = data;
    newItem.top = newItemArray.at(-1).top + itemHeight;
    newItem.ref.current.style.top = newItem.top;
    newItemArray.push(newItem);

    posProp = getPosProp(newItemArray);

    setItems(newItemArray);
    if (goDown(posProp)) pushdown(posProp, [...newItemArray]);
  };

  /**
   * moves the last item of the list to the top
   */
  const pushup = (posProp, newItemArray) => {
    let newItem = null;
    const data = dataObj.getPrevData();
    if (!data) return;
    newItem = newItemArray.pop();
    newItem.data = data;
    newItem.top = newItemArray.at(0).top - itemHeight;
    newItem.ref.current.style.top = newItem.top;
    newItemArray.unshift(newItem);

    posProp = getPosProp(newItemArray);

    setItems(newItemArray);
    if (goUp(posProp)) pushup(posProp, [...newItemArray]);
  };

  const getRatio = () => {
    return listContainer.current.clientHeight / itemHeight + 3;
  };

  return (
    <div
      ref={listContainer}
      style={{
        position: "absolute",
        left: "0",
        top: "0",
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
        height: "100%",
        minWidth: "100%",
      }}
      onScroll={(e) => {
        if (scrollTarget) return;
        setscrollTarget(e.currentTarget);
      }}
    >
      {items.map((value, index) => {
        //map fa una copia dell'array quindi per settare ref devo farmi dare il puntatore direttamente dall'items originale
        const ref = items[index].ref;
        const result = (
          <div
            style={{
              height: itemHeight,
              position: "absolute",
              left: "0",
              width: "100%",
              top: value.top,
              ...listItemStyles
            }}
            key={index}
            ref={ref}
          >
            {createListItem(value.data, index)}
          </div>
        );
        itemListObj.topLevel += itemHeight;
        return result;
      })}
    </div>
  );
};
