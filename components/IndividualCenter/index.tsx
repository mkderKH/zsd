"use client";
import React, { useState, useEffect } from "react";
import {
  getContract,
  readContract,
  prepareContractCall,
  createThirdwebClient,
  sendAndConfirmTransaction,
  prepareEvent,
  getContractEvents,
} from "thirdweb";

import { Button, Form, Input, Row, Col } from "antd";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";
import axios from "axios";

const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });
import { APIConfig } from "../../abi/APIConfiguration";
import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";
import { ZSDABI } from "../../abi/ZSDABI";
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";  //ZSDSwapABI
import { getRpcClient, eth_blockNumber, eth_getLogs } from "thirdweb/rpc";
import { bsc } from "thirdweb/chains";
const contractABI: any = USDTAbi;
const ZSDContractABI: any = ZSDPROJECTABI;
const contractZSDSwapABI: any = ZSDSwapABI;
const contractZSD: any = ZSDABI


//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bsc,
});

// ZSD
const contractZSDabi = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  chain: bsc,
  abi: contractZSD
});

//用户必须已经授权本合约从USDT合约划转账务
const ZSDContract = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  chain: bsc,
  abi: contractABI,
});

const ZSDContractPoject = getContract({
  client: client,
  address: APIConfig.ZSDPROJECTAddress,
  chain: bsc,
  abi: ZSDContractABI,
});

const ZSDSwap = getContract({
  client: client,
  address: APIConfig.ZSDSwapAddress,
  abi: contractZSDSwapABI,
  chain: bsc,
});

const Commonform = () => {
  const [form] = Form.useForm();
  const account = useActiveAccount();
  const [zSDBalance, setZSDBalance] = useState<any>();
  const [uSDTBalance, setUSDTBalance] = useState<any>();
  const [Finaleffort, setFinalEffort] = useState<any>();
  const [FinaleffortZSD, setFinalEffortZSD] = useState<any>();
  const [storedAccount, setStoredAccount] = useState<any>(null);
  const [directNumberPeople, setDirectNumberPeople] = useState<any>();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [price, SetPrice] = useState<any>();
  const [transactionRecord, setTransactionRecord] = useState<any>([]);

  useEffect(() => {
    if (account) {
      setStoredAccount(account);
    }
  }, [account]);


  const onFinish = async (values: any) => {
    try {
      //zsd合约有权限调用用户 balance的资产
      const banlance: any = 10000000000000000000000000 * 10 ** 18;

      //用户将自己的 将自己usdt转出banlance的权限赋予zsd合约
      //用户授权给ZSD合约可操作usdt的余额
      const allowanceUSDTBalance = await readContract({
        contract: USDTContract,
        method: "function allowance(address, address)",
        params: [storedAccount.address, APIConfig.ZSDaddress],
      });

      //zsd合约有权限调用用户 balance的资产
      //用户将自己的 将自己usdt转出banlance的权限赋予zsd合约
      const tx1 = prepareContractCall({
        contract: USDTContract,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDaddress, banlance],
      });
      // 用户将usdt转给zsd合约
      const tx1Result = await sendAndConfirmTransaction({
        transaction: tx1,
        account: storedAccount,
      });

      const transaction = prepareContractCall({
        contract: ZSDContractPoject,
        // method: "function withdraZSDFunds(uint256 zsdAmount)",
        method: "withdraZSDFunds",
        // params: [Finaleffort],
        params: [], // 移除参数
      });

      // 发送交易，交易配置对象直接传递给 sendTransaction
      const result = await sendTransaction(transaction);
    } catch (error) {
      console.error("提取失败:", error);
    }
  };

  // USDTD兑换ZSD
  const USDtoZSDnumFun = async () => {
    try {
      const USDtoZSDnum = await readContract({
        contract: ZSDSwap,
        method: "function getAmountZSDOut(uint256) view returns (uint256)",
        params: [BigInt(1000000000000000000)],
      });
      const WeiBalance = USDtoZSDnum.toString();

      SetPrice(WeiBalance)
    } catch (error) {
      console.error("查询失败:", error);
    }
  };

  useEffect(() => {
    USDtoZSDnumFun()

    const depositFunds = async () => {
      try {
        // *************************************************************************查询用户USDT余额*****************************************************************************
        //用户usdt的余额
        const USDTBalance = await readContract({
          contract: USDTContract,
          method: "function balanceOf(address) view returns (uint256)",
          params: [storedAccount.address],
        });
        const WeiBalance = BigInt(USDTBalance.toString()); // 将字符串形式的 Wei 余额转换为 BigInt
        const USDT_DECIMALS = 6; // 假设 USDT 的小数精度为 6
        // 将 Wei 转换为 USDT 单位
        const usdtBalance = WeiBalance / BigInt(10 ** (18 - USDT_DECIMALS));
        // 判断余额是否为0
        const Compareone = parseFloat(usdtBalance.toString());
        // 将 BigInt 转换为常规数字并保留两位小数
        const formattedBalance = Compareone == 0 ? Compareone : (parseFloat(usdtBalance.toString()) / 10 ** USDT_DECIMALS).toFixed(2);

        //用户zsd余额
        const ZSDBalance = await readContract({
          contract: ZSDContract,
          method: "function balanceOf(address) view returns (uint256)",
          params: [storedAccount.address],
        });
        const WeiBalancetwo = BigInt(ZSDBalance.toString()); // 将字符串形式的 Wei 余额转换为 BigInt
        const USDT_DECIMALStwo = 6; // 假设 USDT 的小数精度为 6
        // 将 Wei 转换为 USDT 单位
        const usdtBalancetwo =
          WeiBalancetwo / BigInt(10 ** (18 - USDT_DECIMALStwo));
        // 判断余额是否为0
        const Compare = parseFloat(usdtBalancetwo.toString());
        // 将 BigInt 转换为常规数字并保留两位小数
        const formattedBalancetwo = Compare == 0 ? Compare : (parseFloat(usdtBalancetwo.toString()) / 10 ** USDT_DECIMALStwo).toFixed(2);
        setUSDTBalance(formattedBalance);
        setZSDBalance(formattedBalancetwo);


        const USDtoZSDnum = await readContract({
          contract: ZSDSwap,
          method: "function getAmountZSDOut(uint256) view returns (uint256)",
          params: [BigInt(1000000000000000000)],
        });
        const WeiBalanceone: any = USDtoZSDnum.toString();

        // *************************************************************************查询个人中心*****************************************************************************
        const ComputingPower = await readContract({
          contract: ZSDContractPoject,
          method: "users",
          params: ['0x44e83cD293a12FC57b732137488604CB36704a9e'],
        });
        const computingPowerSecond = Number(ComputingPower[2].toString());
        const computingPowerThird = Number(ComputingPower[3].toString());
        const weiBalanceOne = Number(WeiBalanceone);
        const FinalEffortdata = ((computingPowerSecond + computingPowerThird) / weiBalanceOne) / (10 ** 18)

        // 最终算力
        setFinalEffort(FinalEffortdata);
        // ZSD
        // setFinalEffortZSD(FinalEffortdata2);
        // 直推人数
        setDirectNumberPeople(ComputingPower[1].toString());
      } catch (error) {
        console.error("查询余额失败:", error);
      }
    };
    if (storedAccount) {
      depositFunds();
    }
  }, [storedAccount]);

  return (
    <>
      <div className={styles.Content}>
        <span className={styles.ContentText}>我的账户</span>
        <div className={styles.currencycontainer}>
          <div className={styles.currencyrow}>
            <div className={styles.USDTstyle}>USDT(枚)</div>
            <div className={styles.USDTnuber}>{uSDTBalance}</div>
          </div>
          <div className={styles.currencyrow}>
            <div className={styles.USDTstyle}>ZSD(枚)</div>
            <div className={styles.USDTnuber}>{zSDBalance}</div>
          </div>
        </div>
      </div>

      <div className={styles.Content}>
        <span className={styles.ContentText}>提取代币</span>
        <div className={styles.ContentInstructions}>(这里是提取代币的说明)</div>
        <Form
          name="amount"
          onFinish={onFinish}
          layout="vertical"
          form={form}
          style={{
            color: "white",
          }}
          initialValues={{
            USDT_two_amount: Finaleffort,
            USDT_two_ZSD: FinaleffortZSD,
          }}
        >
          <Row>
            <Col span={24}>
              <div className={styles.labelContainer}>
                <span className={styles.labelLeft}>我的总算力</span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item colon={false} name="USDT_two_amount">
                <Input
                  className={styles.inputstyle}
                  disabled
                  placeholder={Finaleffort}
                  value={Finaleffort}
                />
              </Form.Item>
            </Col>
          </Row>
          {/* <Row>
            <Col span={24}>
              <Form.Item colon={false} name="USDT_two_ZSD">
                <Input
                  className={styles.inputstyle}
                  addonAfter="ZSD"
                  disabled
                  placeholder={FinaleffortZSD}
                />
              </Form.Item>
            </Col>
          </Row> */}
          <Row>
            <Col span={24} className={styles.cost}>
              <span className={styles.CalculatedValue}>
                当前ZSD价值 1USDT={price / 10 ** 18}ZSD
              </span>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.buttonstyle}
                >
                  提取
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      <div className={styles.Content}>
        <span className={styles.ContentText}>我的团队</span>
        <div className={styles.currencycontainer}>
          <div className={styles.currencyrow}>
            <div className={styles.NumberPeoplestyle}>{directNumberPeople}</div>
            <div className={styles.NumberPeople}>直推人数</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Commonform;
