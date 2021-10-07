const getExampleBlock = (num) => {
  return {
    height: num,
    timestamp: new Date(new Date().getTime() + num * 15000),
    transactions: Math.floor(Math.random() * 300),
  };
};

const secondsUntilNextBlock = (block2, blockTime) => {
  const diff = block2.timestamp.getTime() - blockTime.getTime();
  return Math.floor(diff / 1000);
};

const getBlockBpm = (block) => {
  const maxTransactionsPerBlock = 300;

  const transactions = block.transactions;
  const scaleTransactions = Math.floor(
    (transactions / maxTransactionsPerBlock) * 100
  );
  const newBpm = 20 + Math.min(scaleTransactions, 50);

  return newBpm;
};

export { getExampleBlock, secondsUntilNextBlock, getBlockBpm };
