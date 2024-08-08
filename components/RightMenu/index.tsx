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
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmZUpyn6s8VTydE5sCsSF8ZP6NqZ8jK9ic5ZEeDLoCncYR/sy.png"
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
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmZUpyn6s8VTydE5sCsSF8ZP6NqZ8jK9ic5ZEeDLoCncYR/kj.png"
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
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmZUpyn6s8VTydE5sCsSF8ZP6NqZ8jK9ic5ZEeDLoCncYR/sd.png"
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
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmZUpyn6s8VTydE5sCsSF8ZP6NqZ8jK9ic5ZEeDLoCncYR/sq.png"
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
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmZUpyn6s8VTydE5sCsSF8ZP6NqZ8jK9ic5ZEeDLoCncYR/yqm.png"
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
          src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmZUpyn6s8VTydE5sCsSF8ZP6NqZ8jK9ic5ZEeDLoCncYR/grzx.png"
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
