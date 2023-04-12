/* eslint-disable */
import React, { Component, useEffect, useRef, useState } from "react";


const itemListObj = {
  items: [],
};

/**
 * @callback getData
 * @param {number} dataIndex - current position in the data array
 * @param {number} chunkSize - amount of item requested
 * @returns {Promise<any[]>} array of new data to append to the data array
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



/**
 * Infinite list of items that uses an n amount of components
 * to display data.
 * @param {createListItem} createListItem - components tasked with displaying data
 * @param {number} itemHeight - desired height for the list item
 * @param {getData} getData - asynchronous function tasked with periodically retrieving data
 * @param {number} chunkSize - number of records to get from every call of getData
 * @param {object} listItemStyles - additional styles to be applied to the listitem wrapper
 * @param {number} bufferSize - size of the buffer of the list. 10 for default.
 * @param {array<any>} deps - dependencies to trigger rerender
 */
export const RecycleList = ({
  createListItem,
  itemHeight,
  getData,
  chunkSize,
  listItemStyles,
  buffer,
  deps,
}) => {

  const createDataObj = () => {
    return {
      getData: async () => {
        return [];
      },
      dataIndex: 0,
      chunkSize: null,
      dataArray: [],
      buffer: 0,
      getPrevData: function () {
        const prevIndex = this.dataIndex - itemListObj.items.length + this.buffer;
        if (prevIndex < 0) return null;
        const result = this.dataArray[prevIndex];
        this.dataIndex--;
        return result;
      },
      getNextData: async function () {
        let newData;
        if (this.dataIndex > this.dataArray.length - 5) {
          newData = await this.getData(
            this.dataArray.length === 0 ? 0 : this.dataArray.length,
            this.chunkSize
          );
          this.dataArray.push(...newData);
        }
        if (this.dataIndex >= this.dataArray.length) return null;
        const result = this.dataArray[this.dataIndex];
        this.dataIndex++;
        return result;
      },
      reset: function () {
        this.dataArray = [];
        this.chunkSize = null;
        this.dataIndex = 0;
      },
    };
  };

  if (buffer !== 0 && !buffer) buffer = 10;
  if (!deps) deps = [];
  const listContainer = useRef(null);
  let [items, setItems] = useState([]);
  let [scrollTarget, setscrollTarget] = useState(null);
  const [y, setY] = useState(0);
  const dataObjRef = useRef(createDataObj());
  const dataObj = dataObjRef.current;
  const [scrolling, setScrolling] = useState(false);

  async function init() {
    dataObj.chunkSize = dataObj.chunkSize = chunkSize ? chunkSize : 10;
    dataObj.getData = getData ? getData : () => [];
    dataObj.dataArray = [];
    dataObj.dataIndex = 0;
    dataObj.buffer = buffer;
    itemListObj.topLevel = 0;
    const ratio = parseInt(getRatio());
    itemListObj.items = await initArray(ratio);
    itemListObj.bottomLevel = listContainer.current?.clientHeight;
    setItems([...itemListObj.items]);
  }

  //list initialization
  useEffect(() => {
    init();
    console.log(items);
    return () => {
      itemListObj.items = [];
    };
  }, [
    listContainer.current !== null ? listContainer.current.clientHeight : null,
    ...deps,
  ]);

  /**
   * initializes the array of components in the list
   * @param {number} ratio - amount of components to be created
   * @returns {object[]} array of created components
   */
  async function initArray(ratio) {
    getData();
    if (ratio <= 0) return;
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
      item.ref = React.createRef();
      item.top = array[index - 1] ? array[index - 1].top + itemHeight : 0;
      itemListObj.topLevel += itemHeight;
    });

    for (const item of newItems) {
      item.data = await dataObj.getNextData();
    }

    //adding buffer
    for (let i = 0; i <= buffer; i++) {
      newItems.unshift({
        data: dataObj.getPrevData(),
        ref: React.createRef(),
        top: newItems[0].top - itemHeight,
      });
      newItems.push({
        data: await dataObj.getNextData(),
        ref: React.createRef(),
        top: newItems.at(-1).top + itemHeight,
      });
    }

    return newItems.filter((e) => e.data !== null || e.top < 0);
  }

  const scrollDirection = (posProp) => {
    return posProp.yCenter < y ? "top" : "bottom";
  };

  //TODO: recalculate heights
  const goDown = (posProp) => {
    if (!posProp) return false;
    return (
      posProp.yTop >
        posProp.highestItem.offsetTop + posProp.highestItem.clientHeight &&
      scrollDirection(posProp) === "bottom"
    );
  };
  const goUp = (posProp) => {
    if (!posProp) return false;
    return (
      posProp.yBottom <
        posProp.lowestItem.offsetTop - posProp.lowestItem.clientHeight &&
      scrollDirection(posProp) === "top"
    );
  };

  const getPosProp = (itemArray) => {
    if (!scrollTarget) return null;
    return {
      yTop: scrollTarget.scrollTop - buffer * itemHeight,
      yBottom:
        scrollTarget.scrollTop +
        listContainer.current.clientHeight +
        buffer * itemHeight,
      yCenter: scrollTarget.scrollTop + listContainer.current.clientHeight / 2,
      lowestItem: itemArray.at(-1).ref.current,
      highestItem: itemArray.at(0).ref.current,
    };
  };

  //moving components
  const onScroll = () => {
    const reset = () => {
      console.log("finished");
      setscrollTarget(null);
      setScrolling(false);
      setY(posProp.yCenter);
    };
    if (!scrollTarget && !scrolling) return;
    setScrolling(true);
    //highest & lowest pixel
    const posProp = getPosProp(items);
    if(!posProp) return
    let pr = null;
    if (goDown(posProp)) pr = pushdown(posProp, [...items]);
    else if (goUp(posProp)) pr = pushup(posProp, [...items]);
    console.log(pr);

    if (!pr) return reset();
    pr.then(reset);
  };

  //onResize
  useEffect(() => {
    if (!listContainer.current) return; // wait for the elementRef to be available
    const resizeObserver = new ResizeObserver(() => {
      init();
    });
    resizeObserver.observe(listContainer.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(onScroll, [scrollTarget]);

  /**
   * moves the first item of the list to the bottom
   */
  async function pushdown(posProp, newItemArray) {
    let newItem = null;
    const data = await dataObj.getNextData();
    if (!data) return;
    newItem = newItemArray.shift();
    newItem.data = data;
    newItem.top = newItemArray.at(-1).top + itemHeight;
    newItem.ref.current.style.top = newItem.top;
    newItemArray.push(newItem);

    posProp = getPosProp(newItemArray);

    setItems([...newItemArray]);
    if (goDown(posProp)) await pushdown(posProp, [...newItemArray]);
  }

  /**
   * moves the last item of the list to the top
   */
  async function pushup(posProp, newItemArray) {
    let newItem = null;
    const data = dataObj.getPrevData();
    if (!data) return;
    newItem = newItemArray.pop();
    newItem.data = data;
    newItem.top = newItemArray.at(0).top - itemHeight;
    newItem.ref.current.style.top = newItem.top;
    newItemArray.unshift(newItem);
    console.log(newItem);
    console.log(newItemArray);

    posProp = getPosProp([...newItemArray]);

    setItems(newItemArray);
    if (goUp(posProp)) await pushup(posProp, [...newItemArray]);
  }

  const getRatio = () => {
    if (!listContainer.current) return 0;
    return listContainer.current.clientHeight / itemHeight;
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
              ...listItemStyles,
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
