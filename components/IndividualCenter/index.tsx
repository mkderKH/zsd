"use client";
import React, { useState, useEffect } from "react";
import {
  getContract,
  createThirdwebClient,
  readContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { Button, Form, Input, Row, Col } from "antd";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";

// 初始化
const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });

// 导入API配置
import { APIConfig } from "../../abi/APIConfiguration";
import { bscTestnet } from "thirdweb/chains";
import { USDTAbi } from "../../abi/USDTAbi";

// 导入合约abi
const contractABI: any = USDTAbi;

//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bscTestnet,
});

//用户必须已经授权本合约从USDT合约划转账务
const ZSDContract = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  chain: bscTestnet,
  abi: contractABI,
});

const Commonform = () => {
  const [form] = Form.useForm();
  const account = useActiveAccount(); // 获取当前激活的账户
  const [uSDTBalance, setUSDTBalance] = useState<any>();
  const [zSDBalance, setZSDBalance] = useState<any>();
  const [Finaleffort, setFinalEffort] = useState<any>();
  const [FinaleffortZSD, setFinalEffortZSD] = useState<any>();
  const [directNumberPeople, setDirectNumberPeople] = useState<any>();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [storedAccount, setStoredAccount] = useState<any>(null);

  useEffect(() => {
    if (account) {
      setStoredAccount(account);
    }
  }, [account]);

  const onFinish = async (values: any) => {
    // console.log(storedAccount, "storedAccount");

    if (!ZSDContract) {
      console.error("Contract or account is not defined");
      return;
    }
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

      // if (allowanceUSDTBalance < toWei(amount).valueOf()) {
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
        contract: ZSDContract,
        // method: "function withdraZSDFunds(uint256 zsdAmount)",
        method: "withdraZSDFunds",
        // params: [Finaleffort],
        params: [], // 移除参数
      });
      // 发送交易，交易配置对象直接传递给 sendTransaction
      const result = await sendTransaction(transaction);
      // console.log("提取成功:", result);
    } catch (error) {
      console.error("提取失败:", error);
    }
  };

  useEffect(() => {
    const depositFunds = async () => {
      if (!ZSDContract || !storedAccount) {
        console.error("Contract is not defined");
        return;
      }
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
        const formattedBalance =
          Compareone == 0
            ? Compareone
            : (
                parseFloat(usdtBalance.toString()) /
                10 ** USDT_DECIMALS
              ).toFixed(2);

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
        const formattedBalancetwo =
          Compare == 0
            ? Compare
            : (
                parseFloat(usdtBalancetwo.toString()) /
                10 ** USDT_DECIMALStwo
              ).toFixed(2);
        setUSDTBalance(formattedBalance);
        setZSDBalance(formattedBalancetwo);
        // *************************************************************************查询代币*****************************************************************************
        const ComputingPower = await readContract({
          contract: ZSDContract,
          method: "users",
          params: [storedAccount.address],
        });
        // console.log("返回:", ComputingPower);
        const FinalEffortdata = ComputingPower[2] + ComputingPower[3];
        const FinalEffortdataOne = BigInt(FinalEffortdata.toString());
        const USDT_DECIMALSOnt = 6;
        const usdtBalanceone =
          FinalEffortdataOne / BigInt(10 ** (18 - USDT_DECIMALSOnt));
        const FinalEffort = parseFloat(usdtBalanceone.toString());
        const FinalPower =
          FinalEffort == 0
            ? FinalEffort
            : (
                parseFloat(usdtBalanceone.toString()) /
                10 ** USDT_DECIMALSOnt
              ).toFixed(2);
        // 最终算力
        setFinalEffort(FinalPower);
        // ZSD
        setFinalEffortZSD(ComputingPower[3].toString());
        // 直推人数
        setDirectNumberPeople(ComputingPower[1].toString());
        // 时间
        // const lastActionTimeSeconds = ComputingPower[5].toString();
        // console.log(lastActionTimeSeconds, '============================');
        // const timestampNumber = Number(lastActionTimeSeconds);
        // const date = new Date(timestampNumber * 1000); // Date 需要毫秒为单位
        // console.log(date.toLocaleString());
        // const lastActionTimeDate = new Date(lastActionTimeSeconds * 1000);
        // console.log(lastActionTimeDate.toString()); // 输出格式化的日期和时间字符串
        // console.log(lastActionTimeDate.toISOString()); // 输出 ISO 格式的日期和时间字符串
      } catch (error) {
        console.error("查询余额失败:", error);
      }
    };
    if (storedAccount) {
      depositFunds();
    }
  }, [storedAccount]);

  // useEffect(() => {
  //   const depositFunds = async () => {
  //     if (!ZSDContract || !storedAccount) {
  //       console.error("Contract is not defined");
  //       return;
  //     }
  //     try {
  //       // *************************************************************************查询用户USDT余额*****************************************************************************
  //       //用户usdt的余额
  //       const USDTBalance = await readContract({
  //         contract: USDTContract,
  //         method: "function balanceOf(address) view returns (uint256)",
  //         params: [storedAccount.address],
  //       });
  //       const WeiBalance = BigInt(USDTBalance.toString()); // 将字符串形式的 Wei 余额转换为 BigInt
  //       const USDT_DECIMALS = 6; // 假设 USDT 的小数精度为 6
  //       // 将 Wei 转换为 USDT 单位
  //       const usdtBalance = WeiBalance / BigInt(10 ** (18 - USDT_DECIMALS));
  //       // 判断余额是否为0
  //       const Compareone = parseFloat(usdtBalance.toString());
  //       // 将 BigInt 转换为常规数字并保留两位小数
  //       const formattedBalance =
  //         Compareone == 0
  //           ? Compareone
  //           : (
  //               parseFloat(usdtBalance.toString()) /
  //               10 ** USDT_DECIMALS
  //             ).toFixed(2);

  //       //用户zsd余额
  //       const ZSDBalance = await readContract({
  //         contract: ZSDContract,
  //         method: "function balanceOf(address) view returns (uint256)",
  //         params: [storedAccount.address],
  //       });
  //       const WeiBalancetwo = BigInt(ZSDBalance.toString()); // 将字符串形式的 Wei 余额转换为 BigInt
  //       const USDT_DECIMALStwo = 6; // 假设 USDT 的小数精度为 6
  //       // 将 Wei 转换为 USDT 单位
  //       const usdtBalancetwo =
  //         WeiBalancetwo / BigInt(10 ** (18 - USDT_DECIMALStwo));
  //       // 判断余额是否为0
  //       const Compare = parseFloat(usdtBalancetwo.toString());
  //       // 将 BigInt 转换为常规数字并保留两位小数
  //       const formattedBalancetwo =
  //         Compare == 0
  //           ? Compare
  //           : (
  //               parseFloat(usdtBalancetwo.toString()) /
  //               10 ** USDT_DECIMALStwo
  //             ).toFixed(2);
  //       setUSDTBalance(formattedBalance);
  //       setZSDBalance(formattedBalancetwo);

  //       // *************************************************************************查询代币*****************************************************************************
  //       const ComputingPower = await readContract({
  //         contract: ZSDContract,
  //         method: "users",
  //         params: [storedAccount.address],
  //       });
  //       // console.log("返回:", ComputingPower);

  //       const FinalEffortdata = ComputingPower[2] + ComputingPower[3];
  //       const FinalEffortdataOne = BigInt(FinalEffortdata.toString());
  //       const USDT_DECIMALSOnt = 6;
  //       const usdtBalanceone =
  //         FinalEffortdataOne / BigInt(10 ** (18 - USDT_DECIMALSOnt));
  //       const FinalEffort = parseFloat(usdtBalanceone.toString());
  //       const FinalPower =
  //         FinalEffort == 0
  //           ? FinalEffort
  //           : (
  //               parseFloat(usdtBalanceone.toString()) /
  //               10 ** USDT_DECIMALSOnt
  //             ).toFixed(2);

  //       // 最终算力
  //       setFinalEffort(FinalPower);
  //       // ZSD
  //       setFinalEffortZSD(ComputingPower[3].toString());
  //       // 直推人数
  //       setDirectNumberPeople(ComputingPower[1].toString());

  //       // 时间
  //       // const lastActionTimeSeconds = ComputingPower[5].toString();
  //       // console.log(lastActionTimeSeconds, '============================');
  //       // const timestampNumber = Number(lastActionTimeSeconds);
  //       // const date = new Date(timestampNumber * 1000); // Date 需要毫秒为单位
  //       // console.log(date.toLocaleString());
  //       // const lastActionTimeDate = new Date(lastActionTimeSeconds * 1000);
  //       // console.log(lastActionTimeDate.toString()); // 输出格式化的日期和时间字符串
  //       // console.log(lastActionTimeDate.toISOString()); // 输出 ISO 格式的日期和时间字符串
  //     } catch (error) {
  //       console.error("查询余额失败:", error);
  //     }
  //   };
  //   depositFunds();
  // }, []);
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
                {/* <span className={styles.labelRight}>已提取总额</span> */}
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
            {/* <Col span={2}> </Col>
            <Col span={11}>
              <Form.Item colon={false} name="USDT_two_amount">
                <Input className={styles.inputstyle} disabled />
              </Form.Item>
            </Col> */}
          </Row>
          <Row>
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
          </Row>
          <Row>
            <Col span={24} className={styles.cost}>
              <span className={styles.CalculatedValue}>
                当前ZSD价值 1ZSD=0.5USDT
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
          <div className={styles.currencyrow}>
            <div className={styles.NumberPeoplestyle}>0</div>
            <div className={styles.NumberPeople}>团队人数</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Commonform;
