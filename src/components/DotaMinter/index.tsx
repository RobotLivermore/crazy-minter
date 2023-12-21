"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Keyring from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { ApiPromise, WsProvider } from "@polkadot/api";
import Button from "../ui/Button";

const Minter: React.FC = () => {
  const [privs, setPrivs] = useState<string>("");
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const isEndRef = useRef<boolean>(false);
  isEndRef.current = isEnd;
  const [logs, setLogs] = useState<string[]>([]);
  const [isView, setIsView] = useState<boolean>(true);
  const [count, setCount] = useState<number>(0);

  const walletMint = useCallback(async (priv: string, idx: number) => {
    await cryptoWaitReady();
    // 导入钱包

    const keyring = new Keyring({ type: "sr25519" });
    let newAccount: KeyringPair;
    try {
      newAccount = keyring.addFromMnemonic(priv.trim());
      setLogs((pre) => [...pre, `成功导入钱包: ${newAccount.address}`]);
    } catch (e) {
      console.log(e);
      setLogs((pre) => [...pre, `第${idx + 1}个私钥错误`]);
      return;
    }
    setLogs((pre) => [...pre, `开始连接网络.......`]);

    // 连接到波卡节点
    const provider = new WsProvider("wss://rpc.polkadot.io");
    const api = await ApiPromise.create({ provider });
    const { nonce, data: balance } = (await api.query.system.account(
      newAccount.address
    )) as any;
    console.log(balance.free);

    setLogs((pre) => [...pre, `钱包余额: ${balance.free} uDOT`]);
    if (balance.free.toString() === "0") {
      setLogs((pre) => [...pre, `账户余额不足`]);
      return;
    }

    const remark = JSON.stringify({
      p: "dot-20",
      op: "mint",
      tick: "DOTA",
    });

    // // 创建一个批处理交易
    // const batch = api.tx.utility.batchAll([
    //   api.tx.balances.transferKeepAlive(newAccount.address, 0),
    //   api.tx.system.remark(remark),
    // ]);

    // // 发送批处理交易
    // const hash = await batch.signAndSend(newAccount);
    // setLogs((pre) => [...pre, `铸造完成, txhash: ${hash}`]);

    while (true) {
      if (isEndRef.current) {
        setLogs((pre) => [...pre, `暂停铸造`]);
        break;
      }
      try {
        // 创建一个批处理交易
        const batch = api.tx.utility.batchAll([
          api.tx.balances.transferKeepAlive(newAccount.address, 0),
          api.tx.system.remark(remark),
        ]);

        // 发送批处理交易
        const hash = await batch.signAndSend(newAccount);
        setCount((prev) => prev + 1);
        setLogs((pre) => [...pre, `铸造完成, txhash: ${hash}`]);
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
      <h1>dota Inscription疯狂铸造脚本</h1>
      <p className="text-xs mt-2 text-gray-400">打到账户没钱为止</p>
      <div className="text-xs w-[400px] mt-6">
        <span>项目方推特：</span>
        <Link
          className="underline"
          target="_blank"
          href="https://twitter.com/dot20_dota"
        >
          https://twitter.com/dot20_dota
        </Link>
      </div>
      <div className="text-xs w-[400px] mt-2">
        <span>项目网址：</span>
        <Link
          className="underline"
          target="_blank"
          href="https://dota.fyi/token"
        >
          https://dota.fyi/token
        </Link>
      </div>
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
          placeholder="请输入助记词，比如：jazz bench loan chronic ready pelican travel charge lunar pear detect couch。当有多的账号的时候，用,分割，比如:jazz bench loan chronic ready pelican travel charge lunar pear detect couch,black clay figure average spoil insane hire typical surge still brown object"
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

      <span className="mt-6 w-[400px] text-left font-bold text-lg">{`日志(本次已铸造+${count})`}</span>
      <p className="text-xs text-left w-[400px]  mt-2 mb-2 text-gray-400">
        一开始连接比较慢，铸造失败不扣币。
      </p>
      <div className="px-4 py-2 whitespace-pre border border-black w-[400px] h-[400px] overflow-auto">
        {logs.join("\n")}
      </div>
    </div>
  );
};

export default Minter;
