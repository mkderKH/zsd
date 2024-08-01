import React from "react";
import dynamic from "next/dynamic";
const TopMenu = dynamic(() => import("../../../components/TopMenu"), {
  ssr: true,
});
import { MenuProvider } from "../../../components/MenuContext";
import Commonform from "../../../components/Commonform";

const Machine = () => {
  return (
    <MenuProvider>
      <TopMenu />
      <Commonform />
    </MenuProvider>
  );
};

export default Machine;
