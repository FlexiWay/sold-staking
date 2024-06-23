import { safeFetchPoolManager, safeFetchTokenManager, findPoolManagerPda, findTokenManagerPda, PoolManager, TokenManager, stake, unstake,  createTestQuote, SetupOptions, toggleActive, setup, mint, redeem, getMerkleProof, SOLD_ISSUANCE_PROGRAM_ID, calculateExchangeRate, SOLD_STAKING_PROGRAM_ID } from "@builderz/sold";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { createSplAssociatedTokenProgram, createSplTokenProgram, SPL_ASSOCIATED_TOKEN_PROGRAM_ID, findAssociatedTokenPda, safeFetchToken, createAssociatedToken } from "@metaplex-foundation/mpl-toolbox"
import { toast } from "sonner";
import { TransactionBuilder } from "@metaplex-foundation/umi"
// @ts-ignore
import bs58 from "bs58";

// TODO: Move this into npm package
const bigIntToFloat = (bigIntValue: bigint, decimals: number): number => {
    return Number(bigIntValue) / Math.pow(10, decimals);
};

export const useSold = () => {
    const [loading, setLoading] = useState(false);

    const [amount, setAmount] = useState(0);
    const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);
    const [poolManager, setPoolManager] = useState<PoolManager | null>(null);
    const [reset, setReset] = useState(0);
    const allowedWallets: (string | Uint8Array)[] = [];
    const [userBalancePUSD, setUserBalancePUSD] = useState(0);
    const [userBalanceUSDC, setUserBalanceUSDC] = useState(0);
    const [userBalanceSPUSD, setUserBalanceSPUSD] = useState(0);
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
        xSoldSupply: 0
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

        // Calculate exchange rate if poolManager is available
        if (poolManagerAcc) {
            const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
            const lastYieldChangeTimestamp = Number(poolManagerAcc.lastYieldChangeTimestamp); // Convert bigint to number
            const lastYieldChangeExchangeRate = Number(poolManagerAcc.lastYieldChangeExchangeRate); // Convert bigint to number
               const rate = calculateExchangeRate(
                lastYieldChangeTimestamp,
                currentTimestamp,
                Number(poolManagerAcc.annualYieldRate), // Convert bigint to number
                lastYieldChangeExchangeRate
            );
            setExchangeRate(rate);
        }

        // Stat stat cards
        tokenManagerAcc && (
            setStatCardData({
                totalSupply: bigIntToFloat(tokenManagerAcc.totalSupply, tokenManagerAcc.mintDecimals),
                usdcInPool: bigIntToFloat(tokenManagerAcc.totalCollateral, tokenManagerAcc.quoteMintDecimals),
                totalStaked: 0,
                xSoldSupply: 0
            })
        )

        setLoading(false);
    }

    if (wallet.publicKey) {
        fetchState()
    }
}, [wallet.publicKey, reset]);


  // Inside useSold hook, add logs to check fetched balances
    const getUserBalances = async () => {
        if (!tokenManager || !poolManager) {
            console.log("Token manager or pool manager not found");
            return;
        }

        const userBase = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: tokenManager.mint });
        const userQuote = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: tokenManager.quoteMint });
        // Correctly define xMint as a PublicKey
        const xMint = umi.eddsa.findPda(SOLD_STAKING_PROGRAM_ID, [Buffer.from("mint")])[0];

        const userBaseAtaAcc = await safeFetchToken(umi, userBase);
        const userQuoteAtaAcc = await safeFetchToken(umi, userQuote);
        const xMintAtaAcc = await safeFetchToken(umi, findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: xMint }));

        console.log("Fetched Balances:", userBaseAtaAcc?.amount, userQuoteAtaAcc?.amount, xMintAtaAcc?.amount); // Debug fetched balances including xMint

        setUserBalancePUSD(userBaseAtaAcc ? bigIntToFloat(userBaseAtaAcc.amount, tokenManager.mintDecimals) : 0);
        setUserBalanceUSDC(userQuoteAtaAcc ? bigIntToFloat(userQuoteAtaAcc.amount, tokenManager.quoteMintDecimals) : 0);
        setUserBalanceSPUSD(xMintAtaAcc ? bigIntToFloat(xMintAtaAcc.amount, 6) : 0); // Set balance for xMint
    }
    useEffect(() => {
        getUserBalances();
    }, [tokenManager, poolManager]);
    

    const refetch = () => {
        setReset(prev => prev + 1);
    }

  const annualYieldRate = poolManager ? (Number(poolManager.annualYieldRate) / 1000000000).toString() : '0';

  // Function to calculate exchanged amount
  const calculateExchangedAmount = (inputAmount: number) => {
    if (!poolManager) return;
    const rate = calculateExchangeRate(
      Number(poolManager.lastYieldChangeTimestamp),
      Math.floor(Date.now() / 1000),
      Number(poolManager.annualYieldRate),
      Number(poolManager.lastYieldChangeExchangeRate)
    );
    setExchangedAmount(inputAmount * rate);
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

    try {
        let txBuilder = new TransactionBuilder();

        // Find the PDAs
        let xMint = umi.eddsa.findPda(SOLD_STAKING_PROGRAM_ID, [Buffer.from("mint")])[0];
        const baseMint = umi.eddsa.findPda(SOLD_ISSUANCE_PROGRAM_ID, [Buffer.from("mint")])[0];
        const userBase = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: baseMint });
        const userX = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: xMint });
        const vaultStaking = findAssociatedTokenPda(umi, { owner: poolManager.publicKey, mint: baseMint });

        // Fetch token accounts
        const userBaseAtaAcc = await safeFetchToken(umi, userBase);
        if (!userBaseAtaAcc) {
            txBuilder = txBuilder.add(createAssociatedToken(umi, {
                mint: baseMint,
                owner: umi.identity.publicKey,
            }));
        }

        const userXAtaAcc = await safeFetchToken(umi, userX);
        if (!userXAtaAcc) {
            txBuilder = txBuilder.add(createAssociatedToken(umi, {
                mint: xMint,
                owner: umi.identity.publicKey,
            }));
        }

        const vaultAcc = await safeFetchToken(umi, vaultStaking);
        if (!vaultAcc) {
            txBuilder = txBuilder.add(createAssociatedToken(umi, {
                mint: baseMint,
                owner: poolManager.publicKey,
            }));
        }

        // Ensure quantity is properly calculated
        const quantity = amount * 10 ** 6; // Assuming 6 is the decimal for baseMint

        // Add stake instruction
        txBuilder = txBuilder.add(stake(umi, {
            poolManager: poolManager.publicKey,
            baseMint,
            xMint,
            payerBaseMintAta: userBase,
            payerXMintAta: userX,
            vault: vaultStaking,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
            quantity,
        }));

        // Send and confirm the transaction
        const resStake = await txBuilder.sendAndConfirm(umi, { send: { skipPreflight: true }, confirm: { commitment: "confirmed" } });
        console.log(bs58.encode(resStake.signature)); // Log the transaction signature in base58

        // Fetch account data after the transaction
        const userXAfter = await safeFetchToken(umi, userX);
        const vaultAfter = await safeFetchToken(umi, vaultStaking);

        // Log balances for debugging
        console.log('User XMint Balance After:', userXAfter?.amount);
        console.log('Vault BaseMint Balance After:', vaultAfter?.amount);

        toast("Staked successfully");
        refetch();
    } catch (error) {
        console.error("Failed to handle stake action:", error);
        toast.error("Failed to handle stake action");
        refetch();
    }

    setLoading(false);
}

    const handleUnstake = async (e: any) => {
        e.preventDefault();
        if (!tokenManager || !poolManager) {
            throw new Error("Token manager or pool manager not found");
        }

        setLoading(true);

        try {
            let txBuilder = new TransactionBuilder();

            let xMint = umi.eddsa.findPda(SOLD_STAKING_PROGRAM_ID, [Buffer.from("mint")])[0];
            const baseMintDecimals = 6;

            const baseMint = umi.eddsa.findPda(SOLD_ISSUANCE_PROGRAM_ID, [Buffer.from("mint")])[0];
            const userBase = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: baseMint });
            const userX = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: xMint });
            const vaultStaking = findAssociatedTokenPda(umi, { owner: poolManager.publicKey, mint: xMint });

            const userBaseAtaAcc = await safeFetchToken(umi, userBase);
            if (!userBaseAtaAcc) {
                txBuilder = txBuilder.add(createAssociatedToken(umi, {
                    mint: baseMint,
                    owner: umi.identity.publicKey,
                }));
            }

            const _stakePoolAcc = await safeFetchPoolManager(umi, poolManager.publicKey);
            const quantity = Number(_stakePoolAcc?.xSupply);

            txBuilder = txBuilder.add(unstake(umi, {
                poolManager: poolManager.publicKey,
                baseMint,
                xMint,
                payerBaseMintAta: userBase,
                payerXMintAta: userX,
                vault: vaultStaking,
                associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
                quantity,
                tokenManager: tokenManager.publicKey,  // Ensure tokenManager is of type PublicKey
                soldIssuanceProgram: SOLD_ISSUANCE_PROGRAM_ID,
            }));

            await txBuilder.sendAndConfirm(umi, { send: { skipPreflight: true }, confirm: { commitment: "confirmed" } });

            toast("Unstaked successfully");
            refetch();
        } catch (error) {
            console.error("Failed to handle unstake action:", error);
            toast.error("Failed to handle unstake action");
            refetch();
        }

        setLoading(false);
    }


    return { tokenManager, poolManager, refetch, loading, statCardData, userBalancePUSD, userBalanceUSDC , amount, setAmount, exchangedAmount, calculateExchangedAmount, exchangeRate, handleStake, handleUnstake, annualYieldRate};
};