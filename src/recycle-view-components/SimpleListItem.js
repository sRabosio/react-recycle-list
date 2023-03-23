import React from "react";

export const SimpleListItem = ({ data }) => {
  return (
    <div style={{ minWidth: "100%", minHeight: "50px", position: "relative" }}>
      {data}
    </div>
  );
};
