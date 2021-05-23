import '../styles/main.css'

import { AppProps } from 'next/app'
import React from 'react'

import { EditsContextProvider } from '../context/Edits'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EditsContextProvider>
      <Component {...pageProps} />
    </EditsContextProvider>
  )
}
