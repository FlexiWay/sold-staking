'use client'

import { usePathname } from 'next/navigation';
import React from "react";
import { FaTwitter, FaLinkedin } from "react-icons/fa";
import { TbWorldWww } from "react-icons/tb";

function Footer() {
  const pathname = usePathname();

  return (
    <footer className={`w-full flex items-center ${pathname === "/" ? "justify-center absolute bottom-0" : "justify-start relative"} lg:absolute  lg:bottom-0 container mx-auto sm:px-6 lg:px-8 gap-2   z-50 p-4`}>
      {/* <span className="text-xs">Powered by @ 2024 Parity Finance</span> */}
      <div className="flex items-center justify-center gap-2">
        <a
          href="https://twitter.com/parityfinance"
          target="_blank"
          rel="noreferrer"
          className="text-xs opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
        >
          <FaTwitter size={16} />
        </a>
        <a
          href="https://twitter.com/parityfinance"
          target="_blank"
          rel="noreferrer"
          className="text-xs opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
        >
          <TbWorldWww size={16} />
        </a>
        <a
          href="https://twitter.com/parityfinance"
          target="_blank"
          rel="noreferrer"
          className="text-xs opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
        >
          <FaLinkedin size={16} />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
