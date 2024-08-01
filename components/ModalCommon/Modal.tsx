import React, { useState, useEffect } from "react";
import { Modal, Input } from "antd";

interface ModalInviteProps {
  IsModalOpen: boolean;
}

const ModalInvite: React.FC<ModalInviteProps> = ({ IsModalOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(IsModalOpen);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    setIsModalOpen(IsModalOpen);
  }, [IsModalOpen]);
  return (
    <div>
      <Modal
        title=""
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <h1>邀请链接</h1>
        <Input placeholder="请填写/粘帖邀请链接" />
      </Modal>
    </div>
  );
};

export default ModalInvite;
