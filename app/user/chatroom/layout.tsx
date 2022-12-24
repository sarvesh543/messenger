import React from "react";
import Providers from "../../../providers/Providers";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Providers>{children}</Providers>
      {/* <Input /> */}
    </div>
  );
}

export default layout;
