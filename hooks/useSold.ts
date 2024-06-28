import {
  safeFetchPoolManager,
  safeFetchTokenManager,
  findPoolManagerPda,
  findTokenManagerPda,
  PoolManager,
  TokenManager,
  stake,
  unstake,
  createTestQuote,
  SetupOptions,
  toggleActive,
  setup,
  mint,
  redeem,
  getMerkleProof,
  SOLD_ISSUANCE_PROGRAM_ID,
  calculateExchangeRate,
  SOLD_STAKING_PROGRAM_ID,
} from "@builderz/sold";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import {
  createSplAssociatedTokenProgram,
  createSplTokenProgram,
  SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
  findAssociatedTokenPda,
  safeFetchToken,
  createAssociatedToken,
} from "@metaplex-foundation/mpl-toolbox";
import { toast } from "sonner";
import { TransactionBuilder } from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { PublicKey, publicKey } from "@metaplex-foundation/umi";
import { PublicKey as WEb3Publickey } from "@solana/web3.js";

let swapTesting = false;
// TODO: Move this into npm package
const bigIntToFloat = (
  bigIntValue: bigint | number,
  decimals: number,
): number => {
  return Number(bigIntValue) / Math.pow(10, decimals);
};

export const useSold = () => {
  const [loading, setLoading] = useState(false);
  const [stakingTab, setStakingTab] = useState("stake");

  useEffect(() => {
    setAmount(0); // Reset amount when staking tab changes
  }, [stakingTab]);

  const [amount, setAmount] = useState(0);
  const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);
  const [poolManager, setPoolManager] = useState<PoolManager | null>(null);
  const [reset, setReset] = useState(0);
  const [userBalancePUSD, setUserBalancePUSD] = useState(0);
  const [userBalanceSPUSD, setUserBalanceSPUSD] = useState(0);
  const [userBalanceUSDC, setUserBalanceUSDC] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);

  const [statCardData, setStatCardData] = useState<{
    totalSupply: number;
    usdcInPool: number;
    totalStaked: number;
    xSoldSupply: number;
    [key: string]: number;
  }>({
    totalSupply: 0,
    usdcInPool: 0,
    totalStaked: 0,
    xSoldSupply: 0,
  });

  const [exchangedAmount, setExchangedAmount] = useState(0);

  const wallet = useWallet();
  const { connection } = useConnection();

  const umi = createUmi(connection);
  umi.programs.add(createSplAssociatedTokenProgram());
  umi.programs.add(createSplTokenProgram());

  umi.use(walletAdapterIdentity(wallet));

  const tokenManagerPubKey = findTokenManagerPda(umi);
  const poolManagerPubKey = findPoolManagerPda(umi);

  useEffect(() => {
    const fetchState = async () => {
      setLoading(true);
      const tokenManagerAcc = await safeFetchTokenManager(umi, tokenManagerPubKey);
      const poolManagerAcc = await safeFetchPoolManager(umi, poolManagerPubKey);

      setTokenManager(tokenManagerAcc);
      setPoolManager(poolManagerAcc);

      if (poolManagerAcc) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const lastYieldChangeTimestamp = Number(poolManagerAcc.lastYieldChangeTimestamp);
        const lastYieldChangeExchangeRate = Number(poolManagerAcc.lastYieldChangeExchangeRate);
        const rate = calculateExchangeRate(
          lastYieldChangeTimestamp,
          currentTimestamp,
          Number(poolManagerAcc.annualYieldRate),
          lastYieldChangeExchangeRate,
        );
        setExchangeRate(rate);
      }

      tokenManagerAcc && setStatCardData({
        totalSupply: bigIntToFloat(tokenManagerAcc.totalSupply, tokenManagerAcc.mintDecimals),
        usdcInPool: bigIntToFloat(tokenManagerAcc.totalCollateral, tokenManagerAcc.quoteMintDecimals),
        totalStaked: 0,
        xSoldSupply: 0,
      });

      setLoading(false);

      if (swapTesting) {
        console.log("checking usdc balance");
        const userUSDC = findAssociatedTokenPda(umi, {
          owner: umi.identity.publicKey,
          mint: USDC_MINT_ADDRESS,
        });

        const userUSDCAtaAcc = await safeFetchToken(umi, userUSDC);
        setUserBalanceUSDC(
          userUSDCAtaAcc
            ? bigIntToFloat(userUSDCAtaAcc.amount, 6) // Assuming 6 is the decimal for USDC
            : 0,
        );

        const userBaseUSDT = findAssociatedTokenPda(umi, {
          owner: umi.identity.publicKey,
          mint: publicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
        });

        const userBaseUSDTAtaAcc = await safeFetchToken(umi, userBaseUSDT);
        setUserBalancePUSD(
          userBaseUSDTAtaAcc
            ? bigIntToFloat(userBaseUSDTAtaAcc.amount, 6)
            : 0,
        );
      }

    };

    if (wallet.publicKey) {
      fetchState();
    }
  }, [wallet.publicKey, reset]);

  useEffect(() => {
    getUserBalances();
  }, [tokenManager, poolManager]);

  // Debugging logs
  useEffect(() => {
    console.log('User balances:', { userBalancePUSD, userBalanceSPUSD, userBalanceUSDC });
  }, [userBalancePUSD, userBalanceSPUSD, userBalanceUSDC]);


  const USDC_MINT_ADDRESS = publicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');


  // Inside useSold hook, add logs to check fetched balances
  const getUserBalances = async () => {
    if (!tokenManager || !poolManager) {
      console.log("Token manager or pool manager not found");
      return;
    }

    const userBase = findAssociatedTokenPda(umi, {
      owner: umi.identity.publicKey,
      mint: poolManager.baseMint,
    });
    const userXMint = findAssociatedTokenPda(umi, {
      owner: umi.identity.publicKey,
      mint: poolManager.xMint,
    });
    const userUSDC = findAssociatedTokenPda(umi, {
      owner: umi.identity.publicKey,
      mint: USDC_MINT_ADDRESS,
    });

    const userBaseAtaAcc = await safeFetchToken(umi, userBase);
    const userXmintAtaAcc = await safeFetchToken(umi, userXMint);
    const userUSDCAtaAcc = await safeFetchToken(umi, userUSDC);

    console.log(
      "Fetched Balances:",
      userBaseAtaAcc?.amount,
      userXmintAtaAcc?.amount,
      userUSDCAtaAcc?.amount,
    ); // Debug fetched balances including xMint

    setUserBalancePUSD(
      userBaseAtaAcc
        ? bigIntToFloat(userBaseAtaAcc.amount, tokenManager.mintDecimals)
        : 0,
    );
    setUserBalanceSPUSD(
      userXmintAtaAcc
        ? bigIntToFloat(userXmintAtaAcc.amount, tokenManager.quoteMintDecimals)
        : 0,
    );
    setUserBalanceUSDC(
      userUSDCAtaAcc
        ? bigIntToFloat(userUSDCAtaAcc.amount, 6) // Assuming 6 is the decimal for USDC
        : 0,
    );
  };


  useEffect(() => {
    getUserBalances();
  }, [tokenManager, poolManager]);

  const refetch = () => {
    setReset((prev) => prev + 1);
  };

  const annualYieldRate = poolManager
    ? (Number(poolManager.annualYieldRate) / 100).toString()
    : "0";

  // Function to calculate exchanged amount
  const calculateExchangedAmount = (inputAmount: number) => {
    if (!poolManager) return;
    const rate = calculateExchangeRate(
      Number(poolManager.lastYieldChangeTimestamp),
      Math.floor(Date.now() / 1000),
      Number(poolManager.annualYieldRate),
      Number(poolManager.lastYieldChangeExchangeRate),
    );
    const floatRate = bigIntToFloat(rate, poolManager.xMintDecimals);

    let exchangedAmount;
    if (stakingTab === "unstake") {
      exchangedAmount = Math.round((inputAmount / floatRate) * 100) / 100; // Reverse the rate for unstaking
    } else {
      exchangedAmount = Math.round(inputAmount * floatRate * 100) / 100; // Normal rate for staking
    }
    setExchangedAmount(exchangedAmount);
  };

  useEffect(() => {
    calculateExchangedAmount(amount);
  }, [amount, poolManager]);

  const handleStake = async (e: any) => {
    e.preventDefault();
    if (!tokenManager || !poolManager) {
      throw new Error("Token manager or pool manager not found");
    }

    setLoading(true);
    toast.loading("Staking");

    try {
      let txBuilder = new TransactionBuilder();

      // Find the PDAs
      let xMint = umi.eddsa.findPda(SOLD_STAKING_PROGRAM_ID, [
        Buffer.from("mint"),
      ])[0];
      const baseMint = umi.eddsa.findPda(SOLD_ISSUANCE_PROGRAM_ID, [
        Buffer.from("mint"),
      ])[0];
      const userBase = findAssociatedTokenPda(umi, {
        owner: umi.identity.publicKey,
        mint: baseMint,
      });
      const userX = findAssociatedTokenPda(umi, {
        owner: umi.identity.publicKey,
        mint: xMint,
      });
      const vaultStaking = findAssociatedTokenPda(umi, {
        owner: poolManager.publicKey,
        mint: baseMint,
      });

      // Fetch token accounts
      const userBaseAtaAcc = await safeFetchToken(umi, userBase);
      if (!userBaseAtaAcc) {
        txBuilder = txBuilder.add(
          createAssociatedToken(umi, {
            mint: baseMint,
            owner: umi.identity.publicKey,
          }),
        );
      }

      const userXAtaAcc = await safeFetchToken(umi, userX);
      if (!userXAtaAcc) {
        txBuilder = txBuilder.add(
          createAssociatedToken(umi, {
            mint: xMint,
            owner: umi.identity.publicKey,
          }),
        );
      }

      const vaultAcc = await safeFetchToken(umi, vaultStaking);
      if (!vaultAcc) {
        txBuilder = txBuilder.add(
          createAssociatedToken(umi, {
            mint: baseMint,
            owner: poolManager.publicKey,
          }),
        );
      }

      // Ensure quantity is properly calculated
      const quantity = amount * 10 ** 6; // Assuming 6 is the decimal for baseMint

      // Add stake instruction
      txBuilder = txBuilder.add(
        stake(umi, {
          poolManager: poolManager.publicKey,
          baseMint,
          xMint,
          payerBaseMintAta: userBase,
          payerXMintAta: userX,
          vault: vaultStaking,
          associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
          quantity,
        }),
      );

      // Send and confirm the transaction
      const resStake = await txBuilder.sendAndConfirm(umi, {
        send: { skipPreflight: true },
        confirm: { commitment: "confirmed" },
      });
      console.log(bs58.encode(resStake.signature)); // Log the transaction signature in base58

      // Fetch account data after the transaction
      const userXAfter = await safeFetchToken(umi, userX);
      const vaultAfter = await safeFetchToken(umi, vaultStaking);

      // Log balances for debugging
      console.log("User XMint Balance After:", userXAfter?.amount);
      console.log("Vault BaseMint Balance After:", vaultAfter?.amount);

      toast.success("Staked successfully");

      refetch();
      toast.dismiss
    } catch (error) {
      console.error("Failed to handle stake action:", error);
      toast.error("Failed to handle stake action");
      refetch();
    }

    setLoading(false);
    toast.dismiss();
  };

  const handleUnstake = async (e: any) => {
    e.preventDefault();
    if (!tokenManager || !poolManager) {
      throw new Error("Token manager or pool manager not found");
    }

    setLoading(true);
    toast.loading("Unstaking");

    try {
      let txBuilder = new TransactionBuilder();

      // Find the PDAs
      let xMint = umi.eddsa.findPda(SOLD_STAKING_PROGRAM_ID, [
        Buffer.from("mint"),
      ])[0];
      const baseMint = umi.eddsa.findPda(SOLD_ISSUANCE_PROGRAM_ID, [
        Buffer.from("mint"),
      ])[0];
      const userBase = findAssociatedTokenPda(umi, {
        owner: umi.identity.publicKey,
        mint: baseMint,
      });
      const userX = findAssociatedTokenPda(umi, {
        owner: umi.identity.publicKey,
        mint: xMint,
      });
      const vaultStaking = findAssociatedTokenPda(umi, {
        owner: poolManager.publicKey,
        mint: baseMint,
      });

      // Fetch token accounts
      const userBaseAtaAcc = await safeFetchToken(umi, userBase);
      if (!userBaseAtaAcc) {
        txBuilder = txBuilder.add(
          createAssociatedToken(umi, {
            mint: baseMint,
            owner: umi.identity.publicKey,
          }),
        );
      }

      const userXAtaAcc = await safeFetchToken(umi, userX);
      if (!userXAtaAcc) {
        txBuilder = txBuilder.add(
          createAssociatedToken(umi, {
            mint: xMint,
            owner: umi.identity.publicKey,
          }),
        );
      }

      const vaultAcc = await safeFetchToken(umi, vaultStaking);
      if (!vaultAcc) {
        txBuilder = txBuilder.add(
          createAssociatedToken(umi, {
            mint: baseMint,
            owner: poolManager.publicKey,
          }),
        );
      }

      // Fetch the stake pool account
      const _stakePoolAcc = await safeFetchPoolManager(
        umi,
        poolManager.publicKey,
      );
      const quantity = amount * 10 ** 6; // Assuming 6 is the decimal for xMint

      // Fetch current exchange rate and calculate baseMint to be received
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const exchangeRate = calculateExchangeRate(
        Number(_stakePoolAcc?.lastYieldChangeTimestamp),
        currentTimestamp,
        Number(_stakePoolAcc?.annualYieldRate),
        Number(_stakePoolAcc?.lastYieldChangeExchangeRate),
      );
      const expectedBaseMintAmount = BigInt(
        Math.floor((quantity / exchangeRate) * 10 ** 6),
      );
      console.log("Expected BaseMint Amount:", expectedBaseMintAmount);

      // Add unstake instruction
      txBuilder = txBuilder.add(
        unstake(umi, {
          poolManager: poolManager.publicKey,
          baseMint,
          xMint,
          payerBaseMintAta: userBase,
          payerXMintAta: userX,
          vault: vaultStaking,
          associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
          quantity,
          tokenManager: tokenManager.publicKey,
          soldIssuanceProgram: SOLD_ISSUANCE_PROGRAM_ID,
        }),
      );

      // Send and confirm the transaction
      const resUnstake = await txBuilder.sendAndConfirm(umi, {
        send: { skipPreflight: true },
        confirm: { commitment: "confirmed" },
      });
      console.log(bs58.encode(resUnstake.signature)); // Log the transaction signature in base58

      // Fetch account data after the transaction
      const userBaseAfter = await safeFetchToken(umi, userBase);
      const vaultAfter = await safeFetchToken(umi, vaultStaking);

      // Log balances for debugging
      console.log("User BaseMint Balance After:", userBaseAfter?.amount);
      console.log("Vault BaseMint Balance After:", vaultAfter?.amount);

      toast("Unstaked successfully");
      refetch();
    } catch (error) {
      console.error("Failed to handle unstake action:", error);
      toast.error("Failed to handle unstake action");
      refetch();
    }

    setLoading(false);
    toast.dismiss();
  };

  return {
    tokenManager,
    poolManager,
    refetch,
    loading,
    setLoading,
    statCardData,
    userBalancePUSD,
    userBalanceSPUSD,
    userBalanceUSDC,
    amount,
    setAmount,
    exchangedAmount,
    calculateExchangedAmount,
    exchangeRate,
    handleStake,
    handleUnstake,
    annualYieldRate,
    stakingTab,
    setStakingTab,
  };
};
