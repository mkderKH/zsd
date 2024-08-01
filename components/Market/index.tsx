"use client";
import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import axios from "axios";
import { Spin } from "antd";
import Image from "next/image";

const Market = () => {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrencies([]);
      getCurrenciesData();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getCurrenciesData();
  }, []);

  // const getCurrenciesData = async () => {
  //   try {
  //     setLoading(true);
  //     const ids = "bitcoin,ethereum,binancecoin,ripple,solana,dogecoin";
  //     const response = await axios.get(
  //       `https://meta-world.dappweb.cn:38001/utility/v1/market/tokens`,
  //       {
  //         params: {
  //           category: "onekey-gainers",
  //           sparkline: true,
  //           sparklinePoints: 100,
  //           ids: ids,
  //         },
  //         headers: {
  //           "Cache-Control": "max-age=0", // 例如，请求时计算得出的值
  //           Cookie: "SESSIONID=...", // 需要在发送请求时计算得出
  //           Host: "meta-world.dappweb.cn:38001",
  //           "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
  //           Accept: "*/*", // 通常用于接受所有类型的响应
  //           "Accept-Encoding": "gzip, deflate, br", // 浏览器支持的压缩格式
  //           Connection: "keep-alive",
  //           "X-Onekey-Request-Currency": "usd", // 根据您提供的参数
  //         },
  //       }
  //     );
  //     setCurrencies(response.data.data);
  //     setLoading(false);
  //     // if (response.status === 0 && Array.isArray(response.data)) {
  //     //   setCurrencies(response.data)
  //     //   setLoading(false);
  //     // } else {
  //     //   console.error('响应数据格式不正确或请求失败');
  //     //   setLoading(false);
  //     //   setCurrencies([]);
  //     // }
  //   } catch (error) {
  //     console.error("请求错误:", error);
  //     setLoading(false);
  //     setCurrencies([]);
  //   }
  // };

  const getCurrenciesData = async () => {
    try {
      setLoading(true);
      const ids = "bitcoin,ethereum,binancecoin,ripple,solana,dogecoin";
      // 注意：移除了之前设置的被认为是不安全的请求头
      const response = await axios.get(
        `https://meta-world.dappweb.cn:38001/utility/v1/market/tokens`,
        {
          params: {
            category: "onekey-gainers",
            sparkline: true,
            sparklinePoints: 100,
            ids: ids,
          },
          // 保留必要的自定义请求头，移除自动设置的请求头
          headers: {
            "X-Onekey-Request-Currency": "usd",
          },
        }
      );
      setCurrencies(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("请求错误:", error);
      setLoading(false);
      setCurrencies([]);
    }
  };

  // const sortCurrencies = (key: any) => {
  //   if (sortKey === key) {
  //     setSortOrder((order) => -order);
  //   } else {
  //     setSortKey(key);
  //     setSortOrder(1);
  //   }
  //   setCurrencies((prevCurrencies: any) => {
  //     return [...prevCurrencies].sort((a, b) => {
  //       if (a[key] < b[key]) {
  //         return sortOrder;
  //       }
  //       if (a[key] > b[key]) {
  //         return -sortOrder;
  //       }
  //       return 0;
  //     });
  //   });
  // };

  return (
    <div className={styles.container}>
      <div className={styles.marketstyle}>行情</div>

      <div className={styles.titleContent}>
        <div className={styles.marketInfo}>
          <span>市值</span>
        </div>

        <div className={styles.priceInfo}>
          <span className={styles.newtext}>最近价</span>
          {/* <div className={styles.sortStyle}>
            <div className={styles.sortIcon}>
              <span
                className={
                  sortKey === "lastPrice" && sortOrder === 1
                    ? styles.active
                    : ""
                }
                onClick={() => sortCurrencies("lastPrice")}
              >
                &#9650;
              </span>
            </div>
            <div className={styles.sortIcon}>
              <span
                className={
                  sortKey === "lastPrice" && sortOrder === -1
                    ? styles.active
                    : ""
                }
                onClick={() => sortCurrencies("lastPrice")}
              >
                &#9660;
              </span>
            </div>
          </div> */}
        </div>

        <div className={styles.fluctuateInfo}>
          <span className={styles.newtext}>24H波动</span>
          {/* <div className={styles.sortStyle}>
            <div className={styles.sortIcon}>
              <span
                className={
                  sortKey === "priceChange" && sortOrder === 1
                    ? styles.active
                    : ""
                }
                onClick={() => sortCurrencies("priceChange")}
              >
                &#9650;
              </span>
            </div>
            <div className={styles.sortIcon}>
              <span
                className={
                  sortKey === "priceChange" && sortOrder === -1
                    ? styles.active
                    : ""
                }
                onClick={() => sortCurrencies("priceChange")}
              >
                &#9660;
              </span>
            </div>
          </div> */}
        </div>
      </div>
      <Spin spinning={loading} tip="请稍等，数据实时刷新中...">
        {currencies.map((currency: any, index: any) => (
          <div key={index} className={styles.currencyItem}>
            <div className={styles.currencyInfo}>
              <Image
                src={`https://salmon-fortunate-goat-221.mypinata.cloud/ipfs/QmUenvyCWQKeYUps8d3dMotqie98MRcFKYWcsV1vSgAvSj/${currency.name}.png`}
                alt={currency.name}
                className={styles.btnIcon}
                width={48}
                height={48}
              />

              <div>
                <div className={styles.currencyName}>{currency.name}</div>
                <div className={styles.currencyMarketCap}>
                  ${(currency.marketCap / 1e9).toFixed(2)}B
                </div>
              </div>
            </div>

            <div className={styles.currencyPrice}>
              ${currency.price.toFixed(2)}
            </div>

            <div
              className={styles.currencyChange}
              style={{
                color:
                  currency.priceChangePercentage24H > 0
                    ? "#52B05AFF"
                    : "#EF2517",
              }}
            >
              {currency.priceChangePercentage24H.toFixed(2)}%
            </div>
          </div>
        ))}
      </Spin>
    </div>
  );
};

export default Market;
