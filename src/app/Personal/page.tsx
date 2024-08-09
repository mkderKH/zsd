import React from "react";
import dynamic from "next/dynamic";
const TopMenu = dynamic(() => import("../../../components/TopMenu"), {
  ssr: true,
});
import IndividualCenter from "../../../components/IndividualCenter";
import TransactionRecord from "../../../components/TransactionRecord";
import { MenuProvider } from "../../../components/MenuContext";
import MyTeam from "../../../components/MyTeam";

const Personal = () => {
  return (
    <MenuProvider>
      <TopMenu />
      <IndividualCenter />
      <MyTeam />
      <TransactionRecord />
    </MenuProvider>
  );
};

export default Personal;