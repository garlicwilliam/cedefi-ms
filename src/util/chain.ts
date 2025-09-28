import { createPublicClient, http, PublicClient } from "viem";
import { mainnet, bsc } from "viem/chains";
import {
  CHAIN_RPC,
  SUPPORTED_CHAINS,
  SupportedChainType,
} from "../const/chain-rpc.ts";

export async function getTxTimestamp(
  chainId: SupportedChainType,
  txHash: `0x${string}`,
): Promise<number> {
  const client: PublicClient = createClient(chainId);
  console.log("client is", client);
  return await getTransactionTimestamp(txHash, client);
}

function createClient(id: SupportedChainType): PublicClient {
  const chains = {
    "1": mainnet,
    "56": bsc,
  };

  const rpcUrl: string = CHAIN_RPC[id];

  console.log("rpcUrl", id, rpcUrl);

  return createPublicClient({
    chain: chains[id],
    transport: http(rpcUrl),
  });
}

async function getTransactionTimestamp(
  txHash: `0x${string}`,
  client: PublicClient,
) {
  // 1. 获取交易详情
  const tx = await client.getTransaction({ hash: txHash });

  if (!tx.blockNumber) {
    throw new Error("交易还未被打包");
  }

  // 2. 根据区块号获取区块
  const block = await client.getBlock({ blockNumber: tx.blockNumber });

  // 3. 区块的 timestamp 就是交易时间
  return Number(block.timestamp); // 秒级时间戳 (bigint -> number)
}

export function isTxHash(tx: string): tx is `0x${string}` {
  return /^0x([A-Fa-f0-9]{64})$/.test(tx);
}

export function isSupportedChainId(
  chainId: string,
): chainId is SupportedChainType {
  return (SUPPORTED_CHAINS as readonly string[]).includes(chainId);
}
