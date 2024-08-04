import { message } from 'antd';

// 检测 Clipboard API 是否可用
const isClipboardApiSupported = () => {
  return 'clipboard' in navigator;
};

// 优化的 copyToClipboard 函数
const RightMenu = async (text: string): Promise<void> => {
  try {
    if (isClipboardApiSupported()) {
      // 使用新的异步 Clipboard API
      await navigator.clipboard.writeText(text);
      message.success('复制成功');
    } else {
      // 退回到 document.execCommand 方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed'; // 防止出现滚动条
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      if (successful) {
        message.success('复制成功');
      } else {
        message.error('复制失败，请稍后重试');
      }

      document.body.removeChild(textArea);
    }
  } catch (err) {
    console.error('复制时发生错误：', err);
    message.error('复制失败，请稍后重试');
  }
};

export default RightMenu;



