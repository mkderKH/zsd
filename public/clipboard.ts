import { message } from 'antd';

// 检测 Clipboard API 是否可用
const isClipboardApiSupported = () => {
  return 'clipboard' in navigator;
};

// 优化的 copyToClipboard 函数
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    if (isClipboardApiSupported()) {
      // 使用新的异步 Clipboard API
      // await navigator.clipboard.writeText(text);

      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      message.success('复制成功');
    } else {
      // 退回到 document.execCommand 方法
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; // 防止出现滚动条
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          message.success('复制成功');
        } else {
          message.error('复制失败，请稍后重试');
        }
      } catch (err) {
        message.error('复制失败，请稍后重试');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    message.error('复制失败，请稍后重试');
  }
};