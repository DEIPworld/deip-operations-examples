import config from '../config';
import { logError, logInfo, logJsonResult } from '../log';
import { randomAsHex } from '@polkadot/util-crypto';
import { genRipemd160Hash, genSha256Hash } from '@deip/toolbox';
import { APP_PROPOSAL } from '@casimir/platform-core';
import { getDefaultDomain } from '../utils';
import {
  AcceptProposalCmd, AddDaoMemberCmd,
  CreateDaoCmd,
  CreateNftCollectionCmd,
  CreateProposalCmd,
  CreateNftItemCmd,
  TransferFTCmd,
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

  const CORE_ASSET = config.CORE_ASSET;
  const DAO_SEED_FUNDING_AMOUNT = config.FAUCET_ACCOUNT.fundingAmount
  const DAO_FUNDING_AMOUNT = config.FAUCET_ACCOUNT.fundingAmount;

  /**
   * Create Alice DAO actor
   */
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


  /**
   * Create Bob DAO actor
   */
  logInfo(`Creating Bob DAO ...`);
  const bobPwd = randomAsHex(32);
  const bobDaoId = genRipemd160Hash(randomAsHex(20));
  const bob = await chainService.generateChainSeedAccount({ username: "bob", password: bobPwd });
  await fundAddressFromFaucet(bob.getPubKey(), DAO_SEED_FUNDING_AMOUNT);
  const createBobDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: bobDaoId,
        authority: {
          owner: {
            auths: [{ key: bob.getPubKey(), weight: 1 }],
            weight: 1
          }
        },
        creator: getDaoCreator(bob),
        description: genSha256Hash({ "description": "Bob DAO" }),
        // offchain
        isTeamAccount: false,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createBobDaoByBobTx = await createBobDaoTx.signAsync(getDaoCreatorPrivKey(bob), api); // 1st approval from Bob DAO (final)
  await sendTxAndWaitAsync(createBobDaoByBobTx);

  await fundAddressFromFaucet(bobDaoId, DAO_FUNDING_AMOUNT);
  const bobDao = await rpc.getAccountAsync(bobDaoId);
  logJsonResult(`Bob DAO created`, bobDao);


  /**
 * Create Moderator multisig DAO actor with a threshold equal to 1 signature
 * MODERATORS DAO
 */
  logInfo(`Creating Moderator multisig DAO ...`);
  const moderatorDaoId = genRipemd160Hash(randomAsHex(20));
  const createModeratorDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: moderatorDaoId,
        authority: {
          owner: {
            auths: [{ name: aliceDaoId, weight: 1 }, { name: bobDaoId, weight: 1 }],
            weight: 1
          }
        },
        creator: aliceDaoId,
        description: genSha256Hash({ "description": "Moderator multisig DAO" }),
        // offchain
        isTeamAccount: true,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createModeratorDaoByAliceDaoTx = await createModeratorDaoTx.signAsync(alice.getPrivKey(), api); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(createModeratorDaoByAliceDaoTx);

  await fundAddressFromFaucet(moderatorDaoId, DAO_FUNDING_AMOUNT);
  const moderatorDao = await rpc.getAccountAsync(moderatorDaoId);
  logJsonResult(`Moderator multisig DAO created`, moderatorDao);

  /**
   * Create Creator DAO actor
   */
  logInfo(`Creating Creator DAO ...`);
  const creatorPwd = randomAsHex(32);
  const creatorDaoId = genRipemd160Hash(randomAsHex(20));
  const creator = await chainService.generateChainSeedAccount({ username: "creator", password: creatorPwd });
  await fundAddressFromFaucet(creator.getPubKey(), DAO_SEED_FUNDING_AMOUNT);
  const createCreatorDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: creatorDaoId,
        authority: {
          owner: {
            auths: [
              { key: creator.getPubKey(), weight: 1 },
              { name: moderatorDaoId, weight: 1 }
            ],
            weight: 1
          }
        },
        creator: getDaoCreator(creator),
        description: genSha256Hash({ "description": "Creator DAO" }),
        // offchain
        isTeamAccount: false,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createCreatorDaoByCreatorTx = await createCreatorDaoTx.signAsync(getDaoCreatorPrivKey(creator), api); // 1st approval from Creator DAO (final)
  await sendTxAndWaitAsync(createCreatorDaoByCreatorTx);

  await fundAddressFromFaucet(creatorDaoId, DAO_FUNDING_AMOUNT);
  // await fundAddressFromFaucet(creatorDaoId, 1);
  const creatorDao = await rpc.getAccountAsync(creatorDaoId);
  logJsonResult(`Creator DAO created`, creatorDao);



  /**
   * Create Buyer DAO actor
   */
  logInfo(`Creating Buyer DAO ...`);
  const buyer = await chainService.generateChainSeedAccount({ username: "buyer", password: randomAsHex(32) });
  await fundAddressFromFaucet(buyer.getPubKey(), DAO_SEED_FUNDING_AMOUNT);
  const buyerDaoId = genRipemd160Hash(randomAsHex(20));
  const createBuyerDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: buyerDaoId,
        authority: {
          owner: {
            auths: [
              { key: buyer.getPubKey(), weight: 1 },
              { name: moderatorDaoId, weight: 1 }
            ],
            weight: 1
          }
        },
        creator: getDaoCreator(buyer),
        description: genSha256Hash({ "description": "Buyer DAO" }),
        // offchain
        isTeamAccount: false,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createBuyerDaoByBuyerTx = await createBuyerDaoTx.signAsync(getDaoCreatorPrivKey(buyer), api); // 1st approval from Buyer DAO (final)
  await sendTxAndWaitAsync(createBuyerDaoByBuyerTx);

  await fundAddressFromFaucet(buyerDaoId, DAO_FUNDING_AMOUNT);
  const buyerDao = await rpc.getAccountAsync(buyerDaoId);
  logJsonResult(`Buyer DAO created`, buyerDao);


  
  /**
   * Approve Proposal-1 created by Buyer Dao actor on behalf of all required actors:
   * Buyer Dao actor
   * Alice Dao actor on behalf of Moderator multisig Dao actor
   * Alice Dao actor on behalf of Creator multisig Dao actor
   */
  logInfo(`Deciding on Buyer DAO Proposal-1, Alice DAO approves Proposal-1 on behalf of Moderators multisign DAO on behalf of Creator multisign DAO ...`);
  // Moderators Dao approves Proposal-1
  const decideOnProposal1ByCreatorDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const acceptProposalCmd = new AcceptProposalCmd({
        entityId: proposal1Id,
        account: creatorDaoId,
        batchWeight: proposal1BatchWeight,
      });
      txBuilder.addCmd(acceptProposalCmd);
      return txBuilder.end();
    });

  const creatorDaoCoreAssetBalance1 = await rpc.getFungibleTokenBalanceByOwnerAsync(creatorDaoId, CORE_ASSET.id);
  logJsonResult(`Creator Dao CoreAsset balance 1 after accept buyer proposal`, creatorDaoCoreAssetBalance1);

  logInfo(`Deciding on Buyer DAO Proposal-1, Buyer DAO approves Proposal-1 ...`);
  // Buyer Dao approves Proposal-1
  const decideOnProposal1ByBuyerDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const acceptProposalCmd = new AcceptProposalCmd({
        entityId: proposal1Id,
        account: buyerDaoId,
        batchWeight: proposal1BatchWeight,
      });
      txBuilder.addCmd(acceptProposalCmd);
      return txBuilder.end();
    });

  const proposal1SignedByBuyerDaoTx = await decideOnProposal1ByBuyerDaoTx.signAsync(buyer.getPrivKey(), api); // 1st approval from Creator DAO (final)
  await sendTxAndWaitAsync(proposal1SignedByBuyerDaoTx);

  const creatorDaoCoreAssetBalance2 = await rpc.getFungibleTokenBalanceByOwnerAsync(creatorDaoId, CORE_ASSET.id);
  logJsonResult(`Creator Dao CoreAsset balance 2 after proposal execution`, creatorDaoCoreAssetBalance2);

  const buyerDaoCoreAssetBalance2 = await rpc.getFungibleTokenBalanceByOwnerAsync(buyerDaoId, CORE_ASSET.id);
  logJsonResult(`Buyer Dao CoreAsset balance 2 after proposal execution`, buyerDaoCoreAssetBalance2);

  const proposal1SignedByCreatorDaoTx = await decideOnProposal1ByCreatorDaoTx.signAsync(alice.getPrivKey(), api); // 2st approval from Alice DAO on behalf of Moderators multisig DAO on behalf of Creator multisign DAO
  await sendTxAndWaitAsync(proposal1SignedByCreatorDaoTx);


  const moderatorDaoNft1BalanceAfterAllRequiredApprovals = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(moderatorDaoId, nft1Id);
  const creatorBobDaoNft1BalanceAfterAllRequiredApprovals = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(creatorDaoId, nft1Id);
  const buyerBobDaoNft1BalanceAfterAllRequiredApprovals = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(buyerDaoId, nft1Id);

  logJsonResult(`Moderator Dao Nft1 balance after all required approvals`, moderatorDaoNft1BalanceAfterAllRequiredApprovals);
  logJsonResult(`Creator Dao Nft1 balance after all required approvals`, creatorBobDaoNft1BalanceAfterAllRequiredApprovals);
  logJsonResult(`Buyer Dao Nft1 balance after all required approvals`, buyerBobDaoNft1BalanceAfterAllRequiredApprovals);
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
