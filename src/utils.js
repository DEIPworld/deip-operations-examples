import config from './config';
import { u8aToHex, hexToU8a, isU8a, isHex, stringToU8a } from '@polkadot/util';
import { encodeAddress, decodeAddress, blake2AsU8a, createKeyMulti, randomAsHex } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';


const getFaucetAccount = () => {
  const keyring = new Keyring({ type: 'sr25519' });
  const keyringPair = keyring.createFromJson(config.DEIP_APPCHAIN_FAUCET_ACCOUNT_JSON);
  keyringPair.unlock();
  return keyringPair;
}


const generateAccount = (username, seed = randomAsHex(32)) => {
  const keyring = new Keyring({ type: 'sr25519' });
  const keyringPair = keyring.addFromUri(seed, { username });
  return keyringPair;
}


const pubKeyToAddress = (pubKey, addressFormat = 42) => {
  const address = encodeAddress(isU8a(pubKey) ? u8aToHex(pubKey) : pubKey, addressFormat);
  return address;
}


const daoIdToAddress = (daoId, api) => {
  const H160 = api.registry.createType('H160', daoId);
  const VecU8 = api.registry.createType('Vec<u8>', H160);
  const scaleVecU8 = VecU8.toU8a();
  const prefix = stringToU8a("deip/DAOs/");
  const hash = blake2AsU8a([...prefix, ...scaleVecU8], 256);
  const pubKey = api.registry.createType('AccountId', hash);
  return pubKeyToAddress(pubKey);
}


const getMultiAddress = (addresses, threshold) => {
  const multiAddress = createKeyMulti([...addresses].sort(), threshold);
  return u8aToHex(multiAddress);
}


const getDefaultDomain = () => {
  const defaultDomainId = `0x8e2a3711649993a87848337b9b401dcf64425e2d`;
  return defaultDomainId;
}

const waitAsync = (timeout) => {
  return new Promise(async (resolve, reject) => {
    try {
      setTimeout(() => resolve(), timeout);
    } catch (err) {
      reject(err);
    }
  });
}


export {
  getFaucetAccount,
  generateAccount,
  daoIdToAddress,
  pubKeyToAddress,
  getMultiAddress,
  getDefaultDomain,
  waitAsync
}