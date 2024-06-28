"use client";

import { useConnection, useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Spin } from "antd";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import MyMultiButton from "./MyMultiButton";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from 'sonner';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useSold } from '@/hooks/useSold';
import { Jupiter, TOKEN_LIST_URL } from "@jup-ag/core";
import JSBI from 'jsbi';

const connection = new Connection(process.env.NEXT_PUBLIC_HELIUS_URL!);

const fetchQuote = async (amount: number, inputMint: string, outputMint: string, slippage: number) => {
  try {
    const response = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippage}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const quote = await response.json();
    return quote;
  } catch (error) {
    toast.error("Failed to fetch quote: " + error);
    return null;
  }
};

const prepareSwapTransaction = async (quote: any, walletPublicKey: PublicKey) => {
  try {
    const response = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: walletPublicKey.toString(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
      })
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const { swapTransaction } = await response.json();
    return Buffer.from(swapTransaction, 'base64');
  } catch (error) {
    toast.error("Failed to prepare swap transaction: " + error);
    return null;
  }
};

const signAndSendTransaction = async (transactionBuffer: Buffer | Uint8Array, wallet: WalletContextState) => {
  try {
    let transaction = VersionedTransaction.deserialize(transactionBuffer);

    if (wallet && wallet.signTransaction) {
      const signedTx = await wallet.signTransaction(transaction);
      const rawTransaction = signedTx.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
        preflightCommitment: "confirmed"
      });
      await connection.confirmTransaction(txid);
      toast.success(`Transaction successful: https://solscan.io/tx/${txid}`);
    } else {
      toast.error("Wallet is not connected or cannot sign transactions");
    }
  } catch (error) {
    toast.error("Transaction failed: " + error);
  }
};

const SwapComponent = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState(0);
  const [slippageModalOpen, setSlippageModalOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    stakingTab,
    setStakingTab,
    userBalancePUSD,
    userBalanceSPUSD,
    userBalanceUSDC,
    exchangedAmount
  } = useSold();

  const [swapDirection, setSwapDirection] = useState('buy'); // 'buy' for USDC -> USDT, 'sell' for USDT -> USDC
  const [buy, setBuy] = useState('buy'); // 'buy' for USDC -> USDT, 'sell' for USDT -> USDC

  const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
  const USDT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'; // USDT

  const INPUT_MINT_ADDRESS = swapDirection === 'buy' ? USDC : USDT;
  const OUTPUT_MINT_ADDRESS = swapDirection === 'buy' ? USDT : USDC;

  const [formValue, setFormValue] = useState({
    amount: 1 * 10 ** 6, // unit in lamports (Decimals)
    inputMint: new PublicKey(INPUT_MINT_ADDRESS),
    outputMint: new PublicKey(OUTPUT_MINT_ADDRESS),
    slippage: null, // 0.1%
  });

  const handleAmountChange = (event: { target: { value: string; }; }) => {
    setAmount(parseFloat(event.target.value));
  };

  const handleSwapDirectionChange = () => {
    setSwapDirection(swapDirection === 'buy' ? 'sell' : 'buy');
  };

  const fetchRoute = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${formValue.inputMint.toBase58()}&outputMint=${formValue.outputMint.toBase58()}&amount=${formValue.amount}&slippageBps=${formValue.slippage}`);
      const data = await response.json();
      if (data) {
        setRoutes(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    } finally {
      setLoading(false);
    }
  }, [formValue]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  const handleSwap = async () => {
    if (!wallet.publicKey) {
      toast.error("Wallet is not connected");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Swapping...");

    try {
      const quote = await fetchQuote(formValue.amount, formValue.inputMint.toBase58(), formValue.outputMint.toBase58(), slippage);
      if (!quote) {
        return;
      }

      const transactionBuffer = await prepareSwapTransaction(quote, wallet.publicKey);
      if (!transactionBuffer) {
        return;
      }

      await signAndSendTransaction(transactionBuffer, wallet);

      toast.success("Swap successful");
    } catch (error) {
      toast.error("Swap failed: " + error);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const SwapSlippageModal = () => {
    const [activeMode, setActiveMode] = useState(0.3);

    const modes = [
      { value: 0 },
      { value: 0.3 },
      { value: 0.5 },
      { value: 1 }
    ]


    const handleSaveSlippage = () => {
      setSlippage(activeMode);
      toast.success("Slippage settings saved!");
    };

    return (
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        // exit={{ y: -200, opacity: 0 }}
        className="absolute z-[99] bg-black bg-opacity-40 backdrop-blur-lg flex items-center justify-center inset-0 h-screen w-screen"
      >
        <div className="relative max-w-md min-h-20 bg-brand-black rounded-lg border border-white border-opacity-5 flex flex-col items-start justify-start p-4 w-full ">
          <div className="w-full flex items-center justify-between">
            <span className='text-xl font-bold'>Slippage Settings</span>
            <svg
              onClick={() => {
                setSlippageModalOpen(false)
              }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 hover:scale-105 ease-in-out transition-all duration-300 cursor-pointer"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>

          {/* mode */}
          <div className="w-full flex flex-col items-start justify-start my-8 gap-2">
            <span>Slippage:</span>
            <div className="flex items-center justify-between gap-2 w-full">
              {modes.map((mode, index) => (
                <button
                  key={index}
                  onClick={() => setActiveMode(mode.value)}
                  className={`border w-1/5 border-brand-secondary rounded-full px-3 py-1 transition-all duration-300 ease-in-out ${activeMode === mode.value ? 'bg-brand-secondary bg-opacity-40 text-brand-secondary' : 'text-white'}`}
                >
                  {mode.value}%
                </button>
              ))}
              <input
                type="number"
                placeholder={`${slippage.toString()}%`}
                className="border border-brand-secondary rounded-full px-3 py-1 transition-all duration-300 ease-in-out w-1/5"
                onChange={(e) => setActiveMode(parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* separator */}
          <div className="w-full h-[2px] bg-brand-secondary bg-opacity-30 mb-4"></div>

          {/* contents */}
          {/* {activeMode === 'Dynamic' && (
            <>
              <div className="w-full flex flex-col items-center justify-center my-2">
                <div className="w-full flex items-center justify-end gap-2">
                  <span className='text-base self-start mr-auto'>Max Slippage:</span>
                  <input
                    placeholder='3%'
                    type="number"
                    className=" border border-brand-secondary bg-brand-secondary bg-opacity-20 rounded-lg flex items-center justify-end text-end p-1"
                    value={slippage}
                    onChange={(e) => {
                      e.preventDefault();
                      const newSlippage = Number(e.target.value);
                      if (newSlippage !== slippage) { // Only update if the value has changed
                        setSlippage(newSlippage);
                      }
                    }}
                  />
                  <span className=''>%</span>
                </div>
                <p className='text-xs mt-4 opacity-50'>{ }</p>
              </div>
            </>
          )} */}

          {/* button */}
          <div className="w-full flex items-center justify-center mt-4">
            <button
              className={`w-full h-full rounded-lg bg-apy-gradient border border-brand-first text-transparent bg-clip-text py-4 px-8 disabled:cursor-not-allowed uppercase ${loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20 bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
              onClick={handleSaveSlippage}
            >
              {loading ? <Spin /> : 'Save Settings'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="w-full my-10 mt-20">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-start lg:items-center justify-center px-4 lg:px-0"
      >
        <div className="w-full max-w-lg bg-[#0B0D0F] rounded-lg shadow-md border border-[#191C1F] min-h-10">
          <div className="w-full flex flex-col items-start justify-start">

            <div className="w-full px-3 flex items-center justify-end mt-4 ">
              <div
                onClick={() => setSlippageModalOpen(true)}
                className="cursor-pointer border bg-white bg-opacity-0 hover:bg-opacity-10 ease-in-out transition-all duration-300 border-[#E5E7EB14] rounded-full px-3 py-1 flex items-center justify-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                </svg>
                <span className='text-xs'>Slippage</span>
              </div>
            </div>

            <motion.div
              className="p-4 w-full"
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative w-full rounded-xl flex flex-col items-center justify-center gap-4 p-4 px-0">
                {/* input */}
                <div className="w-full flex flex-col items-center justify-center gap-2">
                  <div className="w-full flex items-center justify-start">
                    <span className="text-sm font-semibold leading-6 text-white">You&apos;re giving</span>
                  </div>
                  <div className="relative w-full flex items-center justify-start">
                    <div className="flex items-center justify-center gap-2 absolute z-10 top-1/2 -translate-y-1/2 left-4 bg-[#0B0D0F] px-3 py-2 rounded-md">
                      <Image
                        width={40}
                        height={40}
                        src={buy === 'buy' ? "/usdc.svg" : "/pusd.png"}
                        alt="pusd"
                        className="w-7 h-7 rounded-full"
                      />
                      <div className="flex flex-col items-start justify-start gap-1">
                        <span className="font-bold uppercase text-[18px]">{buy === 'buy' ? 'USDC' : 'PUSD'}</span>
                      </div>
                    </div>
                    <input
                      type="number"
                      id="amount-buy"
                      className="w-full input text-end bg-[#1B1E24] px-16 pr-6 py-6 pb-10 relative !text-opacity-0 !text-transparent focus:text-opacity-0 !text-hidden selection:text-transparent selection:bg-transparent"
                      onChange={handleAmountChange}
                      value={amount}
                      onFocus={(e) => e.target.value = ""}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-end justify-end gap-1 pointer-events-none">
                      <span className="text-[14px] opacity-100 flex flex-col items-end justify-end -gap-0">
                        <span className="text-[20px] -mb-1 text-white">{amount}</span>
                      </span>
                      <div className="flex items-end justify-end gap-1">
                        <div className="flex items-center justify-end gap-1 pointer-events-none">
                          <span className="text-xs opacity-40">Balance:</span>
                          <span className="text-xs">{buy === 'buy' ? userBalanceUSDC.toLocaleString() : userBalancePUSD.toLocaleString()}</span>
                        </div>
                        <button
                          className="rounded-2xl text-[#3B42FF] hover:text-brand-secondary text-[12px] pl-2"
                          onClick={(e) => {
                            e.preventDefault();
                            setAmount(userBalancePUSD);
                          }}
                        >
                          Max
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* separator */}
                <div className="w-full h-[2px] bg-brand-secondary bg-opacity-10 flex items-center justify-center relative mt-4">
                  <motion.div
                    className="absolute w-10 h-10 bg-[#1B1E24] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex cursor-pointer hover:scale-105 ease-in-out duration-300 transition-all items-center justify-center border text-brand-secondary border-brand-secondary border-opacity-5 rounded-full"
                    onClick={handleSwapDirectionChange}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                    </svg>
                  </motion.div>
                </div>

                {/* output */}
                <div className="w-full flex flex-col items-center justify-center gap-2">
                  <div className="w-full flex items-center justify-start">
                    <span className="text-sm font-semibold leading-6 text-white">You receive</span>
                  </div>
                  <div className="relative w-full flex items-center justify-start">
                    <div className="flex items-center justify-center gap-2 absolute top-1/2 -translate-y-1/2 left-4 bg-[#0B0D0F] px-3 py-2 rounded-md z-20">
                      <Image
                        width={40}
                        height={40}
                        src={buy === 'buy' ? "/pusd.png" : "/usdc.svg"}
                        alt="spusd"
                        className="w-7 h-7 rounded-full"
                      />
                      <div className="flex flex-col items-start justify-start gap-1">
                        <span className="font-bold uppercase text-[18px]">{buy === "buy" ? "PUSD" : "USDC"}</span>
                      </div>
                    </div>
                    <input
                      type="number"
                      id="amount-buy"
                      disabled
                      value={exchangedAmount}
                      className="w-full input text-end bg-[#1B1E24] px-16 pr-6 py-6 pb-10 relative !text-opacity-0 !text-transparent"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-end justify-end gap-1 pointer-events-none">
                      <span className="text-[14px] opacity-100 flex flex-col items-end justify-end -gap-0">
                        <span className="text-[20px] -mb-1 text-white">{amount}</span>
                      </span>
                      <div className="flex items-end justify-end gap-1">
                        <div className="flex items-center justify-end gap-1 pointer-events-none">
                          <span className="text-xs opacity-40">Balance:</span>
                          <span className="text-xs">{buy === 'buy' ? userBalancePUSD.toLocaleString() : userBalanceSPUSD.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-thin leading-6 text-gray-200">{buy === "buy" ? `1 USDC = ${exchangedAmount} PUSD` : `1 PUSD = ${exchangedAmount} USDC`}</span>
                </div>
                <div>
                  <span className="text-xs font-thin leading-6 text-gray-200">Fees: $0</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-center relative z-0">
                {wallet.publicKey ? (
                  <button
                    className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-first ${loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20 bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
                    disabled={loading || amount === 0}
                    onClick={handleSwap}
                  >
                    {loading ? <Spin /> : (swapDirection === 'buy' ? "Buy" : "Sell")}
                  </button>
                ) : (
                  <MyMultiButton />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {slippageModalOpen && <SwapSlippageModal />}
    </section>
  );
};

export default SwapComponent;
