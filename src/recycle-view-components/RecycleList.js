import React, {
  Children,
  Component,
  createRef,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * @callback getData
 * @param {number} dataIndex - current position in the data array
 * @param {number} chunkSize - amount of item requested
 * @returns {Promise<any[]> | null} array of new data to append to the data array
 * **/

/**
 * Infinite list of items that uses an n amount of components
 * to display data.
 * @param {createListItem} createListItem - components tasked with displaying data
 * @param {number} itemHeight - desired height for the list item
 * @param {getData} getData - asynchronous function tasked with periodically retrieving data
 * @param {number} chunkSize - number of records to get from every call of getData
 * @param {object} listItemStyles - additional styles to be applied to the listitem wrapper

 */

const createDataObj = ({ getData, chunk, staticData }) => {
  return {
    async fetch() {
      if (this.isFetching) throw new Error("already fetching");
      this.isFetching = true;
      if (!getData && !staticData)
        throw new Error("Cant fetch data: no callback provided");
      const result = await getData(this.dataArray.length, this.chunkSize);
      this.isFetching = false;
      return result;
    },
    dataIndex: 0,
    chunkSize: chunk || 25,
    dataArray: staticData || [],
    isFetching: false,
    isGettingData: false,
    queue: [],
    getPrevData(offset) {
      const prevIndex = this.dataIndex - offset;
      if (prevIndex < 0) return null;
      const result = this.dataArray[prevIndex];
      this.dataIndex--;
      return result;
    },
    async getNextData() {
      this.isGettingData = true;
      const currentIndex = this.dataIndex;
      this.dataIndex++;

      this.queue.push(currentIndex);
      this.doFetch();

      await new Promise((resolve) =>
        setInterval(() => {
          if (
            (this.dataArray[currentIndex] &&
              this.queue.at(0) === currentIndex) ||
            this.noData
          )
            resolve();
        }, 20)
      );

      this.isGettingData = false;
      this.queue.shift();
      return this.dataArray[currentIndex];
    },
    //RECURSIVE
    doFetch() {
      //static array managemenet
      if (staticData) {
        if (this.dataArray.length - 1 <= this.dataIndex) this.noData = true;
        return;
      }

      if (
        !this.isFetching &&
        (this.dataArray.length - this.dataIndex < this.chunkSize ||
          this.dataArray.length <= 0)
      ) {
        this.fetch()
          .then((result) => {
            if (
              !result ||
              result.length <= 0 ||
              Object.keys(result).length <= 0
            ) {
              this.noData = true;
              return;
            }
            this.dataArray.push(...result);
            //self call
            this.doFetch();
          })
          .catch(() => {
            this.noData = true;
          });
        this.isGettingData = false;
      }
    },
    noData: false,
  };
};

/**
 *
 * @param {number} itemHeight - pixel height of the list item
 * @param {getData} getData - callback to retrive data for list
 * @param {number} chunkSize - size of the chunk of data to retrive, 10 by default
 * @param {array<any>} deps - dependency array to trigger rerender
 * @param {Component} placeholder - component in place when data is still loading
 * @param {object} listItemStyles
 * @param {Array<any>} staticData - MUTUALLY EXCLUSIVE WITH GETDATA, if used has to contain all data used by the recycle list
 */
const RecycleList = ({
  children,
  itemHeight,
  getData,
  chunkSize,
  deps,
  staticData,
  listItemStyles,
  placeholder,
}) => {
  if (!deps) deps = [];
  const listContainer = useRef(null);
  const [items, setItems] = useState([]);
  const ListItem = Children.toArray(children)[0];
  const dataObjRef = useRef();
  let dataObj = dataObjRef.current;
  //counts how many items are waiting for data, on 0 does stuff (aka is false in conditions)
  const isWaitingData = useRef(0);
  const scrollTarget = useRef(null);
  const y = useRef(0);
  const scrolling = useRef(false);
  const [rerender, setRerender] = useState(false);

  function init() {
    setItems([]);
    dataObjRef.current = createDataObj({
      getData,
      chunkSize,
      staticData,
    });
    dataObj = dataObjRef.current;
    isWaitingData.current = 0;
    scrolling.current = false;
    const ratio = parseInt(getRatio());

    const _items = initArray(ratio);
    setItems([..._items]);
  }

  const getFlexHeight = () => {
    if (!dataObj) return 0;
    return itemHeight * dataObj.dataArray.length;
  };

  const getRatio = () => {
    if (!listContainer.current) return 0;
    return Math.ceil(listContainer.current.clientHeight / itemHeight);
  };

  const getPosProp = (itemArray) => {
    if (!scrollTarget.current) return null;
    return {
      yTop: scrollTarget.current.scrollTop,
      yBottom: scrollTarget.current.scrollTop + itemHeight * getRatio(),
      yCenter:
        scrollTarget.current.scrollTop + listContainer.current.clientHeight / 2,
      lowestItem: itemArray.at(-1),
      highestItem: itemArray.at(0),
    };
  };

  //list initialization
  useEffect(() => {
    init();
    return () => {
      setItems([]);
    };
  }, [
    listContainer?.current !== null ? listContainer.current.clientHeight : null,
    ...deps,
  ]);

  const onScroll = () => {
    if (!scrollTarget.current && !scrolling) return;

    scrolling.current = true;
    //highest & lowest pixel
    const posProp = getPosProp(items);

    if (!posProp) {
      scrollTarget.current = null;
      scrolling.current = false;
      return;
    }
    if (goDown(posProp)) pushdown(posProp, [...items]);
    else if (goUp(posProp)) pushup(posProp, [...items]);

    scrollTarget.current = null;
    scrolling.current = false;
    y.current = posProp.yCenter;
  };

  function pushdown(posProp, newItemArray) {
    if (!posProp) return;
    const newItem = newItemArray.shift();
    if (!newItem) return;
    newItem.data = null;
    isWaitingData.current++;

    dataObj.getNextData().then((data) => {
      newItem.data = data;
      isWaitingData.current--;

      if (!isWaitingData.current) setRerender(!rerender);
    });
    newItem.top = newItemArray.at(-1).top + itemHeight;
    newItemArray.push(newItem);

    posProp = getPosProp(newItemArray);

    setItems([...newItemArray]);
    if (goDown(posProp)) pushdown(posProp, [...newItemArray]);
  }

  function pushup(posProp, newItemArray) {
    if (!posProp) return;
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
    if (!posProp) return;
    return posProp.yCenter < y.current ? "top" : "bottom";
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

  /**
   * initializes the array of components in the list
   * @param {number} ratio - amount of components to be created
   * @returns {object[]} array of created components
   */
  function initArray(ratio) {
    if (ratio <= 0) return;

    const newItems = [];
    for (let i = 0; i < ratio; i++)
      newItems[i] = { ref: React.createRef(), top: itemHeight * i, id: i };

    //initial fill with data
    newItems.forEach((i, index, array) => {
      if (i.top < 0) return;
      dataObj.getNextData().then((res) => {
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

        if (!(isWaitingData.current && scrollTarget.current)) {
          scrollTarget.current = current;
          onScroll();
        }
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
              //CHANGE KEY??
              key={value.id}
              ref={ref}
            >
              {value
                ? React.cloneElement(ListItem, { data: value.data })
                : placeholder && placeholder()}
            </div>
          );
          return result;
        })}
      </div>
    </div>
  );
};

export default RecycleList;
