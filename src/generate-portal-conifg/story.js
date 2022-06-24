import config from '../config';
import { logError, logInfo, logJsonResult } from '../log';
import { randomAsHex } from '@polkadot/util-crypto';
import { genRipemd160Hash } from '@deip/toolbox';
import { ChainService } from '@deip/chain-service';


const generatePortalId = (length = 40) => { //TODO: rpc getLastPortalId
  const result = [];

  const getRandomNum = () => Math.floor(Math.random() * 10);
  for (let i = 0; i < length; i++) {
    result.push(getRandomNum())
  }

  return result.join("");
}

const getChainService = (portalId) => ChainService.getInstanceAsync({
  PROTOCOL: config.DEIP_PROTOCOL_CHAIN,
  DEIP_FULL_NODE_URL: config.DEIP_APPCHAIN_NODE_URL,
  CORE_ASSET: config.DEIP_APPCHAIN_CORE_ASSET,
  CHAIN_ID: config.DEIP_CHAIN_ID,
  PORTAL_ID: portalId // needed??
});

const generateUser = async (chainService, username) => {
  const password = genRipemd160Hash(randomAsHex(20)).slice(0, 16);
  const daoId = genRipemd160Hash(randomAsHex(20));
  const user = await chainService.generateChainSeedAccount({ username, password });

  return {
    password,
    daoId,
    user
  }
}

async function run() {
  const { portal } = config.TENANT_GENERATE_PORTAL_CONFIG;

  const tenantId = portal._id ? portal._id : generatePortalId();
  const chainService = await getChainService(tenantId);

  const tenantUser = await generateUser(chainService, `${portal.name}_tenant`);
  const tenantPortalUser = await generateUser(chainService, `${portal.name}_portal`);

  const TENANT = {
    id: tenantId,
    privKey: tenantUser.user.getPrivKey(),
    pubKey: tenantUser.user.getPubKey(),
    members: [{
      daoId: tenantUser.daoId,
      password: tenantUser.password
    }]
  };

  const TENANT_PORTAL = {
    privKey: tenantPortalUser.user.getPrivKey(),
    pubKey: tenantPortalUser.user.getPubKey()
  }

  console.log("TENANT", TENANT)
  console.log("TENANT_PORTAL", TENANT_PORTAL)

  // logJsonResult("TENANT", TENANT);
  // logJsonResult("TENANT_PORTAL", TENANT_PORTAL);

  console.log(`New portal env values:\nTENANT='${JSON.stringify(TENANT)}'\nTENANT_PORTAL='${JSON.stringify(TENANT_PORTAL)}'`)

  return {
    TENANT,
    TENANT_PORTAL
  };
}


run()
  .then((result) => {
    logInfo('Successfully finished!');
    return result;
  })
  .catch((err) => {
    logError(err);
    process.exit(1);
  });
