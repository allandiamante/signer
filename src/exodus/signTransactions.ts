import { Provider } from '../main'
import { Txn } from '../signTransactions'
import { decodeUnsignedTransaction } from 'algosdk'

export default async function sign<T extends Txn>({ exodus }: Provider, txns: Array<Array<T>>): Promise<Array<Array<T>>> {

  const binaryTxns: Array<Uint8Array> = []
  const unsignedTxns: Array<T> = []

  for (let g = 0; g < txns.length; g++) {

    const txnArray = txns[g]

    if (!txnArray) {
      throw new Error('Failed to parse transaction array.')
    }

    for (let t = 0; t < txnArray.length; t++) {

      const txn = txnArray[t]

      if (!txn) {
        throw new Error('Failed to parse transaction array.')
      }

      binaryTxns.push(decodeUnsignedTransaction(txn.blob).toByte())
      unsignedTxns.push(txn)
    }
  }

  let formated: Array<Array<T>> = []

  const signedTxns = await exodus.signTransaction(binaryTxns) as Array<Uint8Array>

  if (signedTxns && signedTxns.length > 0) {

  formated = txns.map((txnArray, i) => {
    const unsignedArray = txns[i]
    const signedArray = signedTxns.splice(0, txnArray.length)

    if (!unsignedArray) {
      throw new Error('Failed to parse transaction array.')
    }

    return signedArray.map((signedTxn, index) => {
      const usignedTxn = unsignedArray[index]

      if (!usignedTxn) {
        throw new Error('Failed to parse transaction array.')
      }

      return {
        ...usignedTxn,
        blob: signedTxn
      }
    })
  })

  } else {
    throw new Error('The Exodus wallet did not return any transcactions.')
  }

  return formated
}