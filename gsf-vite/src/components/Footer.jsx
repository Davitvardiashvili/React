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
    <footer style={styles.footer}>
      <p>&copy; Powered By DADA</p>
    </footer>
  );
};

export default Footer;