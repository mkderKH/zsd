"use client";
import React, { useState, useEffect } from "react";
import {
  getContract,
  createThirdwebClient,
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
  toWei
} from "thirdweb";
import { approve, allowance } from "thirdweb/extensions/erc20";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { Button, Form, Input, Row, Col, Modal } from "antd";
import { bsc } from "thirdweb/chains";
import { APIConfig } from "../../abi/APIConfiguration";
import { USDTAbi } from "../../abi/USDTAbi";
import { ZSDABI } from "../../abi/ZSDABI";
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";

import styles from "./index.module.scss";
const THIRDWEB_PROJECT_ID: any = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
export const client = createThirdwebClient({ clientId: THIRDWEB_PROJECT_ID });

const contractABI: any = USDTAbi;
const contractZSDABI: any = ZSDABI;
const contractZSDPROJECTABI: any = ZSDPROJECTABI;
const contractZSDSwapABI: any = ZSDSwapABI;

const Commonform = () => {
  const [isButtonDisabledZSD, setIsButtonDisabledZSD] = useState<boolean>(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usdtValue, setUsdtValue] = useState<any>();
  const [zsdValue, setZsdValue] = useState<any>();
  const [token, setToken] = useState<any>();
  const account: any = useActiveAccount();
  const [formModal] = Form.useForm();
  const [formONE] = Form.useForm();
  const [form] = Form.useForm();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [price, SetPrice] = useState<any>();
  const [uSDTprice, setUSDTprice] = useState<any>(0);
  const [zsdprice, setZsdprice] = useState<any>(0);

  //USDT
  const USDT = getContract({
    client: client,
    address: APIConfig.USDTaddress,
    chain: bsc,
    abi: contractABI,
  });

  //用户必须已经授权本合约从USDT合约划转账务
  const ZSD = getContract({
    client: client,
    address: APIConfig.ZSDaddress,
    abi: contractZSDABI,
    chain: bsc,
  });

  const ZSDProjectContract = getContract({
    client: client,
    address: APIConfig.ZSDPROJECTAddress,
    abi: contractZSDPROJECTABI,
    chain: bsc,
  });

  const ZSDSwap = getContract({
    client: client,
    address: APIConfig.ZSDSwapAddress,
    abi: contractZSDSwapABI,
    chain: bsc,
  });

  const handleUsdtChange = (value: any) => {
    let Test = (value * 2) + (value / 3 * 7) * 3
    form.setFieldsValue({ ComputingPower_ZSD: Test });//将算力给到算力输入框
    setZsdprice(Test) //实时计算算力

    // 重置表单
    formONE.resetFields();
    // 异步更新状态
    setUsdtValue(""); // 重置 USDT 值状态
    setZsdValue(""); // 重置 ZSD 值状态
    setToken(""); // 重置 token 值状态
    setIsButtonDisabledZSD(!value);
    setIsButtonDisabled(true); //USDT

    const trimmedValue = value.trim();
    if (trimmedValue === "") {
      setUsdtValue("");
      setZsdValue("");
      setToken(""); // 确保 token 也被清空
      form.setFieldsValue({ zsdAddress: "" }); // 更新表单字段的值
      return;
    }
    const numberValue = parseFloat(trimmedValue);
    if (isNaN(numberValue)) {
      setUsdtValue("0");
      setZsdValue("0");
      form.setFieldsValue({ zsdAddress: "0" }); // 设置为 0 或保持错误状态
      return;
    }
    const zsdCalculated = Number(((numberValue * 7) / 3).toFixed(2));
    setUsdtValue(trimmedValue);
    setZsdValue(zsdCalculated);
    const tokenValue = zsdCalculated * price / 10 ** 18;
    setToken(tokenValue);
    form.setFieldsValue({ zsdAddress: tokenValue });
  };

  const ZSDChange = (value: any) => {
    const trimmedValue = value;
    if (trimmedValue === "") {
      setUsdtValue("");
      setZsdValue("");
      setToken(""); // 确保 token 也被清空
      form.setFieldsValue({ zsdAddress: "" }); // 更新表单字段的值
      return;
    }
    const numberValue = parseFloat(trimmedValue);
    if (isNaN(numberValue)) {
      setUsdtValue("0");
      setZsdValue("0");
      form.setFieldsValue({ zsdAddress: "0" }); // 设置为 0 或保持错误状态
      return;
    }
    const zsdCalculated = Number(((numberValue * 7) / 3).toFixed(2));
    setUsdtValue(trimmedValue);
    setZsdValue(zsdCalculated);
    const tokenValue = zsdCalculated * price / 10 ** 18;
    setToken(tokenValue);
    form.setFieldsValue({ zsdAddress: tokenValue });
  };

  const handleZsdChange = (value: string) => {
    const usdtCalculated = ((parseFloat(value) * 3) / 7).toFixed(2);
    setZsdValue(value);
    setUsdtValue(usdtCalculated);
    form.setFieldsValue({ usdtInput: usdtCalculated });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 充值USDT
  const depositUSDTFunds = async (amount: any) => {
    try {
      // debugger;
      const amount2 = amount * 10 ** 18;
      const transaction = prepareContractCall({
        contract: ZSDProjectContract,
        method: "function depositUSDTFunds(uint256)",
        params: [BigInt(amount2)]
      });
      // debugger;
      // 发送交易并等待用户签名确认
      const result = await sendTransaction(transaction);
      formONE.resetFields();
      setUsdtValue("");
      setZsdValue("");
      setToken("");
      setIsButtonDisabled(true);
    } catch (error) {
      console.error("充值交易失败:", error);
    }
  };

  // 充值ZSD
  const depositZSDFunds = async (amount: any) => {
    try {
      const amountStr: any = amount * 10 ** 18;
      // 发送交易并等待用户签名确认
      const tx3 = prepareContractCall({
        contract: ZSDProjectContract,
        method: "function depositUSDTANDZSDFunds(uint256)",
        params: [BigInt(amountStr)],
      });
      const result = await sendAndConfirmTransaction({
        transaction: tx3,
        account: account
      });
      form.resetFields();
      setUsdtValue("");
      setZsdValue("");
      setToken("");
      setIsButtonDisabledZSD(true);
    } catch (error) {
      console.error("充值交易失败:", error);
    }
  }

  // 充值地址
  const onFriendRechargeFun = async () => {
    const valuesmodal = formModal.getFieldsValue();
    const valuesZSD = form.getFieldsValue();
    form.resetFields();
    try {
      const amountStr = valuesZSD.usdtInput * 10 ** 18;
      const tx3 = prepareContractCall({
        contract: ZSDProjectContract,
        method: "function addusdt(address,uint256)",
        params: [valuesmodal.RechargeAddress, BigInt(amountStr)]
      });
      const result = await sendAndConfirmTransaction({
        transaction: tx3,
        account: account
      });
      form.resetFields();
      setUsdtValue("");
      setZsdValue("");
      setToken("");
      setIsButtonDisabledZSD(true);

      setIsModalOpen(false); // 关闭模态框
      formModal.resetFields(); // 重置表单字段
    } catch (error) {
      console.error("充值交易失败:", error);
    }
  };

  // 充值操作
  const onFinish = async (values: any) => {
    if (values.USDT_one_SingleCharge) {
      try {
        if (values.USDT_one_SingleCharge) {
          await depositUSDTFunds(values.USDT_one_SingleCharge);
        }
      } catch (error) {
        // 处理充值过程中的错误
        console.error("处理充值请求时发生错误:", error);
      }
    } else if (values.zsdAddress) {
      // 充值ZSD
      await depositZSDFunds(values.usdtInput);
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
    form.setFieldsValue({
      usdtInput: usdtValue,
      zsdAddress: token,
    });
  }, [form, usdtValue, token, ZSDSwap]);
  return (
    <>
      {/* model1 */}
      <div className={styles.Content}>
        <Form
          name="amountUSDT"
          form={formONE}
          onFinish={onFinish}
          layout="vertical"
          style={{
            color: "white",
          }}
        >
          <Row>
            <Col span={24}>
              <div className={styles.ComputingPower}><span className={styles.Contentlabel}>USDT</span> <span className={styles.power}>算力：{uSDTprice}</span></div>
            </Col>
            <Col span={24}>
              <Form.Item
                colon={false}
                name="USDT_one_SingleCharge"
              >
                <Input
                  placeholder="请输入充入金额"
                  className={styles.inputstyle}
                  onChange={(e: any) => {
                    formONE.setFieldsValue({ ComputingPower_USDT: e.target.value * 2 }); // 更新表单字段的值
                    setUSDTprice(e.target.value * 2) //实时刷新计算算力
                    setIsButtonDisabled(!e.target.value);
                    setIsButtonDisabledZSD(true); //ZSD
                    // 当输入A则清除B，输入B则清除A
                    form.resetFields();
                    // 异步更新状态
                    setUsdtValue(""); // 重置 USDT 值状态
                    setZsdValue(""); // 重置 ZSD 值状态
                    setToken(""); // 重置 token 值状态
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div className={styles.labelContainer}>
                <span className={styles.labelLeft}>算力</span>
                <span className={styles.labelRight}> </span>
              </div>
            </Col>
            <Col span={24}>
              <Form.Item
                colon={false}
                name="ComputingPower_USDT"
              >
                <Input
                  placeholder="请输入充入算力"
                  className={styles.inputstyle}
                  onChange={(e: any) => {
                    formONE.setFieldsValue({ USDT_one_SingleCharge: e.target.value / 2 }); // 更新表单字段的值
                    setUSDTprice(e.target.value)
                  }}
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
                  充值
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      {/* model2 */}
      <div className={styles.Content}>
        <Form
          name="amountZSD"
          form={form}
          onFinish={onFinish}
          layout="vertical"
          style={{
            color: "white",
          }}
        >
          <Row>
            <Col span={24}>
              <div className={styles.ComputingPower}><span className={styles.Contentlabel}>USDT</span> <span className={styles.power}>算力：{zsdprice}</span></div>
            </Col>
            <Col span={24}>
              <Form.Item
                colon={false}
                name="usdtInput"
                initialValue={usdtValue}
              >
                <Input
                  placeholder="请输入充入金额"
                  value={usdtValue}
                  onChange={(e) => handleUsdtChange(e.target.value)}
                  className={styles.inputstyle}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <div className={styles.labelContainer}>
                <span className={styles.labelLeft}>ZSD</span>
                <span className={styles.labelRight}>ZSD: {price / 10 ** 18}</span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item colon={false} name="zsdAddress">
                <Input
                  className={styles.inputstyle}
                  value={token}
                  disabled
                  onChange={(e) => handleZsdChange(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div className={styles.labelContainer}>
                <span className={styles.labelLeft}>算力</span>
                <span className={styles.labelRight}> </span>
              </div>
            </Col>
            <Col span={24}>
              <Form.Item
                colon={false}
                name="ComputingPower_ZSD"
              // label="算力"
              >
                <Input
                  placeholder="请输入充入算力"
                  className={styles.inputstyle}
                  onChange={(e: any) => {
                    setZsdprice(e.target.value);
                    setUsdtValue(Number(e.target.value) / 9)
                    ZSDChange(Number(e.target.value) / 9)
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginBottom: "20px" }}>
            <Col span={24}>
              <span className={styles.CalculatedValue}>
                USDT+ZSD：
                {parseFloat(usdtValue || 0) + parseFloat(zsdValue || 0)}
              </span>
              <span className={styles.Ustyle}>USDT</span>
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
                  充值
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item>
                <Button
                  className={styles.buttonHelpFriendstyle}
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  disabled={isButtonDisabledZSD}
                >
                  帮好友充值
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      <Modal
        title=""
        open={isModalOpen}
        onCancel={handleCancel}
        destroyOnClose={true}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleCancel} className={styles.Cancelstyle}>
              取消
            </Button>
            <Button
              className={styles.verifystyle}
              htmlType="submit"
              onClick={onFriendRechargeFun}
            >
              确认
            </Button>
          </div>
        }
      >
        <Form form={formModal} name="friendRechargeForm">
          <Row>
            <div className={styles.Topmodel}>帮好友充值</div>
            <Col span={24}>
              <Form.Item
                name="RechargeAddress"
                label="充值地址"
              >
                <Input
                  className={styles.inputstyle}
                  placeholder="请输入充值的地址"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default Commonform;