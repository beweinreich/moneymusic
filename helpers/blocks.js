const getExampleBlock = (num) => {
  const fiveYears = 5 * 400 * 24 * 60 * 60 * 1000;
  return {
    height: num,
    timestamp: new Date(new Date().getTime() - fiveYears + num * 60000),
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
  const newBpm = 28 + Math.min(scaleTransactions, 50);

  return newBpm;
};

export { getExampleBlock, secondsUntilNextBlock, getBlockBpm };
