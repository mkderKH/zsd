"use client";
import React, { useState, useEffect } from "react";
import {
  getContract,
  readContract,
  prepareContractCall,
  createThirdwebClient,
} from "thirdweb";
import Web3 from 'web3';

import { Button, Form, Row, Col, Modal } from "antd";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { balanceOf } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";
import axios from "axios";

const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });

import { APIConfig } from "../../abi/APIConfiguration";
import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";
import { getRpcClient, eth_blockNumber, } from "thirdweb/rpc";
import { bsc } from "thirdweb/chains";

const contractABI: any = USDTAbi;
const ZSDContractABI: any = ZSDPROJECTABI;
const contractZSDSwapABI: any = ZSDSwapABI;

//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bsc,
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
  const [transactionRecord, setTransactionRecord] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [convertedDatalist, setConvertedDatalist] = useState<any>([]);
  const [convertedDatalistone, setConvertedDatalistone] = useState<any>([]);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 查询交易记录
  const TransactionRecordFun = async (addressnew: any) => {
    const rpcRequest = getRpcClient({ client, chain: bsc });
    const blockNumber = await eth_blockNumber(rpcRequest);
    try {
      const response = await axios.get(
        `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=${blockNumber}&address=${APIConfig.ZSDPROJECTAddress}&topic0=0x7adbed9e4ac398e2dcb3546bda9a9a53b6efdf5febefec1418b4d9abcdf49436` +
        `&topic1=0x000000000000000000000000${addressnew.substring(2).replace(/\s+/g, '')}&apikey=GG84IKHVXXQUE9JQMAT6N6UXAFHNFBCDM3`
      );
      // 用于存储转换后数据的数组
      const convertedData = response.data.result.map((item: any) => {
        // 提取topics[3]，去掉前缀'0x'，然后转换为十进制数，除以10**18（假设它是一个以wei表示的以太坊金额）
        const topics3Decimal = parseInt(item.topics[2].slice(2), 16) / (10 ** 18);
        // 提取timeStamp，转换为十进制
        const timeStampDecimal = parseInt(item.timeStamp, 16);
        // 将Unix时间戳转换为日期
        const date = new Date(timeStampDecimal * 1000);
        date.setUTCHours(date.getUTCHours() + 8);

        // 使用Date对象的方法获取年、月、日、时、分、秒
        let year = date.getUTCFullYear();
        let month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        let day = date.getUTCDate().toString().padStart(2, '0');
        let hours = date.getUTCHours().toString().padStart(2, '0');
        let minutes = date.getUTCMinutes().toString().padStart(2, '0');
        let seconds = date.getUTCSeconds().toString().padStart(2, '0');

        // 构建新的格式化时间字符串
        let formattedTime = `${year}-${month}-${day}:${hours}:${minutes}.${seconds}`;
        return {
          topics3Decimal, // topics[3]的十进制表示
          timeStampDate: formattedTime, // timeStamp转换为ISO格式的日期时间字符串
        };
      });
      setConvertedDatalist(convertedData)
      return response.data;
    } catch (error) {
      console.error("请求错误:", error);
    }
  }

  const TransactionZSDRecordFun = async (addressnew: any) => {
    const rpcRequest = getRpcClient({ client, chain: bsc });
    const blockNumber = await eth_blockNumber(rpcRequest);
    try {
      const response = await axios.get(
        `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=${blockNumber}&address=${APIConfig.ZSDPROJECTAddress}&topic0=0x11c4420974eed3e52af6cbc037a546d7c4cfa6a5537b1ddf50dd6b951b2edfa3` +
        `&topic1=0x000000000000000000000000${addressnew.substring(2).replace(/\s+/g, '')}&apikey=GG84IKHVXXQUE9JQMAT6N6UXAFHNFBCDM3`
      );

      // 用于存储转换后数据的数组
      const convertedData = response.data.result.map((item: any) => {
        if (item.functionName == "depositUSDTANDZSDFunds(uint256 usdtAmount)") {
          const inputData = item.input;
          const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org/'));
          const params = ['uint256'];
          const decoded: any = web3.eth.abi.decodeParameters(params, inputData.slice(4));
          const decodedBigInt = BigInt(decoded[0]);
          const decodedStr: any = decodedBigInt.toString()

          // 将Unix时间戳转换为日期
          const date = new Date(item.timeStamp * 1000);
          date.setUTCHours(date.getUTCHours() + 8);

          // 使用Date对象的方法获取年、月、日、时、分、秒
          let year = date.getUTCFullYear();
          let month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
          let day = date.getUTCDate().toString().padStart(2, '0');
          let hours = date.getUTCHours().toString().padStart(2, '0');
          let minutes = date.getUTCMinutes().toString().padStart(2, '0');
          let seconds = date.getUTCSeconds().toString().padStart(2, '0');

          // 构建新的格式化时间字符串
          let formattedTime = `${year}-${month}-${day}:${hours}:${minutes}.${seconds}`;
          return {
            decodedStr,
            timeStampDate: formattedTime, // timeStamp转换为ISO格式的日期时间字符串
          };
        }
      });

      setConvertedDatalistone(convertedData)
      return response.data;
    } catch (error) {
      console.error("请求错误:", error);
    }
  }

  const onFinish = async () => {
    try {
      const transaction = prepareContractCall({
        contract: ZSDContractPoject,
        method: "function withdraZSDFunds()",
        params: [], // 移除参数
      });
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
        const ZSDBalance = await balanceOf({
          contract: ZSDContract,
          address: storedAccount.address,
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
          params: [storedAccount.address],
        });
        const bigIntNumber1 = ComputingPower[2];
        const bigIntNumber2 = ComputingPower[3];
        const computingPowerSecond = Number(bigIntNumber1);
        const computingPowerThird = Number(bigIntNumber2);
        const weiBalanceOne = Number(WeiBalanceone);
        const FinalEffortdata = (computingPowerSecond / (10 ** 18) + computingPowerThird / weiBalanceOne)
        let timestampInMs = Number(ComputingPower[4]);

        // 获取当前时间的Date对象
        let now = new Date();
        // 获取当前时间的时间戳（毫秒）
        let timestamp = now.getTime();
        // 提取计算   ||  当前时间戳  减去  取出来的时间戳  /   86400000（秒） =  时间    （* 0.005 * FinalEffortdata = 提走的币）
        const Withdraw = (((timestamp / 1000 - timestampInMs) / 86400) * 0.005 * FinalEffortdata) * weiBalanceOne / (10 ** 18)
        setTransactionRecord(Withdraw)
        // 最终算力
        setFinalEffort(FinalEffortdata);
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

  useEffect(() => {
    if (account) {
      setStoredAccount(account);
      TransactionRecordFun(account.address)
      TransactionZSDRecordFun(account.address)
    }
  }, [account]);

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
                <div className={styles.inputstyle2}>
                  {Finaleffort}
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <div className={styles.labelContainer} style={{ margin: 'auto' }}>
                <span className={styles.labelLeft}>可提取ZSD:  <span className={styles.labelLeftone}>{transactionRecord}</span></span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24} className={styles.cost}>
              <span className={styles.CalculatedValue}>
                当前ZSD价值: <span className={styles.inputstyle3}>1USDT={price / 10 ** 18}ZSD</span>
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
          <Row>
            <Col span={24}>
              <Form.Item>
                <Button
                  type="primary"
                  className={styles.buttonstyle}
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                >
                  充值明细
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

      <Modal
        title=""
        open={isModalOpen}
        onCancel={handleCancel}
        destroyOnClose={true}
        footer={
          <div>
            <Button onClick={handleCancel} className={styles.Cancelstyle} type="primary"
            >
              取消
            </Button>
          </div>
        }
      >
        <div className={styles.conters}>
          <span>算力</span>
          <span>时间</span>
        </div>

        <div>
          {convertedDatalist.map((item: any, index: any) => (
            <div key={index} className={styles.contersone}>
              <span >{item.topics3Decimal * 2}</span>
              <span >{item.timeStampDate}</span>
            </div>
          ))}

          {
            convertedDatalistone
              .filter((item: any) => item !== undefined) // 过滤掉undefined的元素
              .map((item: any, index: any) => (
                <div key={index} className={styles.contersone}>
                  <span>{item && item.decodedStr}</span>
                  <span>{item && item.timeStampDate}</span>
                </div>
              ))
          }
        </div>
      </Modal>
    </>
  );
};

export default Commonform;