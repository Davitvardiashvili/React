import React from "react";

const styles = {
  footer: {
    backgroundColor: "#04011E",
    color: "#fff",
    textAlign: "center",
    padding: "0.001rem",
    position: "fixed",
    width: "100%",
  },
};

const Footer = () => {
  return (
    <footer>
      <hr></hr>
      <h6 className="ms-3 text-secondary"> Powered By Dada &copy; All rights reserved.</h6>
    </footer>
  );
};

export default Footer;