import { logInfo, logSuccess, logError, logJsonResult } from './../log';
import { genSha256Hash, genRipemd160Hash } from '@deip/toolbox';
import { PROTOCOL_CHAIN } from '@deip/constants';
import { ChainService } from '@deip/chain-service';
import { u8aToHex } from '@polkadot/util';
import {
  daoIdToSubstrateAddress,
  getFaucetSeedAccount,
  waitAsync,
} from './../utils';
import {
  CreateDaoCmd,
  AlterDaoAuthorityCmd,
  CreateAssetCmd,
  IssueAssetCmd,
  TransferAssetCmd,
  AddDaoMemberCmd
} from '@deip/command-models';



export default (config) => {

  const FAUCET_DAO_FUNDING_AMOUNT = "900000000000000000000"; /* 900 MUNIT */
  const DAO_SEED_FUNDING_AMOUNT = PROTOCOL_CHAIN.SUBSTRATE == config.DEIP_PROTOCOL_CHAIN ? "1100000000000000000" /* 1.1 MUNIT */ : 0
  const DAO_FUNDING_AMOUNT = PROTOCOL_CHAIN.SUBSTRATE == config.DEIP_PROTOCOL_CHAIN ? "1000000000000000000" /* 1 MUNIT */ : 10000


  async function setupTenantPortal() {
    logInfo(`Setting up Tenant Portal ...`);
    await createFaucetDao();
    await createTenantDao();
    await createDefaultFaucetAssets();
    logInfo(`Tenant Portal is set.`);
  }


  async function getChainService() {
    const chainService = await ChainService.getInstanceAsync({
      PROTOCOL: config.DEIP_PROTOCOL_CHAIN,
      DEIP_FULL_NODE_URL: config.DEIP_APPCHAIN_NODE_URL,
      CORE_ASSET: config.DEIP_APPCHAIN_CORE_ASSET,
      CHAIN_ID: config.DEIP_CHAIN_ID
    });
    return chainService;
  }


  async function createFaucetDao() {
    const chainService = await getChainService();
    const chainTxBuilder = chainService.getChainTxBuilder();
    const api = chainService.getChainNodeClient();
    const rpc = chainService.getChainRpc();
    const { username: faucetDaoId, wif: faucetSeed } = config.DEIP_APPCHAIN_FAUCET_ACCOUNT;

    const existingFaucetDao = await rpc.getAccountAsync(faucetDaoId);
    if (existingFaucetDao)
      return existingFaucetDao;

    const owner = { auths: [], weight: 1 };
    if (PROTOCOL_CHAIN.SUBSTRATE == config.DEIP_PROTOCOL_CHAIN) {
      const seedPubKey = u8aToHex(getFaucetSeedAccount(config.DEIP_APPCHAIN_FAUCET_SUBSTRATE_SEED_ACCOUNT_JSON).publicKey).substring(2);
      owner.auths.push({ key: seedPubKey })
    } else {
      owner.auths.push({ name: faucetDaoId })
    }

    logInfo(`Creating Faucet DAO ...`);
    const createFaucetDaoTx = await chainTxBuilder.begin()
      .then((txBuilder) => {
        const createDaoCmd = new CreateDaoCmd({
          entityId: faucetDaoId,
          authority: { owner },
          creator: "faucet",
          memoKey: "faucet",
          description: genSha256Hash({ "description": "Faucet DAO" }),
          // offchain
          isTeamAccount: false,
          attributes: []
        });
        txBuilder.addCmd(createDaoCmd);
        return txBuilder.end();
      });

    const createFaucetDaoTxSigned = await createFaucetDaoTx.signAsync(faucetSeed, api);
    await sendTxAndWaitAsync(createFaucetDaoTxSigned);
    const faucetDao = await rpc.getAccountAsync(faucetDaoId);
    logJsonResult(`Faucet DAO created`, faucetDao);

    if (PROTOCOL_CHAIN.SUBSTRATE == config.DEIP_PROTOCOL_CHAIN) {
      const faucetDaoAddress = daoIdToSubstrateAddress(faucetDaoId, api);
      const tx = api.tx.balances.transfer(faucetDaoAddress, FAUCET_DAO_FUNDING_AMOUNT);
      await tx.signAsync(getFaucetSeedAccount(config.DEIP_APPCHAIN_FAUCET_SUBSTRATE_SEED_ACCOUNT_JSON));
      await api.rpc.author.submitExtrinsic(tx.toHex());
      await waitAsync(config.DEIP_APPCHAIN_MILLISECS_PER_BLOCK);
    }

    return faucetDao;
  }


  async function createTenantDao() {
    const chainService = await getChainService();
    const chainTxBuilder = chainService.getChainTxBuilder();
    const api = chainService.getChainNodeClient();
    const rpc = chainService.getChainRpc();
    const { id: tenantDaoId, privKey: tenantPrivKey, members } = config.DEIP_PORTAL_TENANT;
    const tenantSeed = await chainService.generateChainSeedAccount({ username: tenantDaoId, privateKey: tenantPrivKey });

    const existingTenantDao = await rpc.getAccountAsync(tenantDaoId);
    if (!existingTenantDao) {
      logInfo(`Creating Tenant DAO ...`);
      await fundAddressFromFaucet(tenantSeed.getPubKey(), DAO_SEED_FUNDING_AMOUNT);
      const createTenantDaoTx = await chainTxBuilder.begin()
        .then((txBuilder) => {
          const createDaoCmd = new CreateDaoCmd({
            entityId: tenantDaoId,
            authority: {
              owner: {
                auths: [{ key: tenantSeed.getPubKey(), weight: 1 }],
                weight: 1
              }
            },
            creator: getDaoCreator(tenantSeed),
            description: genSha256Hash({ "description": "Tenant DAO" }),
            // offchain
            isTeamAccount: true,
            attributes: []
          });

          txBuilder.addCmd(createDaoCmd);
          return txBuilder.end();
        });

      const createTenantDaoBytenantSeedTx = await createTenantDaoTx.signAsync(getDaoCreatorPrivKey(tenantSeed), api);
      await sendTxAndWaitAsync(createTenantDaoBytenantSeedTx);
      await fundAddressFromFaucet(tenantDaoId, DAO_FUNDING_AMOUNT);

      const createdTenantDao = await rpc.getAccountAsync(tenantDaoId);
      logJsonResult(`Tenant DAO created`, createdTenantDao);
    }

    const tenantDao = await rpc.getAccountAsync(tenantDaoId);
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const { daoId: tenantMemberDaoId, password } = member;
      const tenantMember = await chainService.generateChainSeedAccount({ username: tenantMemberDaoId, password: password });

      const existingTenantMemberDao = await rpc.getAccountAsync(tenantMemberDaoId);
      if (!existingTenantMemberDao) {
        logInfo(`Creating Tenant Member DAO ...`);
        await fundAddressFromFaucet(tenantMember.getPubKey(), DAO_SEED_FUNDING_AMOUNT);
        const createTenantMemberDaoTx = await chainTxBuilder.begin()
          .then((txBuilder) => {
            const createDaoCmd = new CreateDaoCmd({
              entityId: tenantMemberDaoId,
              authority: {
                owner: {
                  auths: [{ key: tenantMember.getPubKey(), weight: 1 }],
                  weight: 1
                }
              },
              creator: getDaoCreator(tenantMember),
              description: genSha256Hash({ "description": "Tenant DAO" }),
              // offchain
              isTeamAccount: false,
              attributes: []
            });

            txBuilder.addCmd(createDaoCmd);
            return txBuilder.end();
          });

        const createTenantMemberDaoBytenantSeedTx = await createTenantMemberDaoTx.signAsync(getDaoCreatorPrivKey(tenantMember), api);
        await sendTxAndWaitAsync(createTenantMemberDaoBytenantSeedTx);
        await fundAddressFromFaucet(tenantMemberDaoId, DAO_FUNDING_AMOUNT);

        const createdTenantMemberDao = await rpc.getAccountAsync(tenantDaoId);
        logJsonResult(`Tenant Member DAO`, createdTenantMemberDao);
      }

      const isMember = tenantDao.authority.owner.auths.some((auth) => auth.daoId == tenantMemberDaoId);
      if (!isMember) {
        logInfo(`Adding Tenant Member DAO ${tenantMemberDaoId} to Tenant DAO ${tenantDaoId} ...`);
        const addTenantMemberDaoToTenantDaoTx = await chainTxBuilder.begin()
          .then((txBuilder) => {
            const addDaoMemberCmd = new AddDaoMemberCmd({
              teamId: tenantDaoId,
              member: tenantMemberDaoId
            });

            txBuilder.addCmd(addDaoMemberCmd);
            return txBuilder.end();
          });
        const addTenantMemberDaoToTenantDaoByTenantDaoTx = await addTenantMemberDaoToTenantDaoTx.signAsync(tenantSeed.getPrivKey(), api);
        await sendTxAndWaitAsync(addTenantMemberDaoToTenantDaoByTenantDaoTx);

        // Until threshold is automatically incremented we have to reset it manually
        const resetTenantDaoAuthTx = await chainTxBuilder.begin()
          .then((txBuilder) => {
            const alterDaoAuthorityCmd = new AlterDaoAuthorityCmd({
              entityId: tenantDaoId,
              authority: {
                owner: {
                  auths: [
                    ...tenantDao.authority.owner.auths.map((
                      auth) => {
                      return auth.daoId
                        ? { name: auth.daoId, weight: auth.weight }
                        : { key: auth.pubKey, weight: auth.weight }
                    }),
                    { name: tenantMemberDaoId, weight: 1 }
                  ],
                  weight: 1
                }
              }
            });

            txBuilder.addCmd(alterDaoAuthorityCmd);
            return txBuilder.end();
          });
        const resetTenantDaoAuthByTenantSeedTx = await resetTenantDaoAuthTx.signAsync(tenantSeed.getPrivKey(), api);
        await sendTxAndWaitAsync(resetTenantDaoAuthByTenantSeedTx);

        const resetTenantDaoAuthByTenantMemberTx = await resetTenantDaoAuthTx.signAsync(tenantMember.getPrivKey(), api, { override: true });
        await sendTxAndWaitAsync(resetTenantDaoAuthByTenantMemberTx);

        const tenantDaoWithAddedMember = await rpc.getAccountAsync(tenantDaoId);
        logJsonResult(`Tenant Member DAO ${tenantMemberDaoId} added to Tenant DAO ${tenantDaoId}`, tenantDaoWithAddedMember);
      }

    }

    const updatedTenantDao = await rpc.getAccountAsync(tenantDaoId);
    logJsonResult(`Tenant DAO finalized`, updatedTenantDao);
    return updatedTenantDao;
  }


  async function createDefaultFaucetAssets() {
    const chainService = await getChainService();
    const chainTxBuilder = chainService.getChainTxBuilder();
    const api = chainService.getChainNodeClient();
    const rpc = chainService.getChainRpc();
    const { username: faucetDaoId, wif: faucetSeed } = config.DEIP_APPCHAIN_FAUCET_ACCOUNT;
    const defautFaucetAssets = config.DEIP_APPCHAIN_FAUCET_ASSETS;

    const assets = [];
    for (let i = 0; i < defautFaucetAssets.length; i++) {
      const defautFaucetAsset = defautFaucetAssets[i];
      const { id: assetId, symbol, precision } = defautFaucetAsset;

      const existingAsset = await rpc.getAssetAsync(assetId);
      if (existingAsset) {
        assets.push(existingAsset);
        continue;
      }

      logInfo(`Creating and issuing ${symbol} asset to ${faucetDaoId} DAO ...`);
      const createAndIssueAssetTx = await chainTxBuilder.begin()
        .then((txBuilder) => {

          const maxSupply = 999999999999999;
          const createAssetCmd = new CreateAssetCmd({
            entityId: assetId,
            issuer: faucetDaoId,
            name: `Asset ${symbol}`,
            symbol: symbol,
            precision: precision,
            description: "",
            minBalance: 1,
            maxSupply: maxSupply
          });
          txBuilder.addCmd(createAssetCmd);

          const issueAssetCmd = new IssueAssetCmd({
            issuer: faucetDaoId,
            asset: { "id": assetId, symbol, precision, "amount": maxSupply },
            recipient: faucetDaoId
          });
          txBuilder.addCmd(issueAssetCmd);

          return txBuilder.end();
        });

      const createAndIssueAssetByFaucetDaoTx = await createAndIssueAssetTx.signAsync(faucetSeed, api);
      await sendTxAndWaitAsync(createAndIssueAssetByFaucetDaoTx);
      const asset = await rpc.getAssetAsync(assetId);
      assets.push(asset);
      logJsonResult(`${symbol} asset created and issued to ${faucetDaoId} DAO`, asset);
    }

    return assets;
  }


  function getDaoCreator(seed) {
    const { username: faucetDaoId } = config.DEIP_APPCHAIN_FAUCET_ACCOUNT;
    if (PROTOCOL_CHAIN.SUBSTRATE == config.DEIP_PROTOCOL_CHAIN) {
      return seed.getUsername();
    }
    return faucetDaoId;
  }


  function getDaoCreatorPrivKey(seed) {
    const { wif: faucetSeed } = config.DEIP_APPCHAIN_FAUCET_ACCOUNT;
    if (PROTOCOL_CHAIN.SUBSTRATE == config.DEIP_PROTOCOL_CHAIN) {
      return seed.getPrivKey();
    }
    return faucetSeed;
  }


  async function fundAddressFromFaucet(daoIdOrAddress, amount) {
    if (!amount) return;

    const chainService = await getChainService();
    const chainTxBuilder = chainService.getChainTxBuilder();
    const api = chainService.getChainNodeClient();
    const { username: faucetDaoId, wif: faucetSeed } = config.DEIP_APPCHAIN_FAUCET_ACCOUNT;

    const fundDaoTx = await chainTxBuilder.begin()
      .then((txBuilder) => {
        const transferAssetCmd = new TransferAssetCmd({
          from: faucetDaoId,
          to: daoIdOrAddress,
          asset: { ...config.DEIP_APPCHAIN_CORE_ASSET, amount }
        });

        txBuilder.addCmd(transferAssetCmd);
        return txBuilder.end();
      });

    const fundDaoTxSigned = await fundDaoTx.signAsync(faucetSeed, api);
    await sendTxAndWaitAsync(fundDaoTxSigned);
  }


  async function sendTxAndWaitAsync(finalizedTx, timeout = config.DEIP_APPCHAIN_MILLISECS_PER_BLOCK) {
    const chainService = await getChainService();
    const rpc = chainService.getChainRpc();
    const api = chainService.getChainNodeClient();
    if (config.DEIP_PORTAL_TENANT) {
      const { id: tenantDaoId, privKey: tenantPrivKey } = config.DEIP_PORTAL_TENANT;
      const { tx } = finalizedTx.getPayload();
      await tx.signByTenantAsync({ tenant: tenantDaoId, tenantPrivKey: tenantPrivKey }, api);
    }
    await finalizedTx.sendAsync(rpc);
    await waitAsync(timeout);
  }


  return {
    getChainService,
    setupTenantPortal,
    getDaoCreator,
    getDaoCreatorPrivKey,
    fundAddressFromFaucet,
    sendTxAndWaitAsync,

    FAUCET_DAO_FUNDING_AMOUNT,
    DAO_SEED_FUNDING_AMOUNT,
    DAO_FUNDING_AMOUNT
  }

}