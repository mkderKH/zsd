"use client";
import React, { useEffect, useContext, useRef, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import Image from "next/image";
import styles from "./index.module.scss";
import Top from "../Top";
import { useRouter } from "next/navigation";
import RightMenu from "../RightMenu";
import { MenuContext } from "../MenuContext";
import { copyToClipboard } from "../../public/clipboard";

const imageArray = [
  {
    link: `/Machine`,
    url: "https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/kj.png",
    name: "矿机",
    en: "MINING MACHINE",
  },
  {
    link: "/Personal",
    url: "https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/gxzx.png",
    name: "个人中心",
    en: "PERSONAL CENTER",
  },
  {
    link: "/Community",
    url: "https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/sq.png",
    name: "社区",
    en: "COMMUNITY",
  },
  {
    link: "/InCode",
    url: "https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/yqm.png",
    name: "邀请码",
    en: "INVITATION CODE",
  },
  {
    link: "/HomeLess",
    url: "https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/sy.png",
    name: "首页",
    en: "HOME",
  },
  {
    link: "/Flash",
    url: "https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/sd.png",
    name: "闪兑",
    en: "INSTANT EXCHANGE",
  },
];

const ClientMenu: React.FC = () => {
  const router = useRouter();
  const account: any = useActiveAccount();

  const goRoute = (url: any) => {
    router.push(url.link);
  };

  const handleCopyClick = () => {
    const textToCopy = `http://localhost:3000/HomeLess?ref=${account.address}`;
    copyToClipboard(textToCopy);
  };

  const { isRightMenuVisible, toggleRightMenu, hideRightMenu } =
    useContext(MenuContext);
  const containerRef = useRef(null);

  // const handleClickOutside = (event: any) => {
  //   if (containerRef.current && event.target.dataset.id !== "RightMenu") {
  //     hideRightMenu();
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [handleClickOutside]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (containerRef.current && event.target.dataset.id !== "RightMenu") {
        hideRightMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hideRightMenu]);
  return (
    <div className={styles.pageMenu}>
      {isRightMenuVisible && <RightMenu />}
      <Top onToggleRightMenu={toggleRightMenu} />
      <div className={styles.top} ref={containerRef}>
        {imageArray.map((v, i) => {
          if (v.link === "/InCode") {
            return (
              <div
                className={`${styles["menyBtn" + i]} ${styles.menyBtn}`}
                key={i}
                onClick={handleCopyClick}
              >
                <Image
                  className={`${styles["img" + i]}`}
                  src={v.url}
                  alt={v.name}
                  width={50}
                  height={50}
                />
                <div className={styles["menyBtn-n"]}>{v.name}</div>
                <div className={styles["menyBtn-e"]}>{v.en}</div>
              </div>
            );
          }
          return (
            <div
              className={`${styles["menyBtn" + i]} ${styles.menyBtn}`}
              key={i}
              onClick={() => goRoute(v)}
            >
              <Image
                className={`${styles["img" + i]}`}
                src={v.url}
                alt={v.name}
                width={50}
                height={50}
              />
              <div className={styles["menyBtn-n"]}>{v.name}</div>
              <div className={styles["menyBtn-e"]}>{v.en}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientMenu;
