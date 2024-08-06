"use client";
import Image from "next/image";
import styles from "./index.module.scss";
import CallWallet from "../CallWallet";
interface TopProps {
  onToggleRightMenu: () => void;
}
const TopMenu: React.FC<TopProps> = ({ onToggleRightMenu }) => {
  return (
    <div className={styles.pagetop}>
      <Image
        className={styles.m1}
        src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/coin.png"
        alt="coin"
        width={50}
        height={50}
      />

      <CallWallet />

      <Image
        className={styles.m2}
        src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/selectorSwitch.png"
        alt="selectorSwitch"
        width={50}
        height={50}
      />
      <Image
        onClick={onToggleRightMenu}
        className={styles.m3}
        src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmQ2hGZURQqfQ7t47CiBALPTFDip8Jp9HVGHRXXJe7i9C7/menu.png"
        alt="menu"
        width={50}
        height={50}
      />
    </div>
  );
};

export default TopMenu;
