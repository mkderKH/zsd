import React from "react";
import dynamic from "next/dynamic";
const TopMenu = dynamic(() => import("../../../components/TopMenu"), {
  ssr: true,
});
import IndividualCenter from "../../../components/IndividualCenter";
import TransactionRecord from "../../../components/TransactionRecord";
import { MenuProvider } from "../../../components/MenuContext";
const Personal = () => {
  return (
    <MenuProvider>
      <TopMenu />
      <IndividualCenter />
      <TransactionRecord />
    </MenuProvider>
  );
};

export default Personal;