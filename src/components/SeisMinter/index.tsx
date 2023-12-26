'use client'

import React, { useCallback, useRef, useState } from 'react'
import { getSigningCosmWasmClient } from '@sei-js/core'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  DirectSecp256k1HdWallet,
  DirectSecp256k1Wallet,
} from '@cosmjs/proto-signing'

import { calculateFee } from '@cosmjs/stargate'
import { Table, Popconfirm, Button } from 'antd'
import useWalletsV1, { WalletV1 } from '@/hooks/useWalletsV1'
import { ellipsisText, formatBalance } from '@/utils/format'
import {
  generateWalletFromMnemonic,
  generateWalletFromPrivateKey,
  querySeiBalance,
} from './wallet'

// const RPC_URL = "https://sei-rpc.polkachu.com/";
const REST_URL = 'https://sei-api.polkachu.com/'

const RPC_URL_2 = 'https://sei-rpc.brocha.in/'
// const RPC_URL_3 = "https://rpc.sei-apis.com/";
// const RPC_URL_4 = "https://sei-m.rpc.n0ok.net/";
// const RPC_URL_5 = "https://sei-rpc.lavenderfive.com/";

const Minter: React.FC = () => {
  const [isEnd, setIsEnd] = useState<boolean>(false)
  const isEndRef = useRef<boolean>(false)
  isEndRef.current = isEnd
  const [logs, setLogs] = useState<string[]>([])

  const { wallets, importWallet, modalContext, removeWallet } = useWalletsV1()
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [counts, setCounts] = useState<Record<string, number>>({})

  const mintFn = useCallback(
    async (client: SigningCosmWasmClient, address: string) => {
      try {
        const msg = {
          p: 'sei-20',
          op: 'mint',
          tick: 'seis',
          amt: '1000',
        }
        const msg_base64 = btoa(`data:,${JSON.stringify(msg)}`)
        const fee = calculateFee(100000, '0.13usei')
        const response = await client.sendTokens(
          address,
          address,
          [{ amount: '1', denom: 'usei' }],
          fee,
          msg_base64
        )
        setLogs((pre) => [
          ...pre,
          `铸造完成, txhash: ${response.transactionHash}`,
        ])
        setCounts((pre) => ({ ...pre, [address]: pre[address] + 1 }))
      } catch (e) {
        // sleep 1s
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    },
    []
  )

  const updateBalance = useCallback(async (_addr: string) => {
    const balance = await querySeiBalance(_addr)
    setBalances((pre) => ({ ...pre, [_addr]: balance.amount }))
  }, [])

  const walletMint = useCallback(
    async (walletV1: WalletV1) => {
      let w: DirectSecp256k1HdWallet | DirectSecp256k1Wallet | undefined
      if (walletV1.type === 'hd') {
        w = await generateWalletFromMnemonic(walletV1.priv)
      }
      if (walletV1.type === 'privateKey') {
        w = await generateWalletFromPrivateKey(walletV1.priv)
      }

      if (!w) {
        return
      }

      const accounts = await w.getAccounts()
      const balance = await querySeiBalance(accounts[0].address)
      console.log(balance)
      if (Number(balance.amount) === 0) {
        setLogs((pre) => [...pre, `账户余额不足`])
        return
      } else {
        setLogs((pre) => [...pre, `钱包: ${accounts[0].address}开始挖矿`])
      }

      const signingCosmWasmClient = await getSigningCosmWasmClient(RPC_URL_2, w)

      while (true) {
        if (isEndRef.current) {
          setLogs((pre) => [...pre, `暂停铸造`])
          break
        }
        await mintFn(signingCosmWasmClient, accounts[0].address)
      }
    },
    [mintFn]
  )

  const handleMint = async () => {
    setIsEnd(false)
    setLogs((pre) => [...pre, `开始铸造`])

    // 验证助记词
    if (!wallets.length) {
      setLogs((pre) => [...pre, `请导入钱包`])
      return
    }

    for (let i = 0; i < wallets.length; i++) {
      walletMint(wallets[i])
    }
  }

  const handleEnd = () => {
    setIsEnd(true)
    isEndRef.current = true
  }

  const columns = [
    {
      title: '账号',
      dataIndex: 'address',
      key: 'address',
      render: (_addr: string) => {
        return ellipsisText(_addr, 8, 8)
      },
    },
    {
      title: '余额(SEI)',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: 'Mint次数',
      dataIndex: 'mints',
      key: 'mints',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (_: any, record: { key: React.Key }) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => {
              removeWallet(record.key as string)
            }}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ]

  const generateWalletFromInput = useCallback(
    async (_p: string) => {
      let account: any | null = null
      try {
        const wallet = await generateWalletFromMnemonic(_p)
        const accounts = await wallet.getAccounts()
        account = {
          address: accounts[0].address,
          priv: _p,
          type: 'hd',
        }
        updateBalance(accounts[0].address)
      } catch (e) {
        console.error(e)
      }
      if (!account) {
        try {
          const wallet = await generateWalletFromPrivateKey(_p)
          const accounts = await wallet.getAccounts()
          account = {
            address: accounts[0].address,
            priv: _p,
            type: 'privateKey',
          }
          updateBalance(accounts[0].address)
        } catch (e) {
          console.error(e)
        }
      }
      return account
    },
    [updateBalance]
  )

  const dataSource = wallets.map((w) => {
    return {
      key: w.address,
      address: w.address,
      balance: balances[w.address]
        ? `${formatBalance(balances[w.address], 6)}`
        : '0',
      mints: counts[w.address] || 0,
      action: '删除',
    }
  })

  return (
    <>
      <h1>Seis疯狂铸造脚本</h1>
      <p className="text-xs mt-2 text-gray-400">打到账户没钱为止</p>
      <div className="space-x-4">
        <Button
          className="mt-2"
          onClick={() => {
            importWallet(generateWalletFromInput)
          }}
        >
          导入钱包
        </Button>
        <Button
          className="mt-2"
          onClick={() => {
            importWallet(generateWalletFromInput)
          }}
        >
          更新余额
        </Button>
      </div>

      <Table
        bordered
        className="mt-2 w-full"
        dataSource={dataSource}
        columns={columns}
      />
      <div className="flex w-[400px] justify-center space-x-6 mt-4">
        <Button type="primary" onClick={handleMint}>
          开始铸造
        </Button>
        <Button onClick={handleEnd}>暂停</Button>
      </div>
      <span className="mt-6 w-full text-left">日志</span>
      <div className="px-4 py-2 whitespace-pre border border-solid border-black w-full h-[400px] overflow-auto">
        {logs.join('\n')}
      </div>
      {modalContext}
    </>
  )
}

export default Minter
