'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Input, Modal } from 'antd'
import { getSigningCosmWasmClient } from '@sei-js/core'
import { generateWalletFromInput, querySeiBalance } from '@/utils/sei'
import {
  DirectSecp256k1HdWallet,
  DirectSecp256k1Wallet,
} from '@cosmjs/proto-signing'
import toast from 'react-hot-toast'
import { formatBalance } from '@/utils/format'
import BigNumber from 'bignumber.js'

const RPC_URL_2 = 'https://sei-rpc.brocha.in/'

const BatchSend: React.FC = () => {
  const [mnemonic, setMnemonic] = useState<string>('')

  const [openImport, setOpenImport] = useState<boolean>(false)

  const [wallet, setWallet] = useState<
    DirectSecp256k1HdWallet | DirectSecp256k1Wallet | null
  >(null)
  const [address, setAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [eachAmount, setEachAmount] = useState<string>('')

  const [targetAddress, setTargetAddress] = useState<string>('')

  useEffect(() => {
    if (address) {
      querySeiBalance(address).then((balance) => {
        setBalance(balance.amount)
      })
    }
  }, [address])

  const handleImportWallet = useCallback(async () => {
    if (mnemonic) {
      setWallet(null)
      setAddress('')
      const wallet = await generateWalletFromInput(mnemonic)
      if (wallet) {
        setWallet(wallet)
        const accs = await wallet.getAccounts()
        if (accs.length > 0) {
          setAddress(accs[0].address)
        }
      } else {
        toast.error('导入失败')
      }
    }
    setOpenImport(false)
  }, [mnemonic])

  const sendToOneAddress = useCallback(
    async (to: string) => {
      if (wallet) {
        const fee = {
          amount: [{ amount: '8243', denom: 'usei' }],
          gas: '82426',
        }
        const signingCosmWasmClient = await getSigningCosmWasmClient(
          RPC_URL_2,
          wallet
        )

        const response = await signingCosmWasmClient.sendTokens(
          address,
          to,
          [
            {
              amount: BigNumber(eachAmount)
                .multipliedBy(Math.pow(10, 6))
                .toString(),
              denom: 'usei',
            },
          ],
          fee
        )
        toast.success(`转账成功, ${response.transactionHash}`)
      }
    },
    [address, eachAmount, wallet]
  )

  const handleSendToAll = useCallback(async () => {
    if (targetAddress) {
      const targetAddresses = targetAddress.split(',')
      for (let i = 0; i < targetAddresses.length; i++) {
        await sendToOneAddress(targetAddresses[i])
      }
    }
  }, [sendToOneAddress, targetAddress])

  return (
    <div className="w-full">
      <h1>批量转账</h1>
      <div>
        <Button
          onClick={() => {
            setOpenImport(true)
          }}
        >
          导入钱包
        </Button>
        <Modal
          open={openImport}
          onCancel={() => setOpenImport(false)}
          onOk={handleImportWallet}
          okButtonProps={{
            disabled: !mnemonic,
          }}
          okText="导入"
          cancelText="取消"
        >
          <div>
            <h2>导入钱包</h2>
            <Input.TextArea
              rows={4}
              placeholder="请输入助记词或者私钥"
              onChange={(e) => {
                setMnemonic(e.target.value)
              }}
            />
          </div>
        </Modal>
      </div>
      <p>{`钱包地址: ${address}`}</p>
      <p>{`余额: ${balance ? formatBalance(balance, 6) : ''}`}</p>
      <div>
        <p>转账目标地址</p>
        <Input.TextArea
          rows={4}
          value={targetAddress}
          onChange={(e) => {
            setTargetAddress(e.target.value)
          }}
        />
      </div>
      <div>
        <p>每个地址转账金额</p>
        <div className="flex space-x-4 items-center">
          <Input
            type="number"
            value={eachAmount}
            onChange={(e) => setEachAmount(e.target.value)}
          />
          <Button type="primary" onClick={handleSendToAll}>转出</Button>
        </div>
      </div>
    </div>
  )
}

export default BatchSend
