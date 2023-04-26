import React, { Children, createRef, useEffect, useRef, useState } from "react";
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
      if (this.isFetching) throw new Error("already fetching");
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
      const prevIndex = this.dataIndex - items.length;
      if (prevIndex < 0) return null;
      const result = this.dataArray[prevIndex];
      this.dataIndex--;
      return result;
    },
    getNextData: async function () {
      this.isGettingData = true;
      //non può essere un if!!
      //TODO: usare un interval?? (per avere un thread a parte)

      const currentIndex = this.dataIndex;
      this.dataIndex++;

      this.doFetch();

      while (!this.dataArray[currentIndex]) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      this.isGettingData = false;
      return this.dataArray[currentIndex];
    },
    //recursive fetch
    doFetch: function () {
      if (
        !this.isFetching &&
        (this.dataIndex > this.dataArray.length - this.chunkSize ||
          this.dataArray.length <= 0)
      ) {
        this.fetch().then((result) => {
          this.dataArray.push(...result);
          this.doFetch();
        });
        this.isGettingData = false;
      }
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
  let isMoving = false;
  const dataObjRef = useRef(
    createDataObj({ getData, chunkSize: chunkSize, bufferSize, items })
  );
  const dataObj = dataObjRef.current;
  const [topRef, topInView, topEntry] = useInView({
    onChange: (inView, entry) => {
      if (!inView || items.at(0).top <= 0) return;
      while (isMoving);
      isMoving = true;
      pushup(getPosProp(items), [...items], entry);
      isMoving = false;
    },
    initialInView: false,
  });
  const [bottomRef, bottomInView, bottomEntry] = useInView({
    onChange: (inView, entry) => {
      if (!inView) return;
      while (isMoving);
      isMoving = true;
      pushdown(getPosProp(items), [...items], entry);
      isMoving = false;
    },
  });

  function init() {
    dataObj.reset();
    const ratio = parseInt(getRatio());
    console.log(ratio);
    const _items = initArray(ratio);
    setItems([..._items]);
  }

  function pushup(posProp, newItemArray, entry) {
    let newItem = null;
    const data = dataObj.getPrevData();
    if (!data) return;
    const current = entry.target;
    newItem = newItemArray.pop();
    newItem.data = data;
    newItem.top = newItemArray.at(0).top - itemHeight;
    current.style.top = newItem.top;
    newItemArray.unshift(newItem);

    posProp = getPosProp([...newItemArray]);

    setItems(newItemArray);
  }

  const getPosProp = (itemArray) => {
    return {
      lowestItem: itemArray.at(-1).ref.current,
      highestItem: itemArray.at(0).ref.current,
      yTop: itemArray.at(0).top,
      yBottom: itemArray.at(-1).top + itemHeight,
    };
  };

  async function pushdown(posProp, newItemArray, entry) {
    let newItem = null;
    const current = entry.target;
    dataObj.getNextData().then((data) => (newItem.data = data));
    newItem = newItemArray.shift();
    newItem.top = newItemArray.at(-1).top + itemHeight;
    current.style.top = newItem.top;
    newItemArray.push(newItem);

    posProp = getPosProp(newItemArray);

    setItems([...newItemArray]);
  }

  useEffect(() => {
    if (!items[0]?.data) {
      const _items = [...items];
      _items.forEach((i, index, array) => {
        dataObj.getNextData().then((res) => {
          array[index].data = res;
          setItems([...array]);
        });
      });
    }
  }, [items]);

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

    const newItems = new Array(ratio + 3);
    for (let i = 0; i < newItems.length; i++)
      newItems[i] = { ref: React.createRef(), top: 0 + itemHeight * i }; //TODO: decide what to do with code below
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
        if (!value?.data) return;

        let ref = items[index].ref;
        let viewRef;
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
            {React.cloneElement(ListItem, { data: value.data, index })}
          </div>
        );
        //itemListObj.topLevel += itemHeight;
        return result;
      })}
    </div>
  );
};
