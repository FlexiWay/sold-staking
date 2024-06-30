import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return <>
    <div className="w-full h-screen flex flex-col items-center justify-start pt-20 gap-4">
      <div className="w-full flex items-center">
        <Image
          src="/logo.svg"
          width={140}
          height={140}
          alt=""
          className="max-w-2/4 md:max-w-2/4 xl:max-w-1/4 w-3/4 mx-auto cursor-pointer"
        />
      </div>
      <div className="w-full flex items-center justify-center gap-8 mt-12">
        <Link href="/swap" passHref>
          <span
            className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-first disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
          >
            Buy
          </span>
        </Link>
        <Link href="/staking" passHref>
          <span
            className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-first disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
          >
            Stake
          </span>
        </Link>
      </div>
    </div>
  </>;
}
