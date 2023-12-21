"use client";

import React, { useCallback, useRef, useState } from "react";
import { ethers } from "ethers";
import { bytesToHex } from "@/utils/bytes";
import Image from "next/image";
import Button from "../ui/Button";

const Minter: React.FC = () => {
  const [privs, setPrivs] = useState<string>("");
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const isEndRef = useRef<boolean>(false);
  isEndRef.current = isEnd;
  const [logs, setLogs] = useState<string[]>([]);
  const [isView, setIsView] = useState<boolean>(true);

  const walletMint = useCallback(async (priv: string, idx: number) => {
    const provider = new ethers.JsonRpcProvider(
      "https://api.avax.network/ext/bc/C/rpc"
    );
    let wallet: ethers.Wallet;
    try {
      wallet = new ethers.Wallet(priv, provider);
      setLogs((pre) => [...pre, `成功导入钱包: ${wallet.address}`]);
    } catch (e) {
      setLogs((pre) => [...pre, `第${idx + 1}个私钥错误`]);
      return;
    }

    const balance = await provider.getBalance(wallet.address);
    setLogs((pre) => [...pre, `钱包余额: ${ethers.formatEther(balance)} AVAX`]);

    // console.log(balance, ethers.formatEther(balance));
    if (balance.toString() === "0") {
      setLogs((pre) => [...pre, `账户余额不足`]);
      return;
    }
    const ec = new TextEncoder();
    const text = ec.encode(
      `data:,{"p":"asc-20","op":"mint","tick":"dino","amt":"100000000"}`
    );
    setLogs((pre) => [...pre, `Mint Hex:${bytesToHex(text)}`]);
    while (true) {
      if (isEndRef.current) {
        setLogs((pre) => [...pre, `暂停铸造`]);
        break;
      }
      try {
        const tx = await wallet.sendTransaction({
          to: wallet.address,
          value: 0,
          gasLimit: 23000,
          data: `0x${bytesToHex(text)}`,
        });
        setLogs((pre) => [...pre, `铸造完成, txhash: ${tx.hash}`]);
      } catch (e: any) {
        setLogs((pre) => [...pre, `铸造失败:${e.message}}`]);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }, []);

  const handleMint = async () => {
    setIsEnd(false);
    setLogs((pre) => [...pre, `开始铸造`]);

    // 验证助记词
    if (!privs) {
      setLogs((pre) => [...pre, `请输入助记词`]);
      return;
    }
    const privsList = privs.split(",");

    for (let i = 0; i < privsList.length; i++) {
      walletMint(privsList[i], i);
    }
  };

  const handleEnd = () => {
    setIsEnd(true);
    isEndRef.current = true;
  };

  return (
    <div className="flex flex-col items-center">
      <h1>EVM Inscription疯狂铸造脚本</h1>
      <p className="text-xs mt-2 text-gray-400">打到账户没钱为止</p>
      <div className="flex flex-col mt-6">
        <span
          className="text-xs rounded-md flex w-6 h-6 justify-center items-center cursor-pointer hover:bg-gray-100"
          onClick={() => {
            setIsView((pre) => !pre);
          }}
        >
          {isView ? (
            <Image src="/icons/eye.svg" width={16} height={16} alt="visible" />
          ) : (
            <Image
              src="/icons/eye-slash.svg"
              width={16}
              height={16}
              alt="visible"
            />
          )}
        </span>
        <textarea
          className="mt-2 border border-black rounded-xl w-[400px] px-4 py-4 resize-none h-[220px]"
          placeholder="请输入私钥，比如：0f5d3cd02dc0958110ed2fa63c1ac2b3163c6c6c35ccca7cbfda5be42b412023。当有多的账号的时候，用,分割，比如: ef5d3cd02dc0958110ed2fa63c1ac2b3163c6c6c35ccca7cbfda5be42b412023,ba1fb7df7264b8a49f1879a9ab93ee01bef6c2fedf3e6e2a41d35c611d39915d"
          value={isView ? privs : !privs ? "" : "*************************"}
          onChange={(e) => setPrivs(e.target.value)}
        />
      </div>
      <div className="flex w-[400px] justify-center space-x-6 mt-4">
        <Button
          text="开始铸造"
          theme="primary"
          className="border w-[150px] border-black px-4 py-2 rounded-full"
          onClick={handleMint}
        />
        <Button
          text="暂停"
          theme="outline"
          className="border w-[150px] border-black px-4 py-2 rounded-full"
          onClick={handleEnd}
        />
      </div>

      <span className="mt-6 w-[400px] text-left">日志</span>
      <div className="px-4 py-2 whitespace-pre border border-black w-[400px] h-[400px] overflow-auto">
        {logs.join("\n")}
      </div>
    </div>
  );
};

export default Minter;
