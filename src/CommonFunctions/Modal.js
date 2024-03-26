import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

const ModalComponent = ({ handleModalClose, modalDetails }) => {
  const { isShow: show, header, body, footer, size = "md" } = modalDetails;
  return (
    <>
      <Modal show={show} onHide={handleModalClose} size={size}>
        <Modal.Header closeButton>
          <Modal.Title>{header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{body}</Modal.Body>
        <Modal.Footer>{footer}</Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalComponent;
