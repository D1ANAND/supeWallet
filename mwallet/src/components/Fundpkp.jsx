import React, { useState } from 'react';
import { Input, Button } from 'antd'; 
import { fundPKP } from "../utils";

const Fundpkp = ({ onComplete }) => {
  const [value, setValue] = useState(""); 

  const handleChange = (e) => {
    setValue(e.target.value); 
  }

  const handleFund = async () => {
    if (value) {
      try {
        await fundPKP(value); 
        console.log("Funding successful");
        if (onComplete) {
          onComplete(); 
        }
      } catch (error) {
        console.error("Funding failed:", error);
      }
    } else {
      console.log("Please enter a valid amount to fund");
    }
  }

  return (
    <div>
      <Input
        placeholder="Enter the fund amount"
        onChange={handleChange}
        value={value} 
      />
      <Button
        style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
        onClick={handleFund} 
      >
        Send fund
      </Button>
    </div>
  );
}

export default Fundpkp;
