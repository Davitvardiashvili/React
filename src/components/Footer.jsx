import React from "react";
import { Row } from "react-bootstrap";

const Footer = () => {
  return (
    <footer>
      <Row className="bigrow">
        <h6 className="ms-3 mt-3" style={{ color: "white" }}> Powered By Dada & </h6>
        {/* A fixed 100×100 container for the rabbit image */}
        <div className="white-rabbit ms-4" />
      </Row>
    </footer>
  );
};

export default Footer;
