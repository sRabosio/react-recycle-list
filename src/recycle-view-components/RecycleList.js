import React, { Children, createRef, useEffect, useRef, useState } from 'react';

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
 */

const createDataObj = ({
  getData,
  chunk,
  bufferSize,
  listItemStyles,
  items,
}) => {
  return {
    async fetch() {
      if (this.isFetching) throw new Error("already fetching");
      this.isFetching = true;
      if (!getData) throw new Error("Cant fetch data: no callback provided");
      const result = await getData(
        this.dataArray.length === 0 ? 0 : this.dataArray.length,
        this.chunkSize
      );

      this.isFetching = false;
      return result;
    },
    dataIndex: 0,
    chunkSize: 25,
    dataArray: [],
    buffer: bufferSize || 10,
    isFetching: false,
    isGettingData: false,
    queue: [],
    getPrevData(offset) {
      //if (this.isGettingData) return;
      const prevIndex = this.dataIndex - offset;
      if (prevIndex < 0) return null;
      const result = this.dataArray[prevIndex];
      this.dataIndex--;
      return result;
    },
    async getNextData() {
      this.isGettingData = true;
      //non può essere un if!!
      //TODO: usare un interval?? (per avere un thread a parte)

      const currentIndex = this.dataIndex;
      this.dataIndex++;

      this.queue.push(currentIndex);

      this.doFetch();

      while (
        (!this.dataArray[currentIndex] || this.queue.at(0) !== currentIndex) &&
        !this.noData
      ) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      this.isGettingData = false;
      this.queue.shift();
      return this.dataArray[currentIndex];
    },
    doFetch() {
      if (
        !this.isFetching &&
        (this.dataArray.length - this.dataIndex < this.chunkSize ||
          this.dataArray.length <= 0)
      ) {
        this.fetch().then((result) => {
          if (
            !result ||
            result.length <= 0 ||
            Object.keys(result).length <= 0
          ) {
            this.noData = true;
            return;
          }
          this.dataArray.push(...result);
          if (this.onFetched) this.onFetched();
          this.doFetch();
        });
        this.isGettingData = false;
      }
    },
    noData: false,
    onFetched: null,
  };
};

const RecycleList = ({
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
  const dataObjRef = useRef();
  let dataObj = dataObjRef.current;
  const [heightMultiplier, setHeightMultiplier] = useState(0);
  //counts how many items are waiting for data, on 0 does stuff (aka is false in conditions)
  const isWaitingData = useRef(0);
  const [scrollTarget, setscrollTarget] = useState(null);
  const [y, setY] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const [rerender, setRerender] = useState(false);

  function init() {
    setItems([]);
    dataObjRef.current = createDataObj({
      getData,
      chunkSize,
      bufferSize,
      items,
    });
    dataObj = dataObjRef.current;
    console.log("dataobj", { ...dataObj, dataArray: [...dataObj.dataArray] });
    isWaitingData.current = 0;
    setScrolling(false);
    const ratio = parseInt(getRatio());

    const _items = initArray(ratio);
    console.log(_items);
    setItems([..._items]);
  }

  const getFlexHeight = () => {
    if (!dataObj) return 0;
    return itemHeight * dataObj.dataArray.length;
  };

  const getRatio = () => {
    if (!listContainer.current) return 0;
    return listContainer.current.clientHeight / itemHeight;
  };

  const getPosProp = (itemArray) => {
    if (!scrollTarget) return null;
    return {
      yTop: scrollTarget.scrollTop,
      yBottom: scrollTarget.scrollTop + itemHeight * getRatio(),
      yCenter: scrollTarget.scrollTop + listContainer.current.clientHeight / 2,
      lowestItem: itemArray.at(-1),
      highestItem: itemArray.at(0),
      lowestItemRef: itemArray.at(-1).ref.current,
      highestItemRef: itemArray.at(0).ref.current,
    };
  };

  //list initialization
  useEffect(() => {
    init();
    getPosProp();
    return () => {
      setItems([]);
    };
  }, [
    listContainer.current !== null ? listContainer.current.clientHeight : null,
    ...deps,
  ]);

  const onScroll = () => {
    if (!scrollTarget && !scrolling) return;

    setScrolling(true);
    //highest & lowest pixel
    const posProp = getPosProp(items);

    if (!posProp) {
      setscrollTarget(null);
      setScrolling(false);
      return;
    }
    if (goDown(posProp)) pushdown(posProp, [...items]);
    else if (goUp(posProp)) pushup(posProp, [...items]);

    setscrollTarget(null);
    setScrolling(false);
    setY(posProp.yCenter);
  };

  function pushdown(posProp, newItemArray) {
    const newItem = newItemArray.shift();
    if (!newItem) return;
    newItem.data = "";
    isWaitingData.current++;

    dataObj.getNextData().then((data) => {
      newItem.data = data;
      isWaitingData.current--;

      if (!isWaitingData.current) setRerender(!rerender);
    });
    newItem.top = newItemArray.at(-1).top + itemHeight;
    //newItem.ref.current.style.top = newItem.top;
    newItemArray.push(newItem);

    posProp = getPosProp(newItemArray);

    setItems([...newItemArray]);
    if (goDown(posProp)) pushdown(posProp, [...newItemArray]);
  }

  function pushup(posProp, newItemArray) {
    let newItem = null;
    let data = "";
    data = dataObj.getPrevData(newItemArray.length + 1);
    if (!data) return;

    newItem = newItemArray.pop();
    newItem.data = data;
    newItem.top = newItemArray.at(0).top - itemHeight;
    newItem.ref.current.style.top = newItem.top;
    newItemArray.unshift(newItem);
    posProp = getPosProp([...newItemArray]);

    setItems([...newItemArray]);
    if (goUp(posProp)) pushup(posProp, [...newItemArray]);
  }

  const scrollDirection = (posProp) => {
    return posProp.yCenter < y ? "top" : "bottom";
  };

  const goDown = (posProp) => {
    if (!posProp) return false;
    return (
      posProp.yTop >= posProp.highestItem.top + itemHeight &&
      scrollDirection(posProp) === "bottom"
    );
  };
  const goUp = (posProp) => {
    if (!posProp) return false;

    return (
      posProp.yBottom < posProp.lowestItem.top + itemHeight &&
      scrollDirection(posProp) === "top"
    );
  };

  useEffect(() => {
    if (!listContainer.current) return; // wait for the elementRef to be available
    const resizeObserver = new ResizeObserver(init);
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

    newItems.forEach((i, index, array) => {
      //      while (!hasData) {
      //show loading??
      //conflict w/ items state or no rerender??
      if (i.top < 0) return;
      dataObj.getNextData().then((res) => {
        if (index === 0) {
          setTimeout(() => {
            array[index].data = res;
            setItems([...array]);
          }, 1000);
          return;
        }
        array[index].data = res;
        setItems([...array]);
      });
    });

    return newItems;
  }

  return (
    <div
      ref={listContainer}
      style={{
        position: "absolute",
        left: "0",
        top: "0",
        overflowY: "scroll",
        height: "100%",
        minWidth: "100%",
      }}
      onScroll={(e) => {
        const current = e.currentTarget;

        if (!(isWaitingData.current && scrollTarget))
          return setscrollTarget(current);
        //current.scrollTo(null, scrollTarget.scrollTop);
      }}
    >
      <div
        style={{
          height: getFlexHeight(),
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {items.map((value, index) => {
          //map fa una copia dell'array quindi per settare ref devo farmi dare il puntatore direttamente dall'items originale
          //if (!value.data) return;
          //while (isWaitingData.current);

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
              key={value.top}
              ref={ref}
            >
              {React.cloneElement(ListItem, { data: value.data, index })}
            </div>
          );
          //itemListObj.topLevel += itemHeight;
          return result;
        })}
      </div>
    </div>
  );
};

export default RecycleList;
