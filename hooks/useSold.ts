import { safeFetchPoolManager, safeFetchTokenManager, findPoolManagerPda, findTokenManagerPda, PoolManager, TokenManager,  createTestQuote, SetupOptions, toggleActive, setup, mint, redeem, getMerkleProof, SOLD_ISSUANCE_PROGRAM_ID, calculateExchangeRate } from "@builderz/sold";
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
            try {
                const tokenManagerAcc = await safeFetchTokenManager(umi, tokenManagerPubKey);
                const poolManagerAcc = await safeFetchPoolManager(umi, poolManagerPubKey);

                setTokenManager(tokenManagerAcc);
                setPoolManager(poolManagerAcc);

                if (poolManagerAcc) {
                    const currentTimestamp = Math.floor(Date.now() / 1000);
                    const rate = calculateExchangeRate(
                        Number(poolManagerAcc.lastYieldChangeTimestamp),
                        currentTimestamp,
                        Number(poolManagerAcc.annualYieldRate),
                        Number(poolManagerAcc.lastYieldChangeExchangeRate)
                    );
                    setExchangeRate(rate);
                }

                if (tokenManagerAcc) {
                    setStatCardData({
                        totalSupply: bigIntToFloat(tokenManagerAcc.totalSupply, tokenManagerAcc.mintDecimals),
                        usdcInPool: bigIntToFloat(tokenManagerAcc.totalCollateral, tokenManagerAcc.quoteMintDecimals),
                        totalStaked: 0,
                        xSoldSupply: 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch state:", error);
            }
            setLoading(false);
        };

        if (wallet.publicKey) {
            fetchState();
        }
    }, [wallet.publicKey, reset, umi, tokenManagerPubKey, poolManagerPubKey]);

    useEffect(() => {
        const getUserBalances = async () => {
            if (!tokenManager || !poolManager) {
                console.log("Token manager or pool manager not found");
                return;
            }

            try {
                const userBase = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: tokenManager.mint });
                const userQuote = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: tokenManager.quoteMint });

                const userBaseAtaAcc = await safeFetchToken(umi, userBase);
                const userQuoteAtaAcc = await safeFetchToken(umi, userQuote);

                setUserBalancePUSD(userBaseAtaAcc ? bigIntToFloat(userBaseAtaAcc.amount, tokenManager.mintDecimals) : 0);
                setUserBalanceUSDC(userQuoteAtaAcc ? bigIntToFloat(userQuoteAtaAcc.amount, tokenManager.quoteMintDecimals) : 0);
            } catch (error) {
                console.error("Failed to fetch user balances:", error);
            }
        };

        getUserBalances();
    }, [tokenManager, poolManager, umi]);

    const refetch = () => {
        setReset(prev => prev + 1);
    }

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

    return { tokenManager, poolManager, refetch, loading, statCardData, userBalancePUSD, userBalanceUSDC , amount, setAmount, exchangedAmount, calculateExchangedAmount, exchangeRate};
};