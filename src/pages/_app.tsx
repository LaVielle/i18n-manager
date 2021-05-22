import '../styles/main.css'

import { AppProps } from 'next/app'
import React from 'react'

// eslint-disable-next-line react/jsx-props-no-spreading
const MyApp = ({ Component, pageProps }: AppProps) => <Component {...pageProps} />

export default MyApp
