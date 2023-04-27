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
    getPrevData: function (offset) {
      //if (this.isGettingData) return;
      const prevIndex = this.dataIndex - offset + this.buffer;
      console.log("prev index", {
        prevIndex,
        di: this.dataIndex,
        length: offset,
        buf: this.buffer,
      });
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
        this.isGettingData = true;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      this.isGettingData = false;
      return this.dataArray[currentIndex];
    },
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
  deps,
}) => {
  if (!deps) deps = [];
  const listContainer = useRef(null);
  const [items, setItems] = useState([]);
  const ListItem = Children.toArray(children)[0];
  const dataObj = useRef(
    createDataObj({ getData, chunkSize: chunkSize, bufferSize, items })
  ).current;
  let [scrollTarget, setscrollTarget] = useState(null);
  const [y, setY] = useState(0);
  const [scrolling, setScrolling] = useState(false);

  function init() {
    dataObj.reset();
    const ratio = parseInt(getRatio());

    const _items = initArray(ratio);
    setItems([..._items]);
  }

  useEffect(() => {
    if (!items[dataObj.buffer + 1]?.data) {
      const _items = [...items];
      _items.forEach((i, index, array) => {
        //      while (!hasData) {
        //show loading??
        //conflict w/ items state or no rerender??
        if (i.top < 0) return;
        dataObj.getNextData().then((res) => {
          array[index].data = res;
          setItems([...array]);
        });

        //    }
      });
    }
  }, [items]);

  const getRatio = () => {
    if (!listContainer.current) return 0;
    return listContainer.current.clientHeight / itemHeight;
  };

  const getPosProp = (itemArray) => {
    if (!scrollTarget) return null;
    return {
      yTop: scrollTarget.scrollTop - dataObj.buffer * itemHeight,
      yBottom:
        scrollTarget.scrollTop +
        listContainer.current.clientHeight +
        dataObj.buffer * itemHeight,
      yCenter: scrollTarget.scrollTop + listContainer.current.clientHeight / 2,
      lowestItem: itemArray.at(-1).ref.current,
      highestItem: itemArray.at(0).ref.current,
    };
  };

  //list initialization
  useEffect(() => {
    init();
    return () => {
      setItems([]);
    };
  }, [
    listContainer.current !== null ? listContainer.current.clientHeight : null,
    ...deps,
  ]);

  const onScroll = () => {
    if (!scrollTarget && !scrolling) return;
    console.log(items);

    setScrolling(true);
    //highest & lowest pixel
    const posProp = getPosProp(items);
    if (!posProp) return;
    let pr = null;
    if (goDown(posProp)) pushdown(posProp, [...items]);
    else if (goUp(posProp)) pushup(posProp, [...items]);

    setscrollTarget(null);
    setScrolling(false);
    setY(posProp.yCenter);
  };

  function pushdown(posProp, newItemArray) {
    const newItem = newItemArray.shift();
    if (!newItem) return;
    dataObj.getNextData().then((data) => (newItem.data = data));
    newItem.top = newItemArray.at(-1).top + itemHeight;
    newItem.ref.current.style.top = newItem.top;
    newItemArray.push(newItem);

    posProp = getPosProp(newItemArray);

    setItems([...newItemArray]);
    if (goDown(posProp)) pushdown(posProp, [...newItemArray]);
  }

  function pushup(posProp, newItemArray) {
    let newItem = null;
    let data = null;
    if (newItemArray.at(0).top >= 0) {
      const data = dataObj.getPrevData(newItemArray.length);
      if (!data) return;
    }
    newItem = newItemArray.pop();
    newItem.data = data;
    newItem.top = newItemArray.at(0).top - itemHeight;
    newItem.ref.current.style.top = newItem.top;
    newItemArray.unshift(newItem);
    posProp = getPosProp([...newItemArray]);

    setItems(newItemArray);
    if (goUp(posProp)) pushup(posProp, [...newItemArray]);
  }

  const scrollDirection = (posProp) => {
    return posProp.yCenter < y ? "top" : "bottom";
  };

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
   * initializes the array of components in the list
   * @param {number} ratio - amount of components to be created
   * @returns {object[]} array of created components
   */
  function initArray(ratio) {
    if (ratio <= 0) return;

    // const newItems = itemsData.map((data, index) => {
    //   return {
    //     data,
    //     ref: React.createRef(),
    //   };
    // });

    const newItems = [];
    for (let i = 0; i < ratio; i++)
      newItems[i] = { ref: React.createRef(), top: itemHeight * i };

    //TODO: decide what to do with code below
    for (let i = 0; i <= dataObj.buffer; i++) {
      newItems.unshift({
        ref: React.createRef(),
        top: newItems[0].top - itemHeight,
      });
      newItems.push({
        ref: React.createRef(),
        top: newItems.at(-1).top + itemHeight,
      });
    }

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
      onScroll={(e) => {
        setscrollTarget(e.currentTarget);
      }}
    >
      {items.map((value, index) => {
        //map fa una copia dell'array quindi per settare ref devo farmi dare il puntatore direttamente dall'items originale
        let ref = items[index].ref;

        const result = (
          <div
            style={{
              height: itemHeight,
              position: "absolute",
              display: value?.data ? "visible" : "hidden",
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
        return result;
      })}
    </div>
  );
};
