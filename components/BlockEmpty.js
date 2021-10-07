import React, { useEffect } from "react";
import { secondsUntilNextBlock } from "../helpers/blocks";

export default function BlockEmpty() {
  return (
    <div
      style={{
        padding: 10,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 12,
        borderStyle: "solid",
        width: 300,
        opacity: 0.5,
        minHeight: 140,
      }}
    >
      <p>Loading Blocks...</p>
    </div>
  );
}
