import React, { useEffect, useState } from 'react'

import styles from './ResizableTextArea.module.css'

type Props = {
  borderColorClass: string
  defaultValue: string
  onChangeText: (text: string) => void
}

export const ResizableTextArea = ({
  borderColorClass,
  defaultValue,
  onChangeText,
}: Props): JSX.Element => {
  const [value, setValue] = useState(defaultValue)
  const [rows, setRows] = useState(1)

  useEffect(() => {}, [defaultValue])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const verticalPadding = 16 * 2
    const textareaLineHeight = 24
    const minRows = 1
    const maxRows = 10

    const previousRows = event.target.rows
    event.target.rows = minRows // reset number of rows in textarea

    console.log('event.target.scrollHeight', event.target.scrollHeight)
    console.log('textareaLineHeight', textareaLineHeight)

    const currentRows = ~~((event.target.scrollHeight - verticalPadding) / textareaLineHeight)

    console.log('currentRows', currentRows)

    if (currentRows === previousRows) {
      event.target.rows = currentRows
    }

    if (currentRows >= maxRows) {
      event.target.rows = maxRows
      event.target.scrollTop = event.target.scrollHeight
    }

    setValue(event.target.value)
    setRows(currentRows < maxRows ? currentRows : maxRows)

    onChangeText(event.target.value)
  }

  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={'Enter your text here...'}
      className={`${styles.textarea} ${borderColorClass} flex-1 border-2 rounded-md`}
      onChange={handleChange}
    />
  )
}

// class ClassResizableTextarea extends React.PureComponent {
//   constructor(props) {
//     super(props)
//     this.state = {
//       value: '',
//       rows: 5,
//       minRows: 5,
//       maxRows: 10,
//     }
//   }
//
//   handleChange = (event) => {
//     const textareaLineHeight = 24
//     const { minRows, maxRows } = this.state
//
//     const previousRows = event.target.rows
//     event.target.rows = minRows // reset number of rows in textarea
//
//     const currentRows = ~~(event.target.scrollHeight / textareaLineHeight)
//
//     if (currentRows === previousRows) {
//       event.target.rows = currentRows
//     }
//
//     if (currentRows >= maxRows) {
//       event.target.rows = maxRows
//       event.target.scrollTop = event.target.scrollHeight
//     }
//
//     this.setState({
//       value: event.target.value,
//       rows: currentRows < maxRows ? currentRows : maxRows,
//     })
//   }
//
//   render() {
//     return (
//       <textarea
//         rows={this.state.rows}
//         value={this.state.value}
//         placeholder={'Enter your text here...'}
//         className={'textarea'}
//         onChange={this.handleChange}
//       />
//     )
//   }
// }
