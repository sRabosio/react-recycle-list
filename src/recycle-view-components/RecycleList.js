import React, { Children, useRef, useState } from "react";

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
    fetch: function () {
      if (!getData) throw new Error("Can't fetch data: no callback provided");
      getData(
        this.dataArray.length === 0 ? 0 : this.dataArray.length,
        this.chunkSize
      ).then((result) => this.dataArray.push(result));
    },
    dataIndex: 0,
    chunkSize: chunkSize || 25,
    dataArray: [],
    buffer: bufferSize || 10,
    getPrevData: function () {
      const prevIndex = this.dataIndex - items.length + this.buffer;
      if (prevIndex < 0) return null;
      const result = this.dataArray[prevIndex];
      this.dataIndex--;
      return result;
    },
    getNextData: function () {
      if (this.dataIndex > this.dataArray.length - chunkSize) this.fetch();
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

export const RecycleList = ({
  children,
  itemHeight,
  getData,
  chunkSize,
  bufferSize,
}) => {
  const [items, setItems] = useState([]);
  const ListItem = Children.toArray(children)[0];
  const dataObj = useRef(
    createDataObj({ getData, chunkSize: chunkSize, bufferSize, items })
  ).current;

  return (
    <div
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
        const ref = items[index].ref;
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
