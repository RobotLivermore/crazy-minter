import {
  DirectSecp256k1HdWallet,
  DirectSecp256k1Wallet,
} from '@cosmjs/proto-signing'
import { HdPath, stringToPath } from '@cosmjs/crypto'
import { hexToBytes } from '@/utils/bytes'

import { getQueryClient } from '@sei-js/core'

const REST_URL = 'https://sei-api.polkachu.com/'

const RPC_URL_2 = 'https://sei-rpc.brocha.in/'

const getHdPath = (accountIndex = 0): HdPath => {
  const stringPath = `m/44'/118'/0'/0/${accountIndex}`
  return stringToPath(stringPath)
}

export const generateWalletFromMnemonic = async (mnemonic: string) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'sei',
    hdPaths: [getHdPath(0) as any],
  })
  return wallet
}

export const generateWalletFromPrivateKey = async (privateKey: string) => {
  const wallet = await DirectSecp256k1Wallet.fromKey(
    hexToBytes(privateKey),
    'sei'
  )
  return wallet
}

export const querySeiBalance = async (address: string) => {
  const queryClient = await getQueryClient(REST_URL)
  const result = await queryClient.cosmos.bank.v1beta1.balance({
    address: address,
    denom: 'usei',
  })
  return result.balance
}

export const generateWalletFromInput = async (
  _p: string
): Promise<DirectSecp256k1HdWallet | DirectSecp256k1Wallet | null> => {
  let account: any | null = null
  try {
    const wallet = await generateWalletFromMnemonic(_p)
    return wallet
  } catch (e) {
    console.error(e)
  }
  if (!account) {
    try {
      const wallet = await generateWalletFromPrivateKey(_p)
      return wallet
    } catch (e) {
      console.error(e)
    }
  }
  return null
}
