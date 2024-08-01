import React from "react";
import dynamic from "next/dynamic";
import VideoPlayer from "../../../components/VideoPlayer";
import Content from "../../../components/CommBg";
import Image from "next/image";
import styles from "./index.module.scss";
import { MenuProvider } from "../../../components/MenuContext"; // 调整路径到实际位置
const TopMenu = dynamic(() => import("../../../components/TopMenu"), {
  ssr: true,
});
const Community = () => {
  return (
    <MenuProvider>
      <TopMenu />
      <VideoPlayer></VideoPlayer>
      <Content
        styleMain={{ marginTop: "18px" }}
        title={"社区"}
        solt={
          <div className={styles.chatcontainer}>
            <div className={styles.chatbubble}>
              <div className={styles.icon}>
                <Image
                  src="https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/xn.png"
                  width={50}
                  height={50}
                  alt="Paperplane"
                />
              </div>
              <div className={styles.message}>
                <div>https://x.com/kuang_jin34363</div>
                <div>?s=09</div>
              </div>
            </div>
            <div className={styles.chatbubble}>
              <div className={styles.icon}>
                <Image
                  src="https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/tlgrm.png"
                  width={50}
                  height={50}
                  alt="Twitter"
                />
              </div>
              <div className={styles.message} style={{ paddingTop: "14px" }}>
                https://share1024.com
              </div>
            </div>
            <div className={styles.chatbubble}>
              <div className={styles.icon}>
                <Image
                  src="https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj//wyj.png"
                  width={50}
                  height={50}
                  alt="Internet Explorer"
                />
              </div>
              <div className={styles.message}>
                <div>https://discord.com/invite/</div>
                <div>6Sathyexrm</div>
              </div>
            </div>
          </div>
        }
      ></Content>
      社区
    </MenuProvider>
  );
};

export default Community;
