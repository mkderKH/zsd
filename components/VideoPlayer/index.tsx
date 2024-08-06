import React from "react";
import { Row, Col } from "antd";
import styles from "./index.module.scss";

const VideoPlayer = () => {
  return (
    <Row justify="center" align="middle" className={styles.Row}>
      <Col>
        <video className={styles.video} width="100%" controls>
          <source
            src="https://violet-changing-horse-877.mypinata.cloud/ipfs/QmWoFxzAZ3pXcGTyBvvZsM6NE3GNE7UY2y6GfLjAxgWiuu"
            type="video/mp4"
          />
          您的浏览器不支持视频标签。
        </video>
      </Col>
    </Row>
  );
};

export default VideoPlayer;
