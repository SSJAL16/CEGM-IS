import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';

const ConfirmationModal = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog layout="center">
        <ModalClose onClick={onClose} />
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="outlined" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" color="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default ConfirmationModal;
