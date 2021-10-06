import React, { useEffect } from "react";

export default function Block({ block }) {
  if (!block) return null;

  return (
    <div
      style={{
        padding: 10,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 12,
        borderStyle: "solid",
        width: 240,
      }}
    >
      <p>Block #{block.height}</p>
      <p>Transactions {block.transactions}</p>
      <p>Timestamp {block.timestamp.toLocaleString()}</p>
    </div>
  );
}
