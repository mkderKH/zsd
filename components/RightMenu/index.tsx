"use client";
import React, { useState } from "react";
import Image from "next/image";
import styles from "./index.module.scss";
import { useRouter } from "next/navigation";
import { copyToClipboard } from "../../public/clipboard";


const RightMenu: React.FC = () => {
  const router = useRouter();
  const handleCopyClick = () => {
    const textToCopy = "这里是你想要复制的文本1";
    copyToClipboard(textToCopy);
  };

  return (
    <div className={styles.rightMenu} data-id="RightMenu">
      <div
        data-id="RightMenu"
        className={styles.row}
        onClick={() => router.push("/HomeLess")}
      >
        <Image
          data-id="RightMenu"
          className={styles.img}
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/sy.png"
          alt="coin"
          width={50}
          height={50}
        />
        <div data-id="RightMenu" className={styles.text}>
          首页
        </div>
      </div>
      <div
        data-id="RightMenu"
        className={styles.row}
        onClick={() => router.push("/Machine")}
      >
        <Image
          data-id="RightMenu"
          className={styles.img}
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/kj.png"
          alt="coin"
          width={50}
          height={50}
        />
        <div data-id="RightMenu" className={styles.text}>
          矿机
        </div>
      </div>
      <div
        data-id="RightMenu"
        className={styles.row}
        onClick={() => router.push("/Flash")}
      >
        <Image
          data-id="RightMenu"
          className={styles.img}
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/sd.png"
          alt="coin"
          width={50}
          height={50}
        />
        <div data-id="RightMenu" className={styles.text}>
          闪兑
        </div>
      </div>
      <div
        data-id="RightMenu"
        className={styles.row}
        onClick={() => router.push("/Community")}
      >
        <Image
          data-id="RightMenu"
          className={styles.img}
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/sq.png"
          alt="coin"
          width={50}
          height={50}
        />
        <div data-id="RightMenu" className={styles.text}>
          社区
        </div>
      </div>
      <div
        data-id="RightMenu"
        className={styles.row}
        onClick={() => handleCopyClick()}
      >
        <Image
          data-id="RightMenu"
          className={styles.img}
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/yqm.png"
          alt="coin"
          width={50}
          height={50}
        />
        <div data-id="RightMenu" className={styles.text}>
          邀请码
        </div>
      </div>
      <div
        data-id="RightMenu"
        className={styles.row}
        onClick={() => router.push("/Personal")}
      >
        <Image
          data-id="RightMenu"
          className={styles.img}
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/grzx.png"
          alt="coin"
          width={50}
          height={50}
        />
        <div data-id="RightMenu" className={styles.text}>
          个人中心
        </div>
      </div>
    </div>
  );
};

export default RightMenu;
