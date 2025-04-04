import React from "react";

const Card = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => (
  <div className="border-b pb-2 mb-2">
    <h3 className="text-lg font-semibold">{children}</h3>
  </div>
);

export const CardContent = ({ children }) => <div>{children}</div>;

export const CardTitle = ({ children }) => (
  <div>
  <h2 className="text-xl font-bold">{children}</h2>
  </div>
);

export default Card; // ✅ Ensure Card is exported as default
