import React from "react";

export const SimpleListItem = ({ data }) => {
  if (!data) return;
  return (
    <div
      style={{
        minWidth: "100%",
        minHeight: "50px",
        position: "relative",
        textAlign: "center",
      }}
    >
      {data}
    </div>
  );
};
