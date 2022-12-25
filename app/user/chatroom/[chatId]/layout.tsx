import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      {/* <Input /> */}
    </div>
  );
}

export default layout;
