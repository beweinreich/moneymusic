import React, { useEffect } from "react";
import { secondsUntilNextBlock } from "../helpers/blocks";

export default function Block({ block, nextBlock, blockTime }) {
  if (!block) return null;

  const calculateOpacity = () => {
    if (!nextBlock || !blockTime) return 1.0;

    const secondsLeft = secondsUntilNextBlock(nextBlock, blockTime);
    const opacity = secondsLeft / 10;
    return opacity;
  };

  const opacity = calculateOpacity();

  return (
    <div
      style={{
        padding: 10,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 12,
        borderStyle: "solid",
        width: 300,
        opacity: opacity,
        minHeight: 140,
      }}
    >
      <p>Block #{block.height}</p>
      <p>Transactions {block.transactions}</p>
      <p>Timestamp {block.timestamp.toLocaleString()}</p>
    </div>
  );
}
