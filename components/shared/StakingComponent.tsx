'use client'

import { useSold } from '@/hooks/useSold'
import { useWallet } from '@solana/wallet-adapter-react'
import { Spin } from 'antd'
import React from 'react'
import MyMultiButton from './MyMultiButton'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function StakingComponent() {
  const wallet = useWallet()

  const { amount, setAmount, loading, userBalancePUSD, userBalanceSPUSD, poolManager, exchangedAmount, handleStake, handleUnstake, annualYieldRate, stakingTab, setStakingTab } = useSold();

  const handleAmountChange = (event: { target: { value: any } }) => {
    setAmount(parseFloat(event.target.value));
  }

  return (
    <section className='w-full my-10'>
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-start lg:items-start justify-center px-4 lg:px-0"
        style={{ height: 'calc(100vh - 186px)' }}
      >
        <div className="w-full max-w-lg bg-brand-bg rounded-lg shadow-md border border-white border-opacity-10 overflow-hidden">
          <div className="w-full flex flex-col items-center justify-center">
            {/* tabs */}
            <div className="w-full flex items-center justify-between gap-4 p-2">
              <div className="w-3/5 flex items-center justify-start border border-white border-opacity-10 rounded-xl gap-1">
                <button
                  className={`w-1/2 py-1 text-sm font-semibold leading-6 transition-all ease-in-out duration-300 bg-white rounded-lg ${stakingTab === 'stake' ? 'bg-opacity-100 text-black ' : 'bg-opacity-0 hover:bg-opacity-20'}`}
                  onClick={() => setStakingTab('stake')}
                >
                  Stake
                </button>
                <button
                  className={`w-1/2 py-1 text-sm font-semibold leading-6 transition-all ease-in-out duration-300 bg-white rounded-lg ${stakingTab === 'unstake' ? 'bg-opacity-100 text-black ' : 'bg-opacity-0 hover:bg-opacity-20'}`}
                  onClick={() => setStakingTab('unstake')}
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
              <div className="w-2/5 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl py-1 flex items-center justify-center gap-2 text-sm">
                <span>sPUSD APY</span>
                {
                  annualYieldRate && wallet.publicKey && <span className='text-brand-secondary'>{loading ? <> </> : <>{annualYieldRate}%</>}</span>
                }
              </div>
            </div>

            {/* content */}
            {
              stakingTab === 'stake' &&
              <motion.div className='p-2'
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative w-full bg-brand-black border border-white border-opacity-10 rounded-xl flex flex-col items-center justify-center gap-4 p-4">
                  {/* input */}
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="w-full flex items-center justify-start">
                      <span className="text-sm font-semibold leading-6 text-white">You Stake</span>
                    </div>
                    {/* input */}
                    <div className="w-full flex items-center justify-between gap-4">
                      <input
                        onChange={handleAmountChange}
                        value={amount}
                        type='number'
                        placeholder='0'
                        className="input w-2/3 focus:bg-transparent input-ghost text-4xl font-semibold leading-6 text-white"
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                      ></input>
                      <div className="w-1/3 flex items-center justify-start gap-4 bg-white bg-opacity-5 border border-white border-opacity-20 py-2 px-4 rounded-xl">
                        <Image width={20} height={20} src="/usdc.png" alt="" className='w-4 h-4 object-center' />
                        <span className="text-sm font-semibold leading-6 text-white">PUSD</span>
                      </div>
                    </div>
                    {/* balance */}
                    <div className="w-full flex items-center justify-end gap-2 pr-2">
                      <span className="text-[10px] font-semibold leading-6 text-gray-500">Balance: {userBalancePUSD.toLocaleString()}</span>
                      <span className='text-[10px] text-brand-secondary text-opacity-60 hover:text-opacity-100 cursor-pointer'
                        onClick={() => setAmount(userBalancePUSD)}
                      >Max</span>
                    </div>
                  </div>

                  {/* separator */}
                  <div className="w-full h-[2px] bg-brand-secondary bg-opacity-10 flex items-center justify-center relative">
                    <motion.div

                      className="absolute w-12 h-8 bg-black left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center border text-brand-secondary border-brand-secondary border-opacity-10 rounded-lg "
                    >
                      <motion.svg
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                      </motion.svg>
                    </motion.div>
                  </div>



                  {/* output */}
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="w-full flex items-center justify-start">
                      <span className="text-sm font-semibold leading-6 text-white">You receive</span>
                    </div>
                    {/* output input field */}
                    <div className="w-full flex items-center justify-between gap-4">
                      <input disabled value={exchangedAmount} type='number' placeholder='0' className="input disabled:bg-transparent -ml-4 border-0 w-2/3 input-ghost text-4xl font-semibold leading-6 text-white"></input>
                      <div className="w-1/3 flex items-center justify-start gap-4 bg-white bg-opacity-0 border border-white border-opacity-10 py-2 px-4 rounded-xl">
                        <Image width={20} height={20} src="/usdc.png" alt="" className='w-4 h-4 object-center opacity-80' />
                        <span className="text-sm font-semibold leading-6 text-white text-opacity-60">sPUSD</span>
                      </div>
                    </div>
                    {/* balance */}
                    <div className="w-full flex items-center justify-end gap-2 pr-2">
                      <span className="text-[10px] font-semibold leading-6 text-gray-500">Balance: {userBalanceSPUSD.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* stats eligible */}
                <div className="mt-4 w-full flex items-center justify-between p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Image width={20} height={20} src="/usdc.png" alt="" className='w-4 h-4 object-center' />
                    <span className="text-sm font-thin leading-6 text-gray-200">Stats Eligible</span>
                  </div>
                  <div className="">
                    <span className="text-sm font-thin leading-6 text-gray-200">Fees: $0</span>
                  </div>
                </div>

                {/* banner */}
                {/* <div className="w-full bg-white bg-opacity-10 rounded-xl flex items-center justify-center gap-4 p-2 my-4">
                  <Image width={20} height={20} src="/usdc.png" alt="" className='w-4 h-4 object-center' />
                  <span className="text-sm font-semibold leading-6 text-white">sPUSD will be available to claim 7 days after unstaking.</span>
                </div> */}

                {/* button */}
                <div className="w-full flex items-center justify-center">
                  {
                    wallet.publicKey ? <button
                      className={`w-full h-full rounded-lg text-brand-secondary py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-secondary ${loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-10 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
                      disabled={loading || amount === 0}
                      onClick={handleStake}
                    >
                      {loading && <Spin size='small' />} {!loading && `Stake`}
                    </button> : <MyMultiButton />
                  }
                </div>

              </motion.div>
            }

            {
              stakingTab === 'unstake' &&
              <motion.div className='p-2'
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative w-full bg-brand-black border border-white border-opacity-10 rounded-xl flex flex-col items-center justify-center gap-4 p-4">
                  {/* input */}
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="w-full flex items-center justify-start">
                      <span className="text-sm font-semibold leading-6 text-white">You unstake</span>
                    </div>
                    {/* input */}
                    <div className="w-full flex items-center justify-between gap-4">
                      <input
                        onChange={handleAmountChange}
                        type='number'
                        value={amount}
                        placeholder='0'
                        className="input w-2/3 focus:bg-transparent input-ghost text-4xl font-semibold leading-6 text-white"
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                      ></input>
                      <div className="w-1/3 flex items-center justify-start gap-4 bg-white bg-opacity-5 border border-white border-opacity-20 py-2 px-4 rounded-xl">
                        <Image width={20} height={20} src="/usdc.png" alt="" className='w-4 h-4 object-center' />
                        <span className="text-sm font-semibold leading-6 text-white">sPUSD</span>
                      </div>
                    </div>
                    {/* balance */}
                    <div className="w-full flex items-center justify-end gap-2 pr-2">
                      <span className="text-[10px] font-semibold leading-6 text-gray-500">Balance: {userBalanceSPUSD.toLocaleString()}</span>
                      <span className='text-[10px] text-brand-secondary text-opacity-60 hover:text-opacity-100 cursor-pointer'
                        onClick={() => setAmount(userBalanceSPUSD)}
                      >Max</span>
                    </div>
                  </div>

                  {/* separator */}
                  <div className="w-full h-[2px] bg-brand-secondary bg-opacity-10 flex items-center justify-center relative">
                    <div className="absolute w-12 h-8 bg-black left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center border text-brand-secondary border-brand-secondary border-opacity-10 rounded-lg ">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                      </svg>
                    </div>
                  </div>


                  {/* output */}
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="w-full flex items-center justify-start">
                      <span className="text-sm font-semibold leading-6 text-white">You receive</span>
                    </div>
                    {/* input field */}
                    <div className="w-full flex items-center justify-between gap-4">
                      <input disabled value={exchangedAmount} type='number' placeholder='0' className="input disabled:bg-transparent -ml-4 border-0 w-2/3 input-ghost text-4xl font-semibold leading-6 text-white"></input>
                      <div className="w-1/3 flex items-center justify-start gap-4 bg-white bg-opacity-5 border border-white border-opacity-20 py-2 px-4 rounded-xl">
                        <Image width={20} height={20} src="/usdc.png" alt="" className='w-4 h-4 object-center' />
                        <span className="text-sm font-semibold leading-6 text-white">PUSD</span>
                      </div>
                    </div>
                    {/* balance */}
                    <div className="w-full flex items-center justify-end gap-2 pr-2">
                      <span className="text-[10px] font-semibold leading-6 text-gray-500">Balance: {userBalancePUSD.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* stats eligible */}
                <div className="mt-4 w-full flex items-center justify-between p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Image width={20} height={20} src="/usdc.png" alt="" className='w-4 h-4 object-center' />
                    <span className="text-sm font-thin leading-6 text-gray-200">Stats Eligible</span>
                  </div>
                  <div className="">
                    <span className="text-sm font-thin leading-6 text-gray-200">Fees: $0</span>
                  </div>
                </div>

                {/* banner */}
                {/* <div className="w-full bg-white bg-opacity-10 rounded-xl flex items-center justify-center gap-4 p-2 my-4">
                  <img src="/usdc.png" alt="" className='w-4 h-4 object-center' />
                  <span className="text-sm font-semibold leading-6 text-white">USDe will be available to claim 7 days after unstaking.</span>
                </div> */}

                {/* button */}
                <div className="w-full flex items-center justify-center">
                  {
                    wallet.publicKey ? <button
                      className={`w-full h-full rounded-lg text-brand-secondary py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-secondary ${loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-10 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
                      disabled={loading || amount === 0}
                      onClick={handleUnstake}
                    >
                      {loading && <Spin size='small' />} {!loading && `Unstake`}
                    </button> : <MyMultiButton />
                  }
                </div>

              </motion.div>
            }

          </div>
        </div>
      </motion.div>
    </section>
  )
}
