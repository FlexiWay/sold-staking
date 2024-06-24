import ContextProvider from "@/context/ContextProvider";
import React from "react";

/**
 *
 * @param Children --> This will be the rendered component in the current page
 * @returns --> A wrapper of providers such as Session, WalletContext around the Children param
 */
type LayoutWrapperProps = {
  children: React.ReactNode;
};

const LayoutWrapper: React.FC<LayoutWrapperProps> = async ({ children }) => {
  return (
    <>
      <ContextProvider>{children}</ContextProvider>
    </>
  );
};

export default LayoutWrapper;
