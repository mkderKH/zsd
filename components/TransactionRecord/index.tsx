"use client";
import React, { useState, useEffect } from "react";
import {
  createThirdwebClient,
} from "thirdweb";
import { Button, Form, Row, Col } from "antd";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";
import { useActiveAccount } from "thirdweb/react";
import { getRpcClient, eth_blockNumber, eth_getLogs } from "thirdweb/rpc";
import axios from "axios";


// 初始化
const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });

// 导入API配置
import { APIConfig } from "../../abi/APIConfiguration";
import { bsc } from "thirdweb/chains"; //主网

const Commonform = () => {
  const [switchingState, setSwitchingState] = useState<any>(1);
  const [transactionRecord, setTransactionRecord] = useState<any>([]);
  const [totalAmountone, setTotalAmountone] = useState<any>('');
  const [storageAccount, setStorageAccount] = useState<any>('');
  const account: any = useActiveAccount();

  // 到账时间
  const TimeStampFun = (time: any) => {
    // timeStamp 是一个十六进制的时间戳
    const timeStampHex = time;
    // 转换十六进制为十进制
    const timeStampDecimal = parseInt(timeStampHex, 16);
    // 将 Unix 时间戳转换为 Date 对象
    const date = new Date(timeStampDecimal * 1000);

    // 手动构建所需的日期格式
    const formattedDate = [
      date.getFullYear(),
      ('0' + (date.getMonth() + 1)).slice(-2),
      ('0' + date.getDate()).slice(-2)
    ].join('-') + ' ' +
      [
        ('0' + date.getHours()).slice(-2),
        ('0' + date.getMinutes()).slice(-2)
      ].join(':');

    return formattedDate; // 返回所需的日期格式
  };


  // 到账金额
  const AmountReceivedFun = (hex: string) => {
    // 去除 '0x' 前缀
    const amountInWeiHex = hex.slice(2);
    // 十六进制转十进制
    const amountInWei = parseInt(amountInWeiHex, 16);
    // 转换为以太币 (1 ether = 10^18 wei)
    const amountInEther = amountInWei / Math.pow(10, 18);
    // 返回转换后的金额，以便在 JSX 中使用
    return amountInEther.toFixed(2); // 使用 toFixed 来格式化小数点后两位
  }

  // 账号
  const ToaccountFun = (hex: string) => {
    // 判断输入是否为合法的十六进制字符串，长度应为 42 个字符（不包括前缀 "0x"）
    // if (typeof hex !== 'string' || hex.length !== 42 || !hex.startsWith('0x')) {
    //   console.error('输入的不是有效的十六进制字符串。');
    //   return null;
    // }

    // 获取后八位
    let lastEightChars = hex.slice(-8);

    // 构建前面的三个星号
    let maskedPart = '***';

    // 合并并返回遮蔽后的字符串
    return maskedPart + lastEightChars;
  };

  // 查询交易记录
  const TransactionRecordFun = async (addressnew: any) => {
    const rpcRequest = getRpcClient({ client, chain: bsc });
    const blockNumber = await eth_blockNumber(rpcRequest);
    try {
      const response = await axios.get(
        `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=${blockNumber}&address=${APIConfig.ZSDPROJECTAddress}&topic0=0xc60b8ea4a07531ce8a53d61415f1cadc645c0debef6c4a308a7cd7d578f4dae6` +
        `&topic1=0x000000000000000000000000${addressnew.substring(2).replace(/\s+/g, '')}&apikey=GG84IKHVXXQUE9JQMAT6N6UXAFHNFBCDM3`
      );
      setTransactionRecord(response.data.result);
      let totalAmount = 0; // 定义一个变量来存储总金额
      // 总金额计算
      response.data.result.forEach((item: any) => {
        // 将topics[3]的十六进制转换为十进制数值
        const amountInWeiHex = item.topics[3].slice(2);
        const amountInWei = parseInt(amountInWeiHex, 16);
        // 累加到totalAmount
        totalAmount += amountInWei;
      });
      setTotalAmountone(totalAmount / 10 ** 18)
      return response.data;
    } catch (error) {
      console.error("请求错误:", error);
    }
  }

  useEffect(() => {
    if (account) {
      setStorageAccount(account.address)
      let addressnew = account.address
      TransactionRecordFun(addressnew)
    }
  }, [account]);
  return (
    <>
      <div className={styles.Content}>
        <span className={styles.ContentText}>交易记录</span>

        {/* <div className={styles.Tabsstyle}>
          <span onClick={() => { ClickToswitch(1) }} style={{ color: (switchingState === 1) ? '#e89e2c' : '#ffffff' }}>直推</span>
          <span className={styles.teamstyle} onClick={() => { ClickToswitch(2) }} style={{ color: (switchingState === 2) ? '#e89e2c' : '#ffffff' }}>团队</span>
          <span style={{ color: (switchingState === 3) ? '#e89e2c' : '#ffffff' }} onClick={() => { ClickToswitch(3) }}>滑落</span>
        </div> */}

        {/* 直推 */}
        {
          switchingState == '1' &&
          <div>
            <div className={styles.ComputingPower}>
              <span className={styles.Contentlabel}>总金额/USDT：{totalAmountone}USDT</span>
              {/* <span className={styles.power}>直推人数：0 人</span> */}
            </div>

            <div className={styles.ComputingPower}>
              <span className={styles.AmountReceived}>账号</span>
              <span className={styles.AmountReceived}>到账金额/USDT</span>
              <span className={styles.ArrivalTime}>到账时间</span>
            </div>

            <div className={styles.CustomerInformation}>
              {transactionRecord.map((item: any, index: any) => (
                <div key={index} className={styles.ComputingPowercont}>
                  <span className={styles.AmountReceived}>{ToaccountFun(item.topics[2])}</span>
                  <span className={styles.AmountReceived}>{AmountReceivedFun(item.topics[3])}</span>
                  <span className={styles.ArrivalTime}>{TimeStampFun(item.timeStamp)}</span>
                </div>
              ))}
            </div>
          </div>
        }

        {/* 团队 */}
        {
          switchingState == '2' &&
          <>
            <div className={styles.ComputingPower}>
              <span className={styles.AmountReceived}>账号</span>

              <span className={styles.AmountReceived}>到账金额/U</span>
              <span className={styles.ArrivalTime}>到账时间</span>
            </div>

            <div className={styles.CustomerInformation}>
              {transactionRecord.map((item: any, index: any) => (
                <div key={index} className={styles.ComputingPowercont}>
                  <span className={styles.AmountReceived}>{AmountReceivedFun(item.topics[3])}</span>
                  <span className={styles.ArrivalTime}>{TimeStampFun(item.timeStamp)}</span>
                </div>
              ))}
            </div>
          </>
        }

        {/* 滑落 */}
        {
          switchingState == '3' &&
          <>
            <div className={styles.ComputingPower}>
              <span className={styles.AmountReceived}>账号</span>

              <span className={styles.AmountReceived}>到账金额/U</span>
              <span className={styles.ArrivalTime}>到账时间</span>
            </div>

            <div className={styles.CustomerInformation}>
              {transactionRecord.map((item: any, index: any) => (
                <div key={index} className={styles.ComputingPowercont}>
                  <span className={styles.AmountReceived}>{AmountReceivedFun(item.topics[2])}</span>

                  <span className={styles.AmountReceived}>{AmountReceivedFun(item.topics[3])}</span>
                  <span className={styles.ArrivalTime}>{TimeStampFun(item.timeStamp)}</span>
                </div>
              ))}
            </div>
          </>
        }
      </div>
    </>
  );
};

export default Commonform;
