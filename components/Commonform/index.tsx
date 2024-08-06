"use client";
import React, { useState, useEffect } from "react";
import {
  getContract,
  createThirdwebClient,
  prepareContractCall,
  toWei,
  readContract,
  sendAndConfirmTransaction,
  toEther,
} from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { Button, Form, Input, Row, Col, Modal, message } from "antd";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
// import { bscTestnet } from "thirdweb/chains";  //测试网
import { bsc } from "thirdweb/chains"; //主网
import { APIConfig } from "../../abi/APIConfiguration";

import { USDTAbi } from "../../abi/USDTAbi";//USDTABI
import { ZSDABI } from "../../abi/ZSDABI";  //ZSDABI
import { ZSDPROJECTABI } from "../../abi/ZSDPROJECTABI";  //ZSDPROJECTABI
import { ZSDSwapABI } from "../../abi/ZSDSwapABI";  //ZSDSwapABI

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


  // 处理zsd
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

  // 处理 ZSD 输入框的变化
  const handleZsdChange = (value: string) => {
    const usdtCalculated = ((parseFloat(value) * 3) / 7).toFixed(2);
    setZsdValue(value);
    setUsdtValue(usdtCalculated);
    // 更新表单字段的值
    form.setFieldsValue({ usdtInput: usdtCalculated });
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 充值USDT
  const depositUSDTFunds = async (amount: any) => {
    try {
      const banlance: any = 10000000000000000000000000 * 10 ** 18;
      const tx1 = prepareContractCall({
        contract: USDT,
        method: "function approve(address, uint256) returns (bool)",
        params: [APIConfig.ZSDaddress, banlance],
      });
      const tx1Result = await sendAndConfirmTransaction({
        transaction: tx1,
        account: account
      });
      const transaction = prepareContractCall({
        contract: ZSDProjectContract,
        method: "function depositUSDTFunds(uint256)",
        params: [toWei(amount)],
      });

      // // 发送交易并等待用户签名确认
      // const result = await sendTransaction(transaction);
      // console.log(result, 'resultresultresult')

      message.info("您的USDT充值成功");
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
      const amountStr = amount.toString();
      try {
        // 用户ZSD余额
        const ZSDBalance = await readContract({
          contract: ZSD,
          method: "function balanceOf(address) view returns (uint256)",
          params: [account.address],
        });

        // if (Number(ZSDBalance.toString()) <= 0) {
        //   message.info("您的ZSD余额不足");
        //   return;
        // }

        //用户USDT的余额
        const allowanceZSDBalance = await readContract({
          contract: ZSD,
          method: "function allowance(address, address)",
          params: [account.address, APIConfig.ZSDaddress],
        });
        console.log(allowanceZSDBalance, 'allowanceZSDBalanceallowanceZSDBalance')

        const banlance: any = 100000000000000000000000000000 * 10 ** 18;
        if (allowanceZSDBalance <= 0) {
          // if (allowanceZSDBalance < banlance) {
          //用户将自己的 zsd转出banlance的权限赋予zsd合约
          const tx2 = prepareContractCall({
            contract: ZSD,
            method: "function approve(address, uint256) returns (bool)",
            params: [APIConfig.ZSDaddress, banlance],
          });
          const tx2Result = await sendAndConfirmTransaction({
            transaction: tx2,
            account: account,
          });
        }

        //用户usdt的余额
        const USDTBalance = await readContract({
          contract: USDT,
          method: "function balanceOf(address) view returns (uint256)",
          params: [account.address],
        });

        // if (USDTBalance == 0) {
        //   message.info("USDT余额为0，请充值USDT");
        //   return;
        // }

        //用户授权给ZSD合约可操作usdt的余额
        const allowanceUSDTBalance = await readContract({
          contract: USDT,
          method: "function allowance(address, address)",
          params: [account.address, APIConfig.ZSDaddress],
        });

        if (allowanceUSDTBalance < toWei(amount).valueOf()) {
          //zsd合约有权限调用用户 balance的资产
          //用户将自己的 将自己usdt转出banlance的权限赋予zsd合约
          const tx1 = prepareContractCall({
            contract: USDT,
            method: "function approve(address, uint256) returns (bool)",
            params: [APIConfig.ZSDaddress, banlance],
          });
          // 用户将usdt转给zsd合约
          const tx1Result = await sendAndConfirmTransaction({
            transaction: tx1,
            account: account,
          });
        }

        // 用户给zsd充值的数量不能超过balance
        const transaction = prepareContractCall({
          contract: ZSDProjectContract,
          method: "function depositUSDTANDZSDFunds(uint256)",
          params: [toWei(amountStr)],
        });
        // 发送交易并等待用户签名确认(首次需要，第二次不需要)
        const result = await sendTransaction(transaction);

        message.info("您的ZSD充值成功");
        form.resetFields();
        setUsdtValue("");
        setZsdValue("");
        setToken("");
        setIsButtonDisabledZSD(true);
      } catch (error) {
        console.error("充值交易失败:", error);
      }
    } catch (error) {
      console.error("充值交易失败:", error);
    }
  }

  // 充值地址
  const onFriendRechargeFun = async () => {
    try {
      if (!isButtonDisabled) {
        const valuesmodal = formModal.getFieldsValue();
        const valuesUSDT = formONE.getFieldsValue();
        // console.log(valuesmodal.RechargeAddress, "=================", valuesUSDT.USDT_one_SingleCharge);

        formONE.resetFields();
        try {
          //用户usdt的余额
          const USDTBalance = await readContract({
            contract: USDT,
            method: "function balanceOf(address) view returns (uint256)",
            params: [valuesmodal.RechargeAddress],
          });
          //用户的zsd余额
          const ZSDBalance = await readContract({
            // contract: ZSDContract,
            contract: ZSD,
            method: "function balanceOf(address) view returns (uint256)",
            params: [valuesmodal.RechargeAddress],
          });
          //zsd合约有权限调用用户 balance的资产
          const banlance: any = 10000000000000000000000000 * 10 ** 18;
          //用户将自己的 将自己usdt转出banlance的权限赋予zsd合约
          //用户授权给ZSD合约可操作usdt的余额
          const allowanceUSDTBalance = await readContract({
            contract: USDT,
            method: "function allowance(address, address)",
            params: [valuesmodal.RechargeAddress, APIConfig.ZSDaddress],
          });
          // if (allowanceUSDTBalance < toWei(amount).valueOf()) {
          //zsd合约有权限调用用户 balance的资产
          //用户将自己的 将自己usdt转出banlance的权限赋予zsd合约
          const tx1 = prepareContractCall({
            contract: USDT,
            method: "function approve(address, uint256) returns (bool)",
            params: [APIConfig.ZSDaddress, banlance],
          });
          // 用户将usdt转给zsd合约
          const tx1Result = await sendAndConfirmTransaction({
            transaction: tx1,
            account: valuesmodal.RechargeAddress,
          });
          // }
          // 用户给zsd充值的数量不能超过balance
          const transaction = prepareContractCall({
            // contract: ZSDContract,
            contract: ZSD,
            method: "function depositUSDTFunds(uint256)",
            params: [toWei(valuesUSDT.USDT_one_SingleCharge)],
          });
          // 发送交易并等待用户签名确认(首次需要，第二次不需要)
          const result = await sendTransaction(transaction);

          message.info("您的USDT充值成功");
          formONE.resetFields();
          setUsdtValue("");
          setZsdValue("");
          setToken("");
          setIsButtonDisabled(true);
        } catch (error) {
          console.error("充值交易失败:", error);
        }
      } else if (!isButtonDisabledZSD) {
        const valuesmodal = formModal.getFieldsValue();
        const valuesZSD = form.getFieldsValue();
        // console.log("输入地址：",valuesmodal.RechargeAddress,"输入ZSD：",valuesZSD.usdtInput,"登录账号：",account);

        form.resetFields();

        try {
          const amountStr = valuesZSD.usdtInput.toString();
          // console.log("输入金额：", amountStr);

          const banlance: any = 10000000000000000000000000 * 10 ** 18;
          //用户usdt的余额
          const USDTBalance = await readContract({
            contract: USDT,
            method: "function balanceOf(address) view returns (uint256)",
            params: [valuesmodal.RechargeAddress],
          });
          //用户的zsd余额
          const ZSDBalance = await readContract({
            // contract: ZSDContract,
            contract: ZSD,
            method: "function balanceOf(address) view returns (uint256)",
            params: [valuesmodal.RechargeAddress],
          });
          //用户usdt的余额
          const allowanceZSDBalance = await readContract({
            // contract: ZSDContract,
            contract: ZSD,
            method: "function allowance(address, address)",
            params: [valuesmodal.RechargeAddress, APIConfig.ZSDaddress],
          });

          // if (allowanceZSDBalance < banlance) {
          //用户将自己的 zsd转出banlance的权限赋予zsd合约
          const tx2 = prepareContractCall({
            // contract: ZSDContract,
            contract: ZSD,
            method: "function approve(address, uint256) returns (bool)",
            params: [APIConfig.ZSDaddress, banlance],
          });
          const tx2Result = await sendAndConfirmTransaction({
            transaction: tx2,
            account: valuesmodal.RechargeAddress,
          });
          // }

          //用户授权给ZSD合约可操作usdt的余额
          const allowanceUSDTBalance = await readContract({
            contract: USDT,
            method: "function allowance(address, address)",
            params: [valuesmodal.RechargeAddress, APIConfig.ZSDaddress],
          });

          // if (allowanceUSDTBalance < toWei(amount).valueOf()) {
          //zsd合约有权限调用用户 balance的资产
          //用户将自己的 将自己usdt转出banlance的权限赋予zsd合约
          const tx1 = prepareContractCall({
            contract: USDT,
            method: "function approve(address, uint256) returns (bool)",
            params: [APIConfig.ZSDaddress, banlance],
          });
          // 用户将usdt转给zsd合约
          const tx1Result = await sendAndConfirmTransaction({
            transaction: tx1,
            account: valuesmodal.RechargeAddress,
          });
          // }

          // 用户给zsd充值的数量不能超过balance
          // const transaction = prepareContractCall({
          //   contract: ZSDContract,
          //   method: "  function depositUSDTANDZSDFunds(uint256) ",
          //   params: [toWei(amountStr)],
          // });
          // 发送交易并等待用户签名确认(首次需要，第二次不需要)
          // const result = await sendTransaction(transaction);

          message.info("您的ZSD充值成功");
          form.resetFields();
          setUsdtValue("");
          setZsdValue("");
          setToken("");
          setIsButtonDisabledZSD(true);
        } catch (error) {
          console.error("充值交易失败:", error);
        }
      }
      setIsModalOpen(false); // 关闭模态框
      formModal.resetFields(); // 重置表单字段
    } catch (error) {
      console.error("获取表单值时发生错误:", error);
    }
  };

  // 充值操作
  const onFinish = async (values: any) => {
    // 充值USDT
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
      await depositZSDFunds(values.zsdAddress);
    }
  };

  // 校验钱包地址
  // const amountValidatorModel = (rule: any, value: any) => {
  //   // 如果没有输入值，校验通过（不填写则不校验）
  //   if (!value) {
  //     return Promise.resolve();
  //   }
  //   // 以太坊地址校验规则
  //   const reg = /^0x[a-fA-F0-9]{40}$/;
  //   // 检查输入值是否以 '0x' 开头，如果是，尝试去掉 '0x' 再次校验
  //   const formattedValue = value.replace(/^0x/i, "");
  //   // 检查是否通过正则表达式校验
  //   if (!reg.test(formattedValue)) {
  //     // 如果不匹配以太坊地址格式，校验失败
  //     return Promise.reject(new Error("请输入正确的以太坊地址"));
  //   }
  //   // 如果匹配，校验通过
  //   return Promise.resolve();
  // };

  // const amountValidator = (rule: any, value: any) => {
  //   if (!value) {
  //     return Promise.resolve();
  //   }
  //   const reg = /^[0-9]*$/;
  //   if (!reg.test(value)) {
  //     return Promise.reject(
  //       new Error("请输入有效的数字，不能输入负数和其他字符！")
  //     );
  //   }
  //   return Promise.resolve();
  // };

  // 查询ZSD的当前价格的异步函数
  // const ZSDfun = async () => {
  //   // amountIn: 存入的数量;
  //   // reserveIn: 存入资产的储备数量;
  //   // reserveOut: 输出资产的储备数量;
  //   try {
  //     // 调用智能合约的getAmountOut函数
  //     const ZSDamountOut = await readContract({
  //       contract: ZSDContract,
  //       method:
  //         "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)",
  //       params: [],
  //     });
  //     console.log("ZSDfun", ZSDamountOut);
  //   } catch (error) {
  //     console.error("Error fetching ZSD price: ", error);
  //   }
  // };

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
              // rules={[
              //   { required: true, message: "请输入充入金额!" },
              //   { validator: amountValidator },
              // ]}
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

            {/* 算力 */}
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
          <Row>
            <Col span={24}>
              <Form.Item>
                <Button
                  className={styles.buttonHelpFriendstyle}
                  onClick={showModal}
                  disabled={isButtonDisabled}
                >
                  帮好友充值
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
                {/* 当前zsd的价格 */}
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
            {/* 算力 */}
            <Col span={24}>
              <Form.Item
                colon={false}
                name="ComputingPower_ZSD"
              >
                <Input
                  placeholder="请输入充入算力"
                  className={styles.inputstyle}
                  onChange={(e: any) => {
                    setZsdprice(e.target.value);
                    setUsdtValue(Number(e.target.value) / 9)


                    // 反推USDT+ZSDT
                    ZSDChange(Number(e.target.value) / 9)

                    // form.setFieldsValue({
                    //   usdtInput: Number(e.target.value) / 9,
                    // });
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
                  onClick={showModal}
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
              // rules={[
              //   { required: true, message: "请输入充值地址!" },
              //   { validator: amountValidatorModel },
              // ]}
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
