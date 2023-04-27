import React from "react";

export const SimpleListItem = ({ data }) => {
  console.log("simple list item", data);
  return (
    <div style={{ minWidth: "100%", minHeight: "50px", position: "relative" }}>
      {data}
    </div>
  );
};
