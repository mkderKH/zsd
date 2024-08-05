'use client';
import React from "react";
import dynamic from 'next/dynamic';
const TopMenu = dynamic(() => import('../../../components/TopMenu'), { ssr: true });
import { MenuProvider } from "../../../components/MenuContext";
import FlashModule from '../../../components/Flash';

const Flash = () => {
  return <MenuProvider>
    <TopMenu />
    <FlashModule />
  </MenuProvider>;
};

export default Flash;
