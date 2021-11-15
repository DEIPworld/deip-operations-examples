require('dotenv').config({
  path: __dirname + '/' + '.config.env'
});

const config = {
  DEIP_APPCHAIN_NODE_URL: process.env.DEIP_APPCHAIN_NODE_URL,
  DEIP_APPCHAIN_MILLISECS_PER_BLOCK: process.env.DEIP_APPCHAIN_MILLISECS_PER_BLOCK,
  DEIP_APPCHAIN_FAUCET_ACCOUNT_JSON: JSON.parse(process.env.DEIP_APPCHAIN_FAUCET_ACCOUNT_JSON),
  DEIP_APPCHAIN_FAUCET_FUNDING_AMOUNT: process.env.DEIP_APPCHAIN_FAUCET_FUNDING_AMOUNT
};

module.exports = config;