"use client";
import React, { createContext, useState, ReactNode } from "react";

export const MenuContext = createContext({
  isRightMenuVisible: false,
  toggleRightMenu: () => { },
  hideRightMenu: () => { },
});

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [isRightMenuVisible, setRightMenuVisible] = useState(false);

  const toggleRightMenu = () => {
    setRightMenuVisible((prevState) => !prevState);
  };

  const hideRightMenu = () => {
    setRightMenuVisible(false);
  };

  return (
    <MenuContext.Provider
      value={{ isRightMenuVisible, toggleRightMenu, hideRightMenu }}
    >
      {children}
    </MenuContext.Provider>
  );
};
