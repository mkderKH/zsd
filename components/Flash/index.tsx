"use client";
import React, { useState, useEffect } from "react";
import { Button, Form, Input, Row, Col, Select, message } from "antd";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  toWei,
  readContract,
  sendAndConfirmTransaction,
} from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { approve, allowance, balanceOf } from "thirdweb/extensions/erc20";
import styles from "./index.module.scss";
const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });

// 导入API配置
import { APIConfig } from "../../abi/APIConfiguration";
import { bsc } from "thirdweb/chains";
import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDABI } from "../../abi/ZSDABI";
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";
import { info } from "console";

const USDTAbinew: any = USDTAbi;
const ZSDNewABI: any = ZSDABI;
const contractwapABI: any = ZSDSwapABI;
const contractROJECTABI: any = ZSDPROJECTABI;

//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bsc,
});

//ZSDSWAP
const ZSDSWAPContract = getContract({
  client: client,
  address: APIConfig.ZSDSwapAddress,
  abi: contractwapABI,
  chain: bsc,
});

const ZSD = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  abi: ZSDNewABI,
  chain: bsc,
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
      const allowanceUSDTBalance = await allowance({
        contract: ZSD,
        owner: account.address,
        spender: "0x1b4a03f2f80d842b28582252ab9b1d32a4840400"
      });

      // 查询币是否足够兑换
      // if (Number(allowanceUSDTBalance.toString()) <= 0) {
      //   message.info("您的账户ZSD余额不足,无法进行兑换！");
      //   return
      // }

      //当前账户zsd限额小于10000000000
    if (allowanceUSDTBalance.toString()) {
        // const transaction = await approve({
        //   contract: ZSD,
        //   amount: "10000000000000000000000000",
        //   spender: '0x1b4a03f2f80d842b28582252ab9b1d32a4840400',
        // });
        // // 用户将usdt转给zsd合约

        const transaction = prepareContractCall({
          contract: ZSD,
          method: "function approve(address, uint256) returns (bool)",
          params: ['0x1b4a03f2f80d842b28582252ab9b1d32a4840400', 10000000000000000000000000n],
        });

       // const hash = await sendTransaction({ transaction, account });
      // 用户将usdt转给zsd合约
      const tx1Result = await sendAndConfirmTransaction({
        transaction: transaction,
        account: account,
      });

        console.log(tx1Result, 'tx1Result')

    }

      // console.log(values.ZSD_two_amount, '=================')
      // const decimals = 18;
      // const amountInMinimumUnits = values.ZSD_two_amount * Math.pow(10, decimals);
      // // 使用BigNumber进行精确计算
      // const BN = require('bignumber.js');
      // const amountBN = new BN(amountInMinimumUnits.toString());
      // console.log(amountBN.toFixed(0), '====================')



      // 兑换
      // debugger

      let number: any =  values.ZSD_two_amount * 10 **18;
      const transaction = prepareContractCall({
        contract: ZSDSWAPContract,
        method: "function zsdtTokenTousdtTokenSwap(uint256 amountzsdtToken)",
        params: [number],
      });
      //const result = await sendTransaction(transaction);

      const registerTXResult = await sendAndConfirmTransaction({
        transaction: transaction,
        account: account.address,
      });

      console.log(registerTXResult, 'resultresultresult',);
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