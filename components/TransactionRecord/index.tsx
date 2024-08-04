"use client";
import React, { useState, useEffect } from "react";
import {
  createThirdwebClient,
} from "thirdweb";
import { Button, Form, Row, Col } from "antd";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";

import { getRpcClient, eth_blockNumber, eth_getLogs } from "thirdweb/rpc";
import axios from "axios";


// 初始化
const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });

// 导入API配置
import { APIConfig } from "../../abi/APIConfiguration";
import { bsc } from "thirdweb/chains";//主网

const data = [
  { amount: '0', date: '2024.08.04' },
];

const Commonform = () => {
  const [switchingState, setSwitchingState] = useState<any>(1);
  const [transactionRecord, setTransactionRecord] = useState<any>([]);

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

    console.log("formattedDate:", formattedDate);
    return formattedDate; // 返回所需的日期格式
  };

  const AmountReceivedFun = () => {
   
  }


  // 查询交易记录
  const TransactionRecordFun = async () => {
    const rpcRequest = getRpcClient({ client, chain: bsc });
    const blockNumber = await eth_blockNumber(rpcRequest);
    try {
      const response = await axios.get(
        `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=${blockNumber}&address=${APIConfig.ZSDPROJECTAddress}&topic0=0xc60b8ea4a07531ce8a53d61415f1cadc645c0debef6c4a308a7cd7d578f4dae6` +
        `&topic1=0x00000000000000000000000044e83cd293a12fc57b732137488604cb36704a9e&apikey=GG84IKHVXXQUE9JQMAT6N6UXAFHNFBCDM3`
      );
      setTransactionRecord(response.data.result);



      console.log("response:", response.data.result);
      return response.data;
    } catch (error) {
      console.error("请求错误:", error);
    }
  }

  const ClickToswitch = (value: any) => {
    setSwitchingState(value)
  };

  useEffect(() => {
    TransactionRecordFun()
  }, []);
  return (
    <>
      <div className={styles.Content}>
        <span className={styles.ContentText}>交易记录</span>

        <div className={styles.Tabsstyle}>
          <span onClick={() => { ClickToswitch(1) }} style={{ color: (switchingState === 1) ? '#e89e2c' : '#ffffff' }}>直推</span>
          <span className={styles.teamstyle} onClick={() => { ClickToswitch(2) }} style={{ color: (switchingState === 2) ? '#e89e2c' : '#ffffff' }}>团队</span>
          <span style={{ color: (switchingState === 3) ? '#e89e2c' : '#ffffff' }} onClick={() => { ClickToswitch(3) }}>滑落</span>
        </div>

        {/* 直推 */}
        {
          switchingState == '1' &&
          <div>
            <div className={styles.ComputingPower}>
              <span className={styles.Contentlabel}>直推总金额/U：0</span>
              <span className={styles.power}>直推人数：0 人</span>
            </div>

            <div className={styles.ComputingPower}>
              <span className={styles.AmountReceived}>到账金额/U</span>
              <span className={styles.ArrivalTime}>到账时间</span>
            </div>

            <div className={styles.CustomerInformation}>
              {transactionRecord.map((item: any, index: any) => (
                <div key={index} className={styles.ComputingPowercont}>
                  <span className={styles.AmountReceived}>{ }</span>
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
              <span className={styles.AmountReceived}>到账金额/U</span>
              <span className={styles.ArrivalTime}>到账时间</span>
            </div>

            <div className={styles.CustomerInformation}>
              {transactionRecord.map((item: any, index: any) => (
                <div key={index} className={styles.ComputingPowercont}>
                  <span className={styles.AmountReceived}>{item.amount}</span>
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
              <span className={styles.AmountReceived}>到账金额/U</span>
              <span className={styles.ArrivalTime}>到账时间</span>
            </div>

            <div className={styles.CustomerInformation}>
              {transactionRecord.map((item: any, index: any) => (
                <div key={index} className={styles.ComputingPowercont}>
                  <span className={styles.AmountReceived}>{item.amount}</span>
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
