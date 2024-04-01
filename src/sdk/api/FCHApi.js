import fch from 'fch-sdk';
import { BitcoinRechargeData } from 'nerve-sdk-js/lib/model/BitcoinRechargeData';
import { timesDecimals } from '../utils/utils';
// const { BitcoinRechargeData } = require('nerve-sdk-js/model/BitcoinRechargeData');

export async function getFCHPub() {
  return await window.NaboxWallet.fch.getPub();
}

export function getFCHAddressByPub(pub) {
  return fch.getAddress(pub);
}

async function getFeeAndUTXO(fromAddress, amount, msg) {
  const utxos = await fch.getAccountUTXOs(fromAddress);
  const { utxo, fee } = fch.calcFeeAndUTXO(utxos, amount, msg);
  return { utxo, fee };
}

function getCrossInMsg(nerveAddress, amount) {
  const txData = new BitcoinRechargeData();
  txData.to = nerveAddress;
  txData.value = timesDecimals(amount, 8);
  const opReturnBuffer = txData.serialize();
  const msg = opReturnBuffer.toString('hex');
  return msg;
}

/**
 * @param {object} data
 * @param {string} data.from  from FCH address
 * @param {string} data.nerveAddress  nerve target address
 * @param {string} data.amount  transfer amount
 * @returns string
 */
export async function calFCHTxFee({ from, nerveAddress, amount }) {
  const msg = getCrossInMsg(nerveAddress, amount);
  const { fee } = await getFeeAndUTXO(from, amount, msg);
  return fee;
}

/**
 * @param {object} data
 * @param {string} data.multySignAddress NERVE FCH multy sign address
 * @param {string} data.nerveAddress  nerve target address
 * @param {string} data.amount  transfer amount
 * @returns string
 */
export async function FCHCrossToNERVE({
  multySignAddress,
  nerveAddress,
  amount
}) {
  const msg = getCrossInMsg(nerveAddress, amount);
  return window.NaboxWallet.fch.sendTransaction({
    to: multySignAddress,
    amount,
    msg
  });
}
