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
        src="https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/coin.png"
        alt="coin"
        width={50}
        height={50}
      />

      <CallWallet />

      <Image
        className={styles.m2}
        src="https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/selectorSwitch.png"
        alt="selectorSwitch"
        width={50}
        height={50}
      />
      <Image
        onClick={onToggleRightMenu}
        className={styles.m3}
        src="https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/menu.png"
        alt="menu"
        width={50}
        height={50}
      />
    </div>
  );
};

export default TopMenu;
