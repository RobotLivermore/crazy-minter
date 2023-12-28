'use client'

import React, { useCallback, useState } from 'react'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'

import { Table, Button, Input } from 'antd'
import { ellipsisText } from '@/utils/format'
import { HdPath, stringToPath } from '@cosmjs/crypto'
import { bytesToHex } from '@/utils/bytes'
import copy from 'copy-to-clipboard'

const getHdPath = (accountIndex = 0): HdPath => {
  const stringPath = `m/44'/118'/0'/0/${accountIndex}`
  return stringToPath(stringPath)
}

const WalletGenerator: React.FC = () => {
  const [mnemonic, setMnemonic] = useState<string>('')
  const [amount, setAmount] = useState<number>(1)

  const [accounts, setAccounts] = useState<any[]>([])

  const generateAccount = useCallback(async () => {
    const hdPaths = new Array(amount)
      .fill(0)
      .map((_, index) => getHdPath(index))
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'sei',
      hdPaths,
    })
    const accountList = (await (
      wallet as any
    ).getAccountsWithPrivkeys()) as any[]
    console.log('accountList', accountList)
    setAccounts(accountList)
  }, [amount, mnemonic])

  const data = accounts.map((account, index) => ({
    key: account.address,
    path: `m/44'/118'/0'/0/${index}`,
    address: account.address,
    privateKey: bytesToHex(account.privkey),
  }))

  return (
    <div className="w-full">
      <h1>账号生成器</h1>
      <p>助记词</p>
      <Input.TextArea
        rows={4}
        placeholder="请输入助记词"
        onChange={(e) => setMnemonic(e.target.value)}
      />
      <p>生成数量</p>
      <Input
        type="number"
        placeholder="请输入生成账号数量"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <div className="flex items-center space-x-4 py-6">
        <Button type="primary" onClick={generateAccount}>
          生成
        </Button>
        <Button
          type="primary"
          onClick={() => {
            copy(data.map((d) => d.privateKey).join(','))
          }}
        >
          复制所有私钥
        </Button>
        <Button
          type="primary"
          onClick={() => {
            copy(data.map((d) => d.address).join(','))
          }}
        >
          复制所有地址
        </Button>
      </div>
      <Table
        bordered
        scroll={{ x: true }}
        className="max-w-[1200px] w-full overflow-auto"
        columns={[
          {
            title: '路径',
            dataIndex: 'path',
            key: 'path',
          },
          {
            title: '账号',
            dataIndex: 'address',
            key: 'address',
            render: (text: string) => ellipsisText(text, 10),
          },
          {
            title: '私钥',
            dataIndex: 'privateKey',
            key: 'privateKey',
            render: (text: string) => text,
          },
        ]}
        dataSource={data}
      />
    </div>
  )
}

export default WalletGenerator
