const getExampleBlock = (num) => {
  return {
    height: num,
    timestamp: new Date(new Date().getTime() + num * 15000),
    transactions: Math.floor(Math.random() * 100),
  };
};

const secondsUntilNextBlock = (block1, block2) => {
  const diff = block2.timestamp.getTime() - block1.timestamp.getTime();
  return Math.abs(diff / 1000);
};

const getBlockBpm = (block) => {
  const maxTransactionsPerBlock = 300;

  const transactions = block.transactions;
  const scaleTransactions = Math.floor(
    (transactions / maxTransactionsPerBlock) * 100
  );
  const newBpm = 20 + Math.min(scaleTransactions, 40);

  return newBpm;
};

export { getExampleBlock, secondsUntilNextBlock, getBlockBpm };
