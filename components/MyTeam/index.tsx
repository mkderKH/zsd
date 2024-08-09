"use client";
import React, { useState, useEffect } from "react";
import {
  createThirdwebClient,
} from "thirdweb";
import { Empty } from 'antd';
import { getRpcClient, eth_blockNumber } from "thirdweb/rpc";
import { useActiveAccount } from "thirdweb/react";
import styles from "./index.module.scss";
import axios from "axios";
const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });
import { APIConfig } from "../../abi/APIConfiguration";
import { bsc } from "thirdweb/chains";

const Commonform = () => {
  const [transactionRecord, setTransactionRecord] = useState<any>([]);
  const [totalAmountone, setTotalAmountone] = useState<any>('');
  const [storageAccount, setStorageAccount] = useState<any>('');
  const account: any = useActiveAccount();

  // 到账时间
  const TimeStampFun = (time: any) => {
    const timeStampHex = time;
    const timeStampDecimal = parseInt(timeStampHex, 16);
    const date = new Date(timeStampDecimal * 1000);
    const formattedDate = [
      date.getFullYear(),
      ('0' + (date.getMonth() + 1)).slice(-2),
      ('0' + date.getDate()).slice(-2)
    ].join('-') + ' ' +
      [
        ('0' + date.getHours()).slice(-2),
        ('0' + date.getMinutes()).slice(-2)
      ].join(':');
    return formattedDate;
  };

  // 到账金额
  const AmountReceivedFun = (hex: string) => {
    const amountInWeiHex = hex.slice(2);
    const amountInWei = parseInt(amountInWeiHex, 16);
    const amountInEther = amountInWei / Math.pow(10, 18);
    return amountInEther.toFixed(2);
  }

  // 账号
  const ToaccountFun = (hex: string) => {
    let lastEightChars = hex.slice(-8);
    let maskedPart = '***';
    return maskedPart + lastEightChars;
  };

  // 查询交易记录
  const TransactionRecordFun = async (addressnew: any) => {
    const rpcRequest = getRpcClient({ client, chain: bsc });
    const blockNumber = await eth_blockNumber(rpcRequest);
    try {
      const response = await axios.get(
        `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=${blockNumber}&address=${APIConfig.ZSDPROJECTAddress}&topic0=0xc60b8ea4a07531ce8a53d61415f1cadc645c0debef6c4a308a7cd7d578f4dae6` +
        `&topic2=0x000000000000000000000000${addressnew.substring(2).replace(/\s+/g, '')}&apikey=GG84IKHVXXQUE9JQMAT6N6UXAFHNFBCDM3`
      );
      setTransactionRecord(response.data.result);
      let totalAmount = 0;
      response.data.result.forEach((item: any) => {
        const amountInWeiHex = item.topics[3].slice(2);
        const amountInWei = parseInt(amountInWeiHex, 16);
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
    <div className={styles.Content}>
      <span className={styles.ContentText}>我的团队</span>

      <div>
        <div className={styles.ComputingPower}>
          <span className={styles.AmountReceived}>钱包地址</span>
          <span className={styles.AmountReceived}>直推人数</span>
          <span className={styles.ArrivalTime}>直推算力</span>
        </div>

        <div className={styles.CustomerInformation}>
          {transactionRecord.length > 0 ? (
            transactionRecord.map((item: any, index: any) => (
              <div key={index} className={styles.ComputingPowercont}>
                <span className={styles.AmountReceived}>{ToaccountFun(item.topics[2])}</span>
                <span className={styles.AmountReceived}>{AmountReceivedFun(item.topics[3])}</span>
                <span className={styles.ArrivalTime}>{TimeStampFun(item.timeStamp)}</span>
              </div>
            ))
          ) : (
            <Empty description={
              <span style={{ color: '#FFFFFF' }}>暂无数据</span>
            } />
          )}
        </div>
      </div>
    </div>
  );
};

export default Commonform;
