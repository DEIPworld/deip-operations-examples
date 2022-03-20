require('dotenv').config({
  path: __dirname + '/' +
    (process.env.DEIP_CONFIG ? ('.' + process.env.DEIP_CONFIG + '.env') : '.config.env')
});

function parseJsonEnvVar(jsonEnvVarName, defaultValue) {
  const jsonEnvVar = process.env[jsonEnvVarName];
  if (!jsonEnvVar && defaultValue === undefined)
    throw new Error(jsonEnvVarName + " json environment variable is not defined. Specify it in the config or provide a default value");
  return jsonEnvVar ? JSON.parse(jsonEnvVar) : defaultValue;
}

function parseIntEnvVar(intEnvVarName, defaultValue) {
  const intEnvVar = process.env[intEnvVarName];
  if (!intEnvVar && defaultValue === undefined)
    throw new Error(intEnvVarName + " int environment variable is not defined. Specify it in the config or provide a default value");
  return intEnvVar ? parseInt(intEnvVar) : defaultValue;
}

const config = {
  DEIP_PROTOCOL_CHAIN: parseIntEnvVar('DEIP_PROTOCOL_CHAIN'),
  DEIP_CHAIN_ID: process.env.DEIP_CHAIN_ID,

  DEIP_APPCHAIN_NODE_URL: process.env.DEIP_APPCHAIN_NODE_URL,
  DEIP_APPCHAIN_MILLISECS_PER_BLOCK: parseIntEnvVar('DEIP_APPCHAIN_MILLISECS_PER_BLOCK'),
  DEIP_APPCHAIN_FAUCET_ACCOUNT: parseJsonEnvVar('DEIP_APPCHAIN_FAUCET_ACCOUNT'),
  DEIP_APPCHAIN_FAUCET_SUBSTRATE_SEED_ACCOUNT_JSON: parseJsonEnvVar('DEIP_APPCHAIN_FAUCET_SUBSTRATE_SEED_ACCOUNT_JSON'),
  DEIP_APPCHAIN_CORE_ASSET: parseJsonEnvVar('DEIP_APPCHAIN_CORE_ASSET'),
  DEIP_APPCHAIN_FAUCET_STABLECOINS: parseJsonEnvVar('DEIP_APPCHAIN_FAUCET_STABLECOINS', []),
  DEIP_APPCHAIN_FAUCET_BALANCE: process.env.DEIP_APPCHAIN_FAUCET_BALANCE || "0",

  TENANT: parseJsonEnvVar('TENANT'),
  TENANT_PORTAL: parseJsonEnvVar('TENANT_PORTAL'),
  TENANT_PORTAL_READ_MODELS_STORAGE: parseJsonEnvVar('TENANT_PORTAL_READ_MODELS_STORAGE', null),
  
  DAO_SEED_FUNDING_AMOUNT: process.env.DAO_SEED_FUNDING_AMOUNT || "0",
  DAO_FUNDING_AMOUNT: process.env.DAO_FUNDING_AMOUNT || "0"
};

module.exports = config;