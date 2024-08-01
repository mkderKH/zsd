"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { MenuProvider } from "../../../components/MenuContext";
const TopMenu = dynamic(() => import("../../../components/TopMenu"), {
  ssr: true,
});

const InCode = () => {
  return (
    <MenuProvider>
      <TopMenu />
    </MenuProvider>
  );
};

export default InCode;
