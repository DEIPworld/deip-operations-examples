require('dotenv').config({
  path: __dirname + '/' +
    (process.env.DEIP_CONFIG ? ('.' + process.env.DEIP_CONFIG + '.env') : '.config.env')
});

const config = {
  DEIP_PROTOCOL_CHAIN: parseInt(process.env.DEIP_PROTOCOL_CHAIN) || 0,
  DEIP_APPCHAIN_NODE_URL: process.env.DEIP_APPCHAIN_NODE_URL,
  DEIP_APPCHAIN_MILLISECS_PER_BLOCK: process.env.DEIP_APPCHAIN_MILLISECS_PER_BLOCK,
  DEIP_APPCHAIN_FAUCET_ACCOUNT: process.env.DEIP_APPCHAIN_FAUCET_ACCOUNT ? JSON.parse(process.env.DEIP_APPCHAIN_FAUCET_ACCOUNT) : null,
  DEIP_APPCHAIN_FAUCET_SUBSTRATE_SEED_ACCOUNT_JSON: process.env.DEIP_APPCHAIN_FAUCET_SUBSTRATE_SEED_ACCOUNT_JSON ? JSON.parse(process.env.DEIP_APPCHAIN_FAUCET_SUBSTRATE_SEED_ACCOUNT_JSON) : null,
  DEIP_APPCHAIN_CORE_ASSET: process.env.DEIP_APPCHAIN_CORE_ASSET ? JSON.parse(process.env.DEIP_APPCHAIN_CORE_ASSET) : null,
  DEIP_CHAIN_ID: process.env.DEIP_CHAIN_ID,
  DEIP_TARGET_PORTAL: process.env.DEIP_TARGET_PORTAL ? JSON.parse(process.env.DEIP_TARGET_PORTAL) : null
};

module.exports = config;