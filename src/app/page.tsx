import React from "react";
import dynamic from "next/dynamic";
import { MenuProvider } from "../../components/MenuContext";
const HomeLess = dynamic(() => import("./HomeLess/page"), { ssr: false });

const HomePage: React.FC = () => {
  return (
    <MenuProvider>
      <HomeLess />
    </MenuProvider>
  );
};

export default HomePage;
