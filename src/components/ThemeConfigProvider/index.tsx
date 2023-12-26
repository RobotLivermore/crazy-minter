import React from 'react'
import {  ConfigProvider } from 'antd'

import theme from './theme'

const ThemeConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ConfigProvider theme={theme}>{children}</ConfigProvider>

export default ThemeConfigProvider
