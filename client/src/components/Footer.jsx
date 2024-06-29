/* eslint-disable no-unused-vars */
import React from "react";
import Svgs from "./Svgs";
function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="footer">
    <footer>
      <p>Copyright To Pushkar Shah ⓒ {year}</p>
     
    </footer>
    </div>
  );
}

export default Footer;
