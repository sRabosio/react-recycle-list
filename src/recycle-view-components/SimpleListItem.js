import React, { useEffect } from "react";

export const SimpleListItem = ({ data }) => {
  useEffect(() => {
    console.log("mounted");
  }, []);

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
