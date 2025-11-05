import { createPublicClient, http, PublicClient } from 'viem';
import { CHAIN_OBJECTS, CHAIN_RPC, SUPPORTED_CHAINS, SupportedChainIDsType } from '../const/chain-rpc.ts';

export async function getTxTimestamp(chainId: SupportedChainIDsType, txHash: `0x${string}`): Promise<number> {
  const client: PublicClient = createClient(chainId);

  return await getTransactionTimestamp(txHash, client);
}

function createClient(id: SupportedChainIDsType): PublicClient {
  const rpcUrl: string = CHAIN_RPC[id];

  return createPublicClient({
    chain: CHAIN_OBJECTS[id],
    transport: http(rpcUrl),
  });
}

async function getTransactionTimestamp(txHash: `0x${string}`, client: PublicClient) {
  // 1. 获取交易详情
  const tx = await client.getTransaction({ hash: txHash });

  if (!tx.blockNumber) {
    throw new Error('交易还未被打包');
  }

  // 2. 根据区块号获取区块
  const block = await client.getBlock({ blockNumber: tx.blockNumber });

  // 3. 区块的 timestamp 就是交易时间
  return Number(block.timestamp); // 秒级时间戳 (bigint -> number)
}

export function isTxHash(tx: string): tx is `0x${string}` {
  return /^0x([A-Fa-f0-9]{64})$/.test(tx);
}

export function isSupportedChainId(chainId: number): chainId is SupportedChainIDsType {
  const chainIds: number[] = SUPPORTED_CHAINS.map((one) => one.id);

  return chainIds.includes(chainId);
}
