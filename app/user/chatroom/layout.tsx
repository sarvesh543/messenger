import React from 'react'
import Input from '../../../components/Input';


function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <Input />
    </div>
  );
}

export default layout