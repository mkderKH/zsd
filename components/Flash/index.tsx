"use client";
import React from "react";
import { Button, Form, Input, Row, Col, Select } from "antd";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  toWei,
  readContract,
  sendAndConfirmTransaction,
} from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { approve, balanceOf, allowance } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";

const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });

// 导入API配置
import { APIConfig } from "../../abi/APIConfiguration";
import { bscTestnet } from "thirdweb/chains";

import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDABI } from "../../abi/ZSDABI";
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";

const USDTAbinew: any = USDTAbi;
const ZSDNewABI: any = ZSDABI;
const contractwapABI: any = ZSDSwapABI;
const contractROJECTABI: any = ZSDPROJECTABI;


//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  abi: USDTAbinew,
  chain: bscTestnet,
});

//ZSD
const ZSDContract = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  abi: ZSDNewABI,
  chain: bscTestnet,
});

// ZSDPROJECT
const ZSDPROJECTContract = getContract({
  client: client,
  address: APIConfig.ZSDPROJECTAddress,
  abi: contractROJECTABI,
  chain: bscTestnet,
});

//ZSDSWAP
const ZSDSWAPContract = getContract({
  client: client,
  address: APIConfig.ZSDSwapAddress,
  abi: contractwapABI,
  chain: bscTestnet,
});

const { Option } = Select;
const Commonform = () => {
  const [form] = Form.useForm();
  const account: any = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const selectAfterone = (
    <Select defaultValue="ZSD" className="select-after">
      <Option value="ZSD">ZSD</Option>
    </Select>
  );

  const selectAftertwo = (
    <Select defaultValue="USDT" className="select-after">
      <Option value="USDT">USDT</Option>
    </Select>
  );

  const onFinish = async (values: any) => {
    console.log(values.ZSD_two_amount, '===========258===========', account.address)
    if (!ZSDContract) {
      console.error("Contract address is not defined");
      return;
    }
    try {
      //*****************************************************ZSD授权USDT**************************************************** */
      //zsd合约有权限调用用户 balance的资产
      const banlance: any = 10000000000000000000000000 * 10 ** 18;
      //用户将自己usdt转出banlance的权限赋予zsd合约
      //用户授权给ZSD合约可操作usdt的余额
      const allowanceUSDTBalance = await readContract({
        contract: USDTContract,
        method: "function allowance(address, address)",
        params: [account.address, APIConfig.ZSDaddress],
      });

      //zsd合约有权限调用用户 balance的资产
      //用户将自己USDT转出banlance的权限赋予zsd合约
      const tx1 = prepareContractCall({
        contract: USDTContract,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDaddress, banlance],
      });
      // 用户将usdt转给zsd合约
      const tx1Result = await sendAndConfirmTransaction({
        transaction: tx1,
        account: account,
      });
      console.log("USDT transfer successful:", tx1Result);


      //*****************************************************USDT授权zsd**************************************************** */
      const banlanceUSDT: any = 10000000000000000000000000 * 10 ** 18;
      const allowanceUSDTBalanceUSDT = await readContract({
        contract: ZSDContract,
        method: "function allowance(address, address)",
        params: [account.address, APIConfig.USDTaddress],
      });
      const tx1usdt = prepareContractCall({
        contract: ZSDContract,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.USDTaddress, banlanceUSDT],
      });
      const tx1Resultusdt = await sendAndConfirmTransaction({
        transaction: tx1,
        account: account,
      });
      console.log("USDT transfer successful:", tx1Resultusdt);



      //*****************************************************ZSDPROJECT授权zsd**************************************************** */
      const banlanceZSDPROJECT: any = 10000000000000000000000000 * 10 ** 18;

      const allowanceUSDTBalanceZSDPROJECT = await readContract({
        contract: ZSDSWAPContract,
        method: "function allowance(address, address)",
        params: [account.address, APIConfig.ZSDSwapAddress],
      });

      const tx1ZSDPROJECT = prepareContractCall({
        contract: ZSDSWAPContract,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDSwapAddress, banlanceZSDPROJECT],
      });

      const tx1ResultZSDPROJECT = await sendAndConfirmTransaction({
        transaction: tx1,
        account: account,
      });
      console.log("USDT transfer successful:", tx1Resultusdt);



      //*****************************************************ZSDPROJECT授权zsd**************************************************** */
      const banlanceZSDPROJECTContract: any = 10000000000000000000000000 * 10 ** 18;
      const allowanceUSDTBalanceZSDPROJECTContract = await readContract({
        contract: ZSDSWAPContract,
        method: "function allowance(address, address)",
        params: [account.address, APIConfig.ZSDPROJECTAddress],
      });
      const tx1ZSDZSDPROJECTContract = prepareContractCall({
        contract: ZSDSWAPContract,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDPROJECTAddress, banlanceZSDPROJECTContract],
      });
      const tx1ResultZSDPROJECTContract = await sendAndConfirmTransaction({
        transaction: tx1,
        account: account,
      });
      console.log("USDT transfer successful:", tx1ResultZSDPROJECTContract);

      // 兑换
      const transaction = prepareContractCall({
        contract: ZSDContract,
        method: "function zsdtTokenTousdtTokenSwap(uint256 amountzsdtToken)",
        params: [toWei(values.ZSD_two_amount)],
      });
      const result = await sendTransaction(transaction);

      console.log("Withdrawal successful:", result);
    } catch (error) {
      console.error("Failed to withdraw USDT:", error);
    }
  };

  const amountValidator = (rule: any, value: any) => {
    if (!value) {
      return Promise.resolve();
    }
    const reg = /^[0-9]*$/;
    if (!reg.test(value)) {
      return Promise.reject(
        new Error("请输入有效的数字，不能输入负数和其他字符！")
      );
    }
    return Promise.resolve();
  };

  return (
    <>
      <div className={styles.Content}>
        <span className={styles.ContentText}>交易所</span>
        <Form
          name="amount"
          onFinish={onFinish}
          form={form}
          layout="vertical"
          style={{
            color: "white",
          }}
        >
          <Row>
            <Col span={24}>
              <Form.Item
                label={<span className={styles.Contentlabel}>代币兑换</span>}
                colon={false}
                name="USDT_one_amount"
                rules={[
                  { required: true, message: "请输入充入金额!" },
                  { validator: amountValidator },
                ]}
              >
                <Input
                  addonAfter={selectAfterone}
                  placeholder="请输入数量"
                  className={styles.inputstyle}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                colon={false}
                name="ZSD_two_amount"
                rules={[
                  { required: true, message: "请输入充入金额!" },
                  { validator: amountValidator },
                ]}
              >
                <Input
                  addonAfter={selectAftertwo}
                  placeholder="请输入数量"
                  className={styles.inputstyle}
                />
              </Form.Item>
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
                  兑换
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default Commonform;
