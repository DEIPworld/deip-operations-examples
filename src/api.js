import fetch from 'cross-fetch';
import config from './config';


const rpcToChainNodeAsync = (method, params = []) => {
  return fetch(config.DEIP_APPCHAIN_NODE_URL, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method,
      params
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
    .then((response) => response.json())
    .then(({ error, result }) => {
      if (error) {
        throw new Error(
          `${error.code} ${error.message}: ${JSON.stringify(error.data)}`
        );
      }
      return result;
    })
    .catch(error => {
      console.error(error);
      throw new Error(
        `${error.code} ${error.message}: ${JSON.stringify(error.data)}`
      );
    });
}


const getAccountAsync = async function (id) {
  const daoId = id.indexOf(`0x`) === 0 ? id : `0x${id}`;
  return rpcToChainNodeAsync("deipDao_get", [null, daoId]);
}


const getProjectAsync = async function (id) {
  const projectId = id.indexOf(`0x`) === 0 ? id : `0x${id}`;
  return rpcToChainNodeAsync("deip_getProject", [null, projectId]);
}


const sendTxAsync = (rawTx) => {
  return rpcToChainNodeAsync('author_submitExtrinsic', [rawTx]);
}


const sendTxAndWaitAsync = (rawTx, timeout = config.DEIP_APPCHAIN_MILLISECS_PER_BLOCK) => {
  return new Promise(async (resolve, reject) => {
    try {
      await sendTxAsync(rawTx);
      setTimeout(() => resolve(), timeout);
    } catch (err) {
      reject(err);
    }
  });
}


export {
  rpcToChainNodeAsync,
  getAccountAsync,
  getProjectAsync,
  sendTxAsync,
  sendTxAndWaitAsync
}