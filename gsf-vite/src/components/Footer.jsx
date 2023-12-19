import React from "react";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; Powered By DADA</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#04011E",
    color: "#fff",
    textAlign: "center",
    padding: "0.1rem",
    position: "fixed",
    // bottom: 0,
    width: "100%",
  },
};

export default Footer;