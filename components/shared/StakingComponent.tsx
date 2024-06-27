"use client";

import { useSold } from "@/hooks/useSold";
import { useWallet } from "@solana/wallet-adapter-react";
import { Spin } from "antd";
import React from "react";
import MyMultiButton from "./MyMultiButton";
import { motion } from "framer-motion";
import Image from "next/image";

export default function StakingComponent() {
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

  const value = 2412238490;

  return (
    <section className="w-full my-10 mt-20">
      {/* <div className="w-full flex flex-col items-center justify-center gap-2 my-20">
        <span className="text-[14px]">Total pUSD staked</span>
        <div className="w-full flex items-center justify-center gap-4">
          <img
            src="/pusd.png"
            alt="pusd"
            className="w-10 h-10 object-cover rounded-full"
          />
          <span className="text-[36px] font-semibold">
            {value.toLocaleString()}
          </span>
        </div>
      </div> */}
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-start lg:items-center justify-center px-4 lg:px-0"
      // style={{ height: "calc(100vh - 186px)" }}
      >
        <div className="w-full max-w-lg bg-[#0B0D0F] rounded-lg shadow-md border border-[#191C1F]  min-h-10">
          <div className="w-full flex flex-col items-start justify-start">
            {/* tabs */}
            <div className="w-full flex items-center justify-between gap-4">
              <div className="w-full flex items-center justify-between">
                <button
                  className={`w-1/2 flex items-center justify-center p-4  text-white rounded-tl-lg  hover:bg-opacity-40 cursor-pointer  border-r ${stakingTab === "stake" ? "bg-[#0B0D0F] font-black  border-r-[#E5E7EB0A] border-opacity-5" : "bg-[#060708] font-semibold hover:font-black border-transparent"} ease-in-out transition-all duration-300`}
                  onClick={() => setStakingTab("stake")}
                >
                  Stake
                </button>
                <button
                  className={`w-1/2 flex items-center justify-center p-4   text-white rounded-tr-lg  hover:bg-opacity-40 cursor-pointer border-l ${stakingTab === "unstake" ? "bg-[#0B0D0F] font-black border-l-[#E5E7EB0A] border-opacity-5" : "bg-[#060708] font-semibold hover:font-black border-transparent"} ease-in-out transition-all duration-300`}
                  onClick={() => setStakingTab("unstake")}
                >
                  Unstake
                </button>
                {/* <button
                  className={`w-1/2 py-1 text-sm font-semibold leading-6 transition-all ease-in-out duration-300 bg-white rounded-lg ${stakingTab === 'claim' ? 'bg-opacity-100 text-black ' : 'bg-opacity-0 hover:bg-opacity-20'}`}
                  onClick={() => setStakingTab('claim')}
                >
                  Claim
                </button> */}
              </div>

            </div>

            <div className="w-full px-3 flex items-center justify-start">
              <div className="bg-white bg-opacity-0 my-4 border border-white border-opacity-5 rounded-xl py-2 px-4 flex items-start justify-start gap-2 text-sm">
                <span>sPUSD APY</span>
                {annualYieldRate && wallet.publicKey && (
                  <span className="bg-apy-gradient text-transparent bg-clip-text">
                    {loading ? <> </> : <>{annualYieldRate}%</>}
                  </span>
                )}
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
                        You Stake
                      </span>
                    </div>
                    <div className="relative w-full flex items-center justify-start">
                      <div className="flex items-center justify-center gap-2 absolute top-1/2 -translate-y-1/2 left-4 bg-[#0B0D0F] px-3 py-2 rounded-md z-20">
                        <Image
                          width={40}
                          height={40}
                          src="/pusd.png"
                          alt="pusd"
                          className="w-7 h-7 rounded-full"
                        />
                        <div className=" flex flex-col items-start justify-start gap-1">
                          <span className="font-bold uppercase text-[18px]">
                            PUSD
                          </span>
                        </div>
                      </div>
                      <input
                        type="number"
                        id="amount-buy"
                        className="w-full input text-end bg-[#1B1E24] px-16 pr-6 py-6 pb-10 relative !text-opacity-0 !text-transparent"
                        onChange={handleAmountChange}
                        onFocus={(e) =>
                          e.target.value === "0" && (e.target.value = "")
                        }
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
                              {userBalancePUSD.toLocaleString()}
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
                  {/* <div className="w-full h-[2px] bg-brand-secondary bg-opacity-10 flex items-center justify-center relative">
                    <motion.div className="absolute w-12 h-8 bg-black left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center border text-brand-secondary border-brand-secondary border-opacity-10 rounded-lg ">
                      <motion.svg
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                        />
                      </motion.svg>
                    </motion.div>
                  </div> */}

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
                          src="/spusd.png"
                          alt="spusd"
                          className="w-7 h-7 rounded-full"
                        />
                        <div className=" flex flex-col items-start justify-start gap-1">
                          <span className="font-bold uppercase text-[18px]">
                            sPUSD
                          </span>
                        </div>
                      </div>
                      <input
                        type="number"
                        id="amount-buy"
                        disabled
                        className="w-full input text-end bg-[#1B1E24] px-16 pr-6 py-6 pb-10 relative !text-opacity-0 !text-transparent"
                        onChange={handleAmountChange}
                        onFocus={(e) =>
                          e.target.value === "0" && (e.target.value = "")
                        }
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
                              {userBalanceSPUSD.toLocaleString()}
                            </span>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* stats eligible */}
                <div className="mt-4 w-full flex items-center justify-end mb-4">
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

            {stakingTab === "unstake" && (
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
                        To receive
                      </span>
                    </div>
                    <div className="relative w-full flex items-center justify-start">
                      <div className="flex items-center justify-center gap-2 absolute top-1/2 -translate-y-1/2 left-4 bg-[#0B0D0F] px-3 py-2 rounded-md z-20">
                        <Image
                          width={40}
                          height={40}
                          src="/spusd.png"
                          alt="spusd"
                          className="w-7 h-7 rounded-full"
                        />
                        <div className=" flex flex-col items-start justify-start gap-1">
                          <span className="font-bold uppercase text-[18px]">
                            sPUSD
                          </span>
                        </div>
                      </div>
                      <input
                        type="number"
                        id="amount-buy"

                        className="w-full input text-end bg-[#1B1E24] px-16 pr-6 py-6 pb-10 relative !text-opacity-0 !text-transparent"
                        onChange={handleAmountChange}
                        onFocus={(e) =>
                          e.target.value === "0" && (e.target.value = "")
                        }
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
                              {userBalanceSPUSD.toLocaleString()}
                            </span>
                          </div>
                          <button
                            className="rounded-2xl text-[#3B42FF] hover:text-brand-secondary  text-[12px] pl-2"
                            onClick={(e) => {
                              e.preventDefault();
                              setAmount(userBalanceSPUSD);
                            }}
                          >
                            Max
                          </button>
                        </div>
                      </div>
                    </div>

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
                          src="/pusd.png"
                          alt="pusd"
                          className="w-7 h-7 rounded-full"
                        />
                        <div className=" flex flex-col items-start justify-start gap-1">
                          <span className="font-bold uppercase text-[18px]">
                            PUSD
                          </span>
                        </div>
                      </div>
                      <input
                        type="number"
                        id="amount-buy"
                        disabled
                        className="w-full input text-end bg-[#1B1E24] px-16 pr-6 py-6 pb-10 relative !text-opacity-0 !text-transparent"
                        onChange={handleAmountChange}
                        value={exchangedAmount}
                        onFocus={(e) =>
                          e.target.value === "0" && (e.target.value = "")
                        }
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
                              {userBalancePUSD.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* stats eligible */}
                <div className="mt-4 w-full flex items-center justify-end mb-4">
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
                      onClick={handleUnstake}
                    >
                      {loading && <Spin size="small" />} {!loading && `Unstake`}
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
    </section>
  );
}
