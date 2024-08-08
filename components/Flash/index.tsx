"use client";
import React, { useState, useEffect } from "react";
import { Button, Form, Input, Row, Col, Select, message } from "antd";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
} from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { balanceOf } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";
const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });
import { APIConfig } from "../../abi/APIConfiguration";
// import { bsc } from "thirdweb/chains";
import { bscTestnet } from "thirdweb/chains";
import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDABI } from "../../abi/ZSDABI";
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";
const contractZSDPROJECTABI: any = ZSDPROJECTABI;

const USDTAbinew: any = USDTAbi;
const contractwapABI: any = ZSDSwapABI;
const ZSDabi: any = ZSDABI;

//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bscTestnet,
  abi: USDTAbinew,
});

//ZSDSWAP
const ZSDSWAPContract = getContract({
  client: client,
  address: APIConfig.ZSDSwapAddress,
  abi: contractwapABI,
  chain: bscTestnet,
});

const ZSD = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  abi: ZSDabi,
  chain: bscTestnet,
});

const { Option } = Select;
const Commonform = () => {
  const [form] = Form.useForm();
  const account: any = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [price, SetPrice] = useState<any>(0);
  const [priceAccount, SetPriceAccount] = useState<any>(0);

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

  const USDtoZSDnumFun = async () => {
    try {
      const USDtoZSDnum = await readContract({
        contract: ZSDSWAPContract,
        method: "function getAmountZSDOut(uint256) view returns (uint256)",
        params: [BigInt(1000000000000000000)],
      });
      const WeiBalance = USDtoZSDnum.toString();
      SetPrice(WeiBalance)
    } catch (error) {
      console.error("查询失败:", error);
    }
  };

  const onFinish = async (values: any) => {
    try {
      const ZSDBalance = await balanceOf({
        contract: ZSD,
        address: account.address
      });
      // 查询账户ZSD数量
      const WeiBalancetwo = BigInt(ZSDBalance.toString());
      const USDT_DECIMALStwo = 6;
      const usdtBalancetwo =
        WeiBalancetwo / BigInt(10 ** (18 - USDT_DECIMALStwo));
      const Compare = parseFloat(usdtBalancetwo.toString());
      const formattedBalancetwo = Compare == 0 ? Compare : (parseFloat(usdtBalancetwo.toString()) / 10 ** USDT_DECIMALStwo).toFixed(2);

      // 账户ZSD数量是否足够兑换USDT
      if (Number(formattedBalancetwo) <= 0) {
        message.info("您的账户ZSD余额不足,无法进行兑换！");
        return
      }

      const banlance: any = 10000000000000000000000000 * 10 ** 18
      const amountStr = values.USDT_one_amount * 10 ** 18;

      // 第一次授权
      const tx1 = prepareContractCall({
        contract: USDTContract,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDSwapAddress, banlance],
      });
      const tx1Result = await sendAndConfirmTransaction({
        transaction: tx1,
        account: account
      });

      // 第二次授权
      const tx2 = prepareContractCall({
        contract: ZSD,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDSwapAddress, banlance],
      });
      const tx1Result1 = await sendAndConfirmTransaction({
        transaction: tx2,
        account: account
      });

      // 发送交易并等待用户签名确认
      const tx3 = prepareContractCall({
        contract: ZSDSWAPContract,
        method: "function zsdtTokenTousdtTokenSwap(uint256 amountzsdtToken)",
        params: [BigInt(amountStr)]
      });
      const result = await sendAndConfirmTransaction({
        transaction: tx3,
        account: account
      });
    } catch (error) {
      console.error("未能成功兑换USDT:", error);
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

  useEffect(() => {
    if (account) {
      SetPriceAccount(account.address)
    }
  }, [account]);

  useEffect(() => {
    USDtoZSDnumFun()
  }, []);
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
                  onChange={(e: any) => {
                    const tokenValue = (e.target.value) / price * 10 ** 18;
                    form.setFieldsValue({
                      ZSD_two_amount: tokenValue,
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                colon={false}
                name="ZSD_two_amount"
              >
                <Input
                  addonAfter={selectAftertwo}
                  className={styles.inputstyle}
                  disabled
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