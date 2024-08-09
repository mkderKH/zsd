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
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";
import { APIConfig } from "../../abi/APIConfiguration";
import { useActiveAccount } from "thirdweb/react";
import { USDTAbi } from "../../abi/USDTAbi";
import { sendTransaction } from "thirdweb";

const contractABI: any = USDTAbi;
const contractZSDPROJECTABI: any = ZSDPROJECTABI;

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

const ZSDContract = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  chain: bsc,
  abi: contractABI
});

//USDT
const USDT = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bsc,
  abi: contractABI,
});


// ZSDProject
const ZSDProjectfun = getContract({
  client: client,
  address: APIConfig.ZSDPROJECTAddress,
  chain: bsc,
  abi: contractZSDPROJECTABI,
});

//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bsc,
});

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

  // 输入邀请链接
  const onFriendRechargeFun = async () => {
    const values = form.getFieldsValue();
    const Inviteaddress: any = values.Invitelink.split(' ').join('')
    // const values = form.getFieldsValue();
    // const search = values.Invitelink;
    // const params = new URLSearchParams(new URL(search).search);
    // const Inviteaddress: any = params.get('ref');

    try {
      const registerTX = prepareContractCall({
        contract: ZSDContract,
        method: "function register(address)",
        params: [Inviteaddress],
      });
      const registerTXResult = await sendAndConfirmTransaction({
        transaction: registerTX,
        account: account,
      });

      // *********************************************************登录后授权*********************************************************************
      //用户USDT的余额
      const USDTBalance = await readContract({
        contract: USDT,
        method: "function balanceOf(address) view returns (uint256)",
        params: [account.address],
      });

      const allowanceUSDTBalance = await readContract({
        contract: USDT,
        method: "function allowance(address, address)",
        params: [account.address, APIConfig.ZSDPROJECTAddress],
      });

      if (allowanceUSDTBalance == 0) {
        message.info("请授权ZSD合约使用您的USDT");
        return;
      }
      //zsd合约有权限调用用户 balance的资产 ||  用户将自己的 USDT转出banlance的权限赋予zsd合约
      const banlance: any = 10000000000000000000000000 * 10 ** 18;
      const tx1 = prepareContractCall({
        contract: USDT,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDPROJECTAddress, banlance],
      });

      // 用户将usdt转给zsd合约
      const tx1Result = await sendAndConfirmTransaction({
        transaction: tx1,
        account: account,
      });
    } catch (error: any) {
      const firstLine = error.toString().split("\n")[0];
      const match = firstLine.match(/TransactionError: Error - (.+)/);
      if (match && match[1]) {
        switch (match[1]) {
          case "referrer has not deposited":
            message.info("邀请人必须已经投资过");
            break;
          case "User already registered":
            message.info("邀请用户未注册");
            break;
          case "You cannot refer":
            message.info("邀请人和用户不是同一个人");
            break;
          default:
            message.error("发生未知错误");
            break;
        }
        setIsModalOpen(true);
      } else if (error instanceof TypeError) {
        if (
          error.message.includes("Cannot read properties of null (reading '1')")
        ) {
          message.error("发生错误：尝试读取 null 对象的属性");
          setIsModalOpen(true);
        } else {
          message.error("发生类型错误");
          setIsModalOpen(true);
        }
      } else {
        message.error("输入错误，请输入正确的邀请人地址");
        setIsModalOpen(true);
      }
    }
  };

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
        params: [Inviteaddress],
      });
      const registerTXResult = await sendAndConfirmTransaction({
        transaction: registerTX,
        account: account,
      });
    } catch (error: any) {
      const firstLine = error.toString().split("\n")[0];
      const match = firstLine.match(/TransactionError: Error - (.+)/);
      if (match && match[1]) {
        switch (match[1]) {
          case "referrer has not deposited":
            message.info("邀请人没有入金");
            // handleCancel();
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
                onClick={onFriendRechargeFun}
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