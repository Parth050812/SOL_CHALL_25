import React from "react";

const Button = ({ children, onClick, className, type = "button" }) => {
  return (
    <button
      type={type}
      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
