'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import React, { useState } from 'react'
import MyMultiButton from './MyMultiButton'

export default function MainComponent() {
  const wallet = useWallet()
  const [leftTab, setLeftTab] = useState(true)

  return (
    <section className='w-full my-10'>
      <div
        className="w-full flex items-center justify-center"
        style={{ height: 'calc(100vh - 104px)' }}
      >

        <div className="w-full max-w-md bg-brand-bg rounded-lg shadow-md border border-white border-opacity-10 min-h-10">
          {/* tabs */}
          <div className="w-full flex items-center justify-between">
            <div
              className={`w-1/2 flex items-center justify-center p-4 bg-green-300 bg-opacity-10 text-green-300 rounded-tl-lg uppercase hover:bg-opacity-40 cursor-pointer font-bold  ${leftTab ? 'bg-opacity-20 text-opacity-100 ' : 'text-opacity-50'} ease-in-out transition-all duration-300`}
              onClick={() => setLeftTab(true)}
            >
              Buy
            </div>
            <div
              className={`w-1/2 flex items-center justify-center p-4 bg-brand-main bg-opacity-10 text-brand-main rounded-tr-lg uppercase hover:bg-opacity-40 cursor-pointer font-bold  ${!leftTab ? 'bg-opacity-20 text-opacity-100 ' : 'text-opacity-50'} ease-in-out transition-all duration-300`}
              onClick={() => setLeftTab(false)}
            >
              Sell
            </div>
          </div>

          {/* content  */}
          {
            leftTab ? <form className="w-full flex flex-col items-center justify-start gap-6 p-6 py-8">
              {/* from */}
              <div className="w-full flex flex-col items-start justify-start gap-2">
                <span className='text-xs'>FROM</span>
                <div className="relative w-full flex items-center justify-start">
                  <img src="/usdc.png" alt="usdc" className='w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2' />
                  <input type="number" className='w-full input input-bordered bg-transparent px-12 pr-4 py-2' placeholder='100' />
                  <span className='absolute top-1/2 -translate-y-1/2 right-6'>USDC</span>
                </div>
              </div>
              {/* to */}
              <div className="w-full flex flex-col items-start justify-start gap-2">
                <span className='text-xs'>TO</span>
                <div className="relative w-full flex items-center justify-start">
                  <img src="/usdc.png" alt="usdc" className='w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2' />
                  <input type="number" disabled className='w-full input input-bordered bg-transparent px-12 pr-4 py-2' placeholder='100' />
                  <span className='absolute top-1/2 -translate-y-1/2 right-6'>xSOLD</span>
                </div>
              </div>

              {/* stats */}
              <div className="w-full flex flex-col items-start justify-start gap-4 mt-8 opacity-60">
                {/* price */}
                <div className="w-full flex items-center justify-between">
                  <span className='text-xs uppercase'>Price</span>
                  <span className='text-xs '>1 xSOLD PER USDC</span>
                </div>
                {/* slippage tolerance */}
                <div className="w-full flex items-center justify-between">
                  <span className='text-xs uppercase'>Slippage tolerance</span>
                  <span className='text-xs '>-</span>
                </div>
                {/* minimum received */}
                <div className="w-full flex items-center justify-between">
                  <span className='text-xs uppercase'>Minimum received</span>
                  <span className='text-xs '>100 xSOLD</span>
                </div>
                {/* swap fee */}
                <div className="w-full flex items-center justify-between">
                  <span className='text-xs uppercase'>Swap fee</span>
                  <span className='text-xs '>0.00%</span>
                </div>

              </div>


              {/* button */}
              <div className="w-full flex items-center justify-center">
                {
                  wallet.publicKey ? <button className='w-full h-full rounded-lg text-green-500 py-4 px-8 uppercase bg-green-500 bg-opacity-0 hover:bg-opacity-10 ease-in-out transition-all duration-300'>
                    Buy
                  </button> : <MyMultiButton />
                }
              </div>
            </form>
              :
              // right side
              <>
                <form className="w-full flex flex-col items-center justify-start gap-6 p-6 py-8">
                  {/* from */}
                  <div className="w-full flex flex-col items-start justify-start gap-2">
                    <span className='text-xs'>FROM</span>
                    <div className="relative w-full flex items-center justify-start">
                      <img src="/usdc.png" alt="xsold" className='w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2' />
                      <input type="number" className='w-full input input-bordered bg-transparent px-12 pr-4 py-2' placeholder='100' />
                      <span className='absolute top-1/2 -translate-y-1/2 right-6'>xSOLD</span>
                    </div>
                  </div>
                  {/* to */}
                  <div className="w-full flex flex-col items-start justify-start gap-2">
                    <span className='text-xs'>TO</span>
                    <div className="relative w-full flex items-center justify-start">
                      <img src="/usdc.png" alt="usdc" className='w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2' />
                      <input type="number" disabled className='w-full input input-bordered bg-transparent px-12 pr-4 py-2' placeholder='100' />
                      <span className='absolute top-1/2 -translate-y-1/2 right-6'>USDC</span>

                    </div>
                  </div>

                  {/* stats */}
                  <div className="w-full flex flex-col items-start justify-start gap-4 mt-8 opacity-60">
                    {/* price */}
                    <div className="w-full flex items-center justify-between">
                      <span className='text-xs uppercase'>Price</span>
                      <span className='text-xs '>1 USDC PER xSOLD</span>
                    </div>
                    {/* slippage tolerance */}
                    <div className="w-full flex items-center justify-between">
                      <span className='text-xs uppercase'>Slippage tolerance</span>
                      <span className='text-xs '>-</span>
                    </div>
                    {/* minimum received */}
                    <div className="w-full flex items-center justify-between">
                      <span className='text-xs uppercase'>Minimum received</span>
                      <span className='text-xs '>100 USDC</span>
                    </div>
                    {/* swap fee */}
                    <div className="w-full flex items-center justify-between">
                      <span className='text-xs uppercase'>Swap fee</span>
                      <span className='text-xs '>0.00%</span>
                    </div>

                  </div>


                  {/* button */}
                  <div className="w-full flex items-center justify-center">
                    {
                      wallet.publicKey ? <button className='w-full h-full rounded-lg text-brand-main py-4 px-8 uppercase bg-brand-main bg-opacity-0 hover:bg-opacity-10 ease-in-out transition-all duration-300'>
                        Sell
                      </button> : <MyMultiButton />
                    }
                  </div>
                </form>
              </>
          }

        </div>


      </div>
    </section>
  )
}
