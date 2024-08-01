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
// import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { approve, balanceOf, allowance } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";

const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });
// const thirdweb = new ThirdwebSDK(THIRDWEB_PROJECT_ID);

// 导入API配置
import { bscTestnet } from "thirdweb/chains";
import { APIConfig } from "../../abi/APIConfiguration";
import { USDTAbi } from "../../abi/USDTAbi";

const contractABI: any = USDTAbi;

//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  abi: contractABI,
  chain: bscTestnet,
});

//用户必须已经授权本合约从USDT合约划转账务
const ZSDContract = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  abi: contractABI,
  chain: bscTestnet,
});

const { Option } = Select;
const Commonform = () => {
  const [form] = Form.useForm();
  const account: any = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();

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
    if (!ZSDContract) {
      console.error("Contract address is not defined");
      return;
    }
    try {
      const contract = getContract({
        client: client,
        address: APIConfig.USDTaddress,
        abi: contractABI,
        chain: bscTestnet,
      });

      //zsd合约有权限调用用户 balance的资产
      const banlance: any = 10000000000000000000000000 * 10 ** 18;
      //用户将自己的 将自己usdt转出banlance的权限赋予zsd合约
      //用户授权给ZSD合约可操作usdt的余额
      const allowanceUSDTBalance = await readContract({
        contract: USDTContract,
        method: "function allowance(address, address)",
        params: [account.address, APIConfig.ZSDaddress],
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
        account: account,
      });

      const transaction = prepareContractCall({
        // contract: contract,
        contract: ZSDContract, // 使用已定义的 ZSDContract
        method: "function swapZSDtoUSDT(uint256 _zsdAmount)",
        // method: "swapZSDtoUSDT",
        params: [toWei(values.ZSD_two_amount)],
      });
      const result = await sendTransaction(transaction);

      //   console.log("Withdrawal successful:", result);
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
