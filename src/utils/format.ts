import BigNumber from 'bignumber.js'

export function ellipsisText(text: string, front = 6, back = 6) {
  if (text.length <= front + back) {
    return text // 如果字符串长度小于等于12，直接返回整个字符串
  }

  // 否则，显示前6位和后6位字符
  const prefix = text.slice(0, front)
  const suffix = text.slice(0 - back)
  return `${prefix}...${suffix}`
}

export function formatBalance(balance: string, decimals: number) {
  return BigNumber(balance).div(Math.pow(10, decimals)).toString()
}
