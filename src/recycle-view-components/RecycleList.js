import React, { Children, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

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
 * Infinite list of items that uses an n amount of components
 * to display data.
 * @param {createListItem} createListItem - components tasked with displaying data
 * @param {number} itemHeight - desired height for the list item
 * @param {getData} getData - asynchronous function tasked with periodically retrieving data
 * @param {number} chunkSize - number of records to get from every call of getData
 * @param {object} listItemStyles - additional styles to be applied to the listitem wrapper
 * @param {number} bufferSize - size of the buffer of the list. 10 for default.
 */

const createDataObj = ({
  getData,
  chunkSize,
  bufferSize,
  listItemStyles,
  items,
}) => {
  return {
    fetch: async function () {
      if (this.isFetching) throw new Error("Is already fetching");
      this.isFetching = true;
      if (!getData) throw new Error("Can't fetch data: no callback provided");
      const result = await getData(
        this.dataArray.length === 0 ? 0 : this.dataArray.length,
        this.chunkSize
      );
      this.isFetching = false;
      return result;
    },
    dataIndex: 0,
    chunkSize: chunkSize || 25,
    dataArray: [],
    buffer: bufferSize || 10,
    isFetching: false,
    isGettingData: false,
    getPrevData: function () {
      const prevIndex = this.dataIndex - items.length + this.buffer;
      if (prevIndex < 0) return null;
      const result = this.dataArray[prevIndex];
      this.dataIndex--;
      return result;
    },
    getNextData: function (onDataFetched) {
      this.isGettingData = true;

      if (
        this.dataIndex > this.dataArray.length - chunkSize ||
        this.dataArray.length <= 0
      ) {
        this.fetch().then((result) => {
          while (this.isGettingData);
          this.dataArray.push(result);
          onDataFetched();
        });
      }

      //if (this.dataIndex >= this.dataArray.length) return null;
      const result = this.dataArray[this.dataIndex] || null;
      if (result !== null) this.dataIndex++;
      this.isGettingData = false;
      return result;
    },
    reset: function () {
      this.dataArray = [];
      this.chunkSize = null;
      this.dataIndex = 0;
    },
  };
};

export const RecycleList = ({
  children,
  itemHeight,
  getData,
  chunkSize,
  bufferSize,
}) => {
  const listContainer = useRef(null);
  const [items, setItems] = useState([]);
  const ListItem = Children.toArray(children)[0];
  const dataObj = useRef(
    createDataObj({ getData, chunkSize: chunkSize, bufferSize, items })
  ).current;
  const [topRef, topInView, topEntry] = useInView();
  const [bottomRef, bottomInView, bottomEntry] = useInView();

  function init() {
    console.log("before ratio");
    dataObj.reset();
    const ratio = parseInt(getRatio());
    console.log(ratio);
    const _items = initArray(ratio);
    setItems([..._items]);
  }

  const getRatio = () => {
    if (!listContainer.current) return 0;
    return listContainer.current.clientHeight / itemHeight;
  };

  //list initialization
  useEffect(() => {
    init();
    return () => {
      setItems([]);
    };
  }, []);

  /**
   * initializes the array of components in the list
   * @param {number} ratio - amount of components to be created
   * @returns {object[]} array of created components
   */
  function initArray(ratio) {
    if (ratio <= 0) return;

    const itemsData = [];

    while (itemsData.length < ratio) {
      const result = dataObj.getNextData();
      if (result === null) continue;
      itemsData.push(result);
    }

    console.log("itemsData", itemsData);

    const newItems = itemsData.map((data, index) => {
      return {
        data,
        ref: React.createRef(),
      };
    });

    //TODO: decide what to do with code below
    // for (let i = 0; i <= buffer; i++) {
    //   newItems.unshift({
    //     data: dataObj.getPrevData(),
    //     ref: React.createRef(),
    //     top: newItems[0].top - itemHeight,
    //   });
    //   newItems.push({
    //     data: await dataObj.getNextData(),
    //     ref: React.createRef(),
    //     top: newItems.at(-1).top + itemHeight,
    //   });
    // }

    return newItems;
  }

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
    >
      {items.map((value, index) => {
        //map fa una copia dell'array quindi per settare ref devo farmi dare il puntatore direttamente dall'items originale
        let ref = items[index].ref;
        if (index === 0) ref = topRef;
        if (index === items.length - 1) ref = bottomRef;
        const result = (
          <div
            style={{
              height: itemHeight,
              position: "absolute",
              left: "0",
              width: "100%",
              top: value.top,
              //...listItemStyles,
            }}
            key={index}
            ref={ref}
          >
            <ListItem data={value.data} index={index} />
          </div>
        );
        //itemListObj.topLevel += itemHeight;
        return result;
      })}
    </div>
  );
};
