import config from '../config';
import { logError, logInfo, logJsonResult } from '../log';
import { randomAsHex } from '@polkadot/util-crypto';
import { genRipemd160Hash, genSha256Hash } from '@deip/toolbox';
import { APP_PROPOSAL, PROJECT_CONTENT_TYPES } from '@deip/constants';
import { getDefaultDomain } from '../utils';
import {
  AcceptProposalCmd, AddDaoMemberCmd,
  CreateDaoCmd,
  CreateFungibleTokenCmd,
  CreateNonFungibleTokenCmd,
  CreateProjectCmd,
  CreateProjectContentCmd,
  CreateProposalCmd,
  IssueNonFungibleTokenCmd,
  TransferFungibleTokenCmd,
} from '@deip/commands';

import PRE_SET from '../casimir/preset';

const {
  setup,
  getChainService,
  getDaoCreator,
  getDaoCreatorPrivKey,
  fundAddressFromFaucet,
  sendTxAndWaitAsync
} = PRE_SET(config);


async function run() {
  const chainService = await getChainService();
  const chainTxBuilder = chainService.getChainTxBuilder();
  const api = chainService.getChainNodeClient();
  const rpc = chainService.getChainRpc();

  const DEIP_APPCHAIN_CORE_ASSET = config.DEIP_APPCHAIN_CORE_ASSET;
  const DAO_SEED_FUNDING_AMOUNT = config.DAO_SEED_FUNDING_AMOUNT
  const DAO_FUNDING_AMOUNT = config.DAO_FUNDING_AMOUNT;

  
  const lastKnownFtId2 = await rpc.getLastKnownFtId();
  console.log(`LAST KNOWN FT ID`, lastKnownFtId2);


  logInfo(`Creating Alice DAO ...`);
  const alicePwd = randomAsHex(32);
  const aliceDaoId = genRipemd160Hash(randomAsHex(20));
  const alice = await chainService.generateChainSeedAccount({ username: "alice", password: alicePwd });
  await fundAddressFromFaucet(alice.getPubKey(), DAO_SEED_FUNDING_AMOUNT, true);
  const createAliceDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: aliceDaoId,
        authority: {
          owner: {
            auths: [{ key: alice.getPubKey(), weight: 1 }],
            weight: 1
          }
        },
        creator: getDaoCreator(alice),
        description: genSha256Hash({ "description": "Alice DAO" }),
        // offchain
        isTeamAccount: false,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createAliceDaoByAliceTx = await createAliceDaoTx.signAsync(getDaoCreatorPrivKey(alice), api); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(createAliceDaoByAliceTx);

  await fundAddressFromFaucet(aliceDaoId, DAO_FUNDING_AMOUNT);
  const aliceDao = await rpc.getAccountAsync(aliceDaoId);
  logJsonResult(`Alice DAO created`, aliceDao);

  const lastKnownFtId = await rpc.getLastKnownFtId();
  console.log(`LAST KNOWN FT ID`, lastKnownFtId);

  /**
 *   Create FT-1 for Project-1 by Alice Dao
 */
  logInfo(`Creating FT-1 ...`);
  // const ft1Id = genRipemd160Hash(randomAsHex(20));
  const ft1Id = lastKnownFtId;
  const createFt1Tx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createNft1Cmd = new CreateFungibleTokenCmd({
        entityId: ft1Id,
        issuer: aliceDaoId,
        name: `Fungible Token ${lastKnownFtId}`,
        symbol: `FT-${lastKnownFtId}`,
        precision: 2,
        description: "",
        minBalance: 1,
        maxSupply: 1000000000000000 // TODO: add 'maxSupply' for Substrate assets_pallet wrapper
      });
      txBuilder.addCmd(createNft1Cmd);
      return txBuilder.end();
    });

  const createFt1ByTreasuryDaoTx = await createFt1Tx.signAsync(alice.getPrivKey(), api); // 1st approval from Treasury DAO (final)
  console.log("00000000000");
  await sendTxAndWaitAsync(createFt1ByTreasuryDaoTx);
  console.log("11111111111");
  const lastKnownFtId1 = await rpc.getLastKnownFtId();
  console.log(`LAST KNOWN FT ID _!`, lastKnownFtId1);
  const f1 = await rpc.getFungibleTokenAsync(ft1Id);
  logJsonResult(`FT-${lastKnownFtId} created`, f1);


//   const lastKnownFtId2 = await rpc.getLastKnownFtId();
//   console.log(`LAST KNOWN FT ID`, lastKnownFtId2);

}


setup()
  .then(() => {
    logInfo('\nRunning Casimir tx-builder...\n');
    return run();
  })
  .then(() => {
    logInfo('Successfully finished !');
    process.exit(0);
  })
  .catch((err) => {
    logError(err);
    process.exit(1);
  });
