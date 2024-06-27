"use client";

import { useSold } from "@/hooks/useSold";
import { useWallet } from "@solana/wallet-adapter-react";
import { Spin } from "antd";
import React, { useState } from "react";
import MyMultiButton from "./MyMultiButton";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SwapComponent() {
  const wallet = useWallet();

  const {
    amount,
    setAmount,
    loading,
    userBalancePUSD,
    userBalanceSPUSD,
    poolManager,
    exchangedAmount,
    handleStake,
    handleUnstake,
    annualYieldRate,
    stakingTab,
    setStakingTab,
  } = useSold();

  const handleAmountChange = (event: { target: { value: any } }) => {
    setAmount(parseFloat(event.target.value));
  };

  const [buy, setBuy] = useState('buy')

  const [slippageModalOpen, setSlippageModalOpen] = useState(false)


  const SwapSlippageModal = () => {

    return (
      <>
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -200, opacity: 0 }}
          className="absolute z-[99] bg-black bg-opacity-40 backdrop-blur-lg flex items-center justify-center inset-0 h-screen w-screen"
        >
          <div className="relative max-w-md min-h-20 bg-brand-black rounded-lg border border-white border-opacity-5 flex flex-col items-start justify-start p-4 w-full ">
            <div className="w-full flex items-center justify-end">
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
            <span>Set Slippage</span>
          </div>
        </motion.div>
      </>
    )
  }

  return (
    <section className="w-full my-10 mt-20">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-start lg:items-center justify-center px-4 lg:px-0"
      >
        <div className="w-full max-w-lg bg-[#0B0D0F] rounded-lg shadow-md border border-[#191C1F]  min-h-10">
          <div className="w-full flex flex-col items-start justify-start">

            <div className="w-full px-3 flex items-center justify-end mt-4 ">
              <div
                onClick={() => {
                  setSlippageModalOpen(true)
                }}
                className="cursor-pointer border bg-white bg-opacity-0 hover:bg-opacity-10 ease-in-out transition-all duration-300 border-[#E5E7EB14] rounded-full px-3 py-1 flex items-center justify-center gap-1 "
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                </svg>
                <span className='text-xs'>Slippage</span>
              </div>
            </div>

            {/* content */}
            {stakingTab === "stake" && (
              <motion.div
                className="p-4 w-full"
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative w-full   rounded-xl flex flex-col items-center justify-center gap-4 p-4 px-0">
                  {/* input */}
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="w-full flex items-center justify-start">
                      <span className="text-sm font-semibold leading-6 text-white">
                        You&apos;re giving
                      </span>
                    </div>
                    <div className="relative w-full flex items-center justify-start">
                      <div className="flex items-center justify-center gap-2 absolute z-10 top-1/2 -translate-y-1/2 left-4 bg-[#0B0D0F] px-3 py-2 rounded-md ">
                        <Image
                          width={40}
                          height={40}
                          src={buy === 'buy' ? "/usdc.svg" : "/pusd.png"}
                          alt="pusd"
                          className="w-7 h-7 rounded-full"
                        />
                        <div className=" flex flex-col items-start justify-start gap-1">
                          <span className="font-bold uppercase text-[18px]">
                            {buy === 'buy' ? 'USDC' : 'PUSD'}
                          </span>
                        </div>
                      </div>
                      <input
                        type="number"
                        id="amount-buy"
                        className="w-full input text-end bg-[#1B1E24] px-16 pr-6 py-6 pb-10 relative !text-opacity-0 !text-transparent focus:text-opacity-0 !text-hidden selection:text-transparent selection:bg-transparent "
                        onChange={handleAmountChange}
                        value={amount}
                        onFocus={(e) => e.target.value = ""}
                      />

                      <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-end justify-end gap-1 pointer-events-none">
                        <span className="text-[14px] opacity-100 flex flex-col items-end justify-end -gap-0">
                          <span className="text-[20px] -mb-1 text-white">
                            {amount}
                          </span>
                          {/* <span className="text-xs opacity-50">{amount}</span> */}
                        </span>
                        <div className="flex items-end justify-end gap-1">
                          <div className="flex items-center justify-end gap-1 pointer-events-none">
                            <span className="text-xs opacity-40">Balance:</span>
                            <span className="text-xs ">
                              {buy === 'buy' ? userBalanceSPUSD.toLocaleString() : userBalancePUSD.toLocaleString()}
                            </span>
                          </div>
                          <button
                            className="rounded-2xl text-[#3B42FF] hover:text-brand-secondary  text-[12px] pl-2"
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
                      className="absolute w-10 h-10 bg-[#1B1E24] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex cursor-pointer hover:scale-105 ease-in-out duration-300 transition-all items-center justify-center border text-brand-secondary border-brand-secondary border-opacity-5 rounded-full "
                      onClick={() => setBuy(buy === 'buy' ? 'sell' : 'buy')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* output */}
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="w-full flex items-center justify-start">
                      <span className="text-sm font-semibold leading-6 text-white">
                        You receive
                      </span>
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
                        <div className=" flex flex-col items-start justify-start gap-1">
                          <span className="font-bold uppercase text-[18px]">
                            {buy === "buy" ? "PUSD" : "USDC"}
                          </span>
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
                          <span className="text-[20px] -mb-1 text-white">
                            {amount}
                          </span>
                          {/* <span className="text-xs opacity-50">{amount}</span> */}
                        </span>
                        <div className="flex items-end justify-end gap-1">
                          <div className="flex items-center justify-end gap-1 pointer-events-none">
                            <span className="text-xs opacity-40">Balance:</span>
                            <span className="text-xs ">
                              {
                                buy === 'buy' ? userBalancePUSD.toLocaleString() : userBalanceSPUSD.toLocaleString()
                              }
                            </span>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* stats eligible */}
                <div className="mt-4 w-full flex items-center justify-between mb-2">
                  <div className="">
                    <span className="text-xs font-thin leading-6 text-gray-200">
                      {
                        buy === "buy" ? `1 USDC = ${exchangedAmount} PUSD` : `1 PUSD = ${exchangedAmount} USDC`
                      }
                    </span>
                  </div>
                  <div className="">
                    <span className="text-xs font-thin leading-6 text-gray-200">
                      Fees: $0
                    </span>
                  </div>
                </div>

                {/* button */}
                <div className="w-full flex items-center justify-center">
                  {wallet.publicKey ? (
                    <button
                      className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-first ${loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
                      disabled={loading || amount === 0}
                      onClick={handleStake}
                    >
                      {loading && <Spin size="small" />} {!loading && `Stake`}
                    </button>
                  ) : (
                    <MyMultiButton />
                  )}
                </div>
              </motion.div>
            )}


          </div>
        </div>
      </motion.div>

      {
        slippageModalOpen && <SwapSlippageModal />
      }
    </section>
  );
}
