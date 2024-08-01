import React from "react";
import styles from "./index.module.scss";

interface ChildComponentProps {
  solt: React.ReactNode;
  title: string;
  styleMain?: React.CSSProperties;
}
const Content: React.FC<ChildComponentProps> = ({ solt, title, styleMain }) => {
  return (
    <div style={styleMain} className={styles.content}>
      <div className={styles.title}>{title}</div>
      {solt}
    </div>
  );
};

export default Content;
