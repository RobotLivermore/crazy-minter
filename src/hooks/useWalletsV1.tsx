import { useRef, useState } from 'react'
import { Input, Modal } from 'antd'
import { WalletOutlined } from '@ant-design/icons'

const inputWalletPlaceholder = `请输入助记词或者私钥，导入多个用,分割`

export interface WalletV1 {
  address: string
  priv: string
  type: 'hd' | 'privateKey'
}

const useWalletsV1 = () => {
  const [wallets, setWallets] = useState<WalletV1[]>([])

  const addWallet = (wallet: WalletV1) => {
    setWallets((prev) => [...prev, wallet])
  }

  const removeWallet = (address: string) => {
    setWallets((prev) => prev.filter((w) => w.address !== address))
  }

  const [modal, modalContext] = Modal.useModal()
  const [privs, setPrivs] = useState<string>('')
  const privRef = useRef<string>(privs)
  privRef.current = privs

  const importWallet = (genFn: (_priv: string) => Promise<WalletV1 | null>) => {
    modal.confirm({
      maskClosable: true,
      title: 'Import wallet',
      icon: <WalletOutlined />,
      width: 600,
      content: (
        <div className="w-[600px]">
          <p>Please enter your mnemonic or private key</p>
          <Input.TextArea
            rows={4}
            placeholder={inputWalletPlaceholder}
            onChange={(e) => {
              setPrivs(e.target.value)
            }}
          />
        </div>
      ),
      styles: {
        body: {
          display: 'flex',
          flexDirection: 'column',
        },
      },
      okText: 'Import',
      cancelText: 'Cancel',
      onOk: async (close) => {
        const ps = privRef.current.split(',')
        for (let i = 0; i < ps.length; i++) {
          const w = await genFn(ps[i])
          if (w) {
            addWallet(w)
          }
        }
        close()
      },
    })
  }

  return {
    wallets,
    addWallet,
    removeWallet,
    importWallet,
    modalContext,
  }
}

export default useWalletsV1
