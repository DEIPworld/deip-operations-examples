import config from '../config';
import { logError, logInfo, logJsonResult } from '../log';
import { randomAsHex } from '@polkadot/util-crypto';
import { genRipemd160Hash, genSha256Hash } from '@deip/toolbox';
import { APP_PROPOSAL, PROJECT_CONTENT_TYPES } from '@deip/constants';
import { getDefaultDomain } from '../utils';
import {
  AcceptProposalCmd, AddDaoMemberCmd,
  CreateDaoCmd,
  CreateNonFungibleTokenCmd,
  CreateProjectCmd,
  CreateProjectContentCmd,
  CreateProposalCmd,
  IssueNonFungibleTokenCmd,
  TransferFungibleTokenCmd,
  TransferNonFungibleTokenCmd
} from '@deip/commands';

import PRE_SET from './preset';

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
   * Create Charlie DAO actor
   */
  logInfo(`Creating Charlie DAO ...`);
  const charliePwd = randomAsHex(32);
  const charlieDaoId = genRipemd160Hash(randomAsHex(20));
  const charlie = await chainService.generateChainSeedAccount({ username: "charlie", password: charliePwd });
  await fundAddressFromFaucet(charlie.getPubKey(), DAO_SEED_FUNDING_AMOUNT);
  const createCharlieDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: charlieDaoId,
        authority: {
          owner: {
            auths: [{ key: charlie.getPubKey(), weight: 1 }],
            weight: 1
          }
        },
        creator: getDaoCreator(charlie),
        description: genSha256Hash({ "description": "Charlie DAO" }),
        // offchain
        isTeamAccount: false,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createCharlieDaoByCharlieTx = await createCharlieDaoTx.signAsync(getDaoCreatorPrivKey(charlie), api); // 1st approval from Charlie DAO (final)
  await sendTxAndWaitAsync(createCharlieDaoByCharlieTx);

  await fundAddressFromFaucet(charlieDaoId, DAO_FUNDING_AMOUNT);
  const charlieDao = await rpc.getAccountAsync(charlieDaoId);
  logJsonResult(`Charlie DAO created`, charlieDao);



  /**
   * Create Eve DAO actor
   */
  logInfo(`Creating Eve DAO ...`);
  const eve = await chainService.generateChainSeedAccount({ username: "eve", password: randomAsHex(32) });
  await fundAddressFromFaucet(eve.getPubKey(), DAO_SEED_FUNDING_AMOUNT);
  const eveDaoId = genRipemd160Hash(randomAsHex(20));
  const createEveDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: eveDaoId,
        authority: {
          owner: {
            auths: [{ key: eve.getPubKey(), weight: 1 }],
            weight: 1
          }
        },
        creator: getDaoCreator(eve),
        description: genSha256Hash({ "description": "Eve DAO" }),
        // offchain
        isTeamAccount: false,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createEveDaoByEveTx = await createEveDaoTx.signAsync(getDaoCreatorPrivKey(eve), api); // 1st approval from Eve DAO (final)
  await sendTxAndWaitAsync(createEveDaoByEveTx);

  await fundAddressFromFaucet(eveDaoId, DAO_FUNDING_AMOUNT);
  const eveDao = await rpc.getAccountAsync(eveDaoId);
  logJsonResult(`Eve DAO created`, eveDao);



  /**
   * Create Dave DAO actor
   */
  logInfo(`Creating Dave DAO ...`);
  const davePwd = randomAsHex(32);
  const daveDaoId = genRipemd160Hash(randomAsHex(20));
  const dave = await chainService.generateChainSeedAccount({ username: "Dave", password: davePwd });
  await fundAddressFromFaucet(dave.getPubKey(), DAO_SEED_FUNDING_AMOUNT, true);
  const createDaveDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: daveDaoId,
        authority: {
          owner: {
            auths: [{ key: dave.getPubKey(), weight: 1 }],
            weight: 1
          }
        },
        creator: getDaoCreator(dave),
        description: genSha256Hash({ "description": "Dave DAO" }),
        // offchain
        isTeamAccount: false,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createDaveDaoByDaveTx = await createDaveDaoTx.signAsync(getDaoCreatorPrivKey(dave), api); // 1st approval from Dave DAO (final)
  await sendTxAndWaitAsync(createDaveDaoByDaveTx);

  await fundAddressFromFaucet(daveDaoId, DAO_FUNDING_AMOUNT);
  const daveDao = await rpc.getAccountAsync(daveDaoId);
  logJsonResult(`Dave DAO created`, daveDao);


  /**
   * Create Alice-Bob multisig DAO actor with a threshold equal to 1 signature
   * MODERATORS DAO
   */
  logInfo(`Creating Alice-Bob multisig MODERATOR DAO ...`);
  const aliceBobDaoId = genRipemd160Hash(randomAsHex(20));
  const createAliceBobDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createDaoCmd = new CreateDaoCmd({
        entityId: aliceBobDaoId,
        authority: {
          owner: {
            auths: [{ name: aliceDaoId, weight: 1 }, { name: bobDaoId, weight: 1 }],
            weight: 1
          }
        },
        creator: aliceDaoId,
        description: genSha256Hash({ "description": "Alice-Bob multisig DAO" }),
        // offchain
        isTeamAccount: true,
        attributes: []
      });

      txBuilder.addCmd(createDaoCmd);
      return txBuilder.end();
    });
  const createAliceBobDaoByAliceDaoTx = await createAliceBobDaoTx.signAsync(alice.getPrivKey(), api); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(createAliceBobDaoByAliceDaoTx);

  await fundAddressFromFaucet(aliceBobDaoId, DAO_FUNDING_AMOUNT);
  const aliceBobDao = await rpc.getAccountAsync(aliceBobDaoId);
  logJsonResult(`Alice-Bob multisig DAO created`, aliceBobDao);


  /**
   * Add Eve DAO actor to Alice-Bob multisig DAO actor
   */
  logInfo(`Adding Eve DAO to Alice-Bob multisig DAO ...`);
  const addEveDaoToAliceBobDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const addDaoMemberCmd = new AddDaoMemberCmd({
        teamId: aliceBobDaoId,
        member: eveDaoId,
        isThresholdPreserved: true
      });

      txBuilder.addCmd(addDaoMemberCmd);
      return txBuilder.end();
    });
  const addEveDaoToAliceBobDaoByAliceDaoTx = await addEveDaoToAliceBobDaoTx.signAsync(alice.getPrivKey(), api); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(addEveDaoToAliceBobDaoByAliceDaoTx);
  const aliceBobDaoWithEveDao = await rpc.getAccountAsync(aliceBobDaoId);
  logJsonResult(`Eve DAO added to Alice-Bob multisig DAO`, aliceBobDaoWithEveDao);


  /**
   * Create Project on behalf of Charlie DAO actor
   */
  logInfo(`Creating Charlie DAO Project-1 ...`);
  const project1Id = genRipemd160Hash(randomAsHex(20));
  const defaultDomainHex = getDefaultDomain();
  const defaultDomainId = defaultDomainHex.substring(2, defaultDomainHex.length);
  const createProject1Tx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createProjectCmd = new CreateProjectCmd({
        entityId: project1Id,
        description: genSha256Hash({ "description": "Charlie DAO Project" }),
        teamId: charlieDaoId,
        isPrivate: false,
        domains: [defaultDomainId]
      });
      txBuilder.addCmd(createProjectCmd);
      return txBuilder.end();
    });
  const createProject1ByCharlieDaoTx = await createProject1Tx.signAsync(charlie.getPrivKey(), api); // 1st approval from Charlie DAO (final)
  await sendTxAndWaitAsync(createProject1ByCharlieDaoTx);
  const project1 = await rpc.getProjectAsync(project1Id);
  logJsonResult(`Charlie DAO Project-1 created`, project1);


  // /**
  //  * Creating Proposal-1 of Project-1 on behalf of Charlie DAO actor
  //  */
  logInfo(`Creating Charlie DAO Project content proposal for Project-1 ...`);
  const proposal1Id = genRipemd160Hash(randomAsHex(20));
  const project1Content1Id = genRipemd160Hash(randomAsHex(20));
  const nft1Id = genRipemd160Hash(randomAsHex(20));
  const nft1InstanceId = 1;
  let proposal1BatchWeight;
  const createProposal1Tx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createProjectContentCmd = new CreateProjectContentCmd({
        entityId: project1Content1Id,
        projectId: project1Id,
        teamId: charlieDaoId,
        type: PROJECT_CONTENT_TYPES.MILESTONE_CHAPTER,
        description: genSha256Hash({ "description": "Meta for Content-1 of Project-1" }),
        contentType: 1,
        content: genSha256Hash({ "description": "Data of Content-1 of Project-1" }),
        authors: [charlieDaoId],
        references: []
      });

      const createNft1Cmd = new CreateNonFungibleTokenCmd({
        entityId: nft1Id,
        issuer: aliceBobDaoId,
        admin: charlieDaoId,
        name: "Non-Fungible Token 1 of Project-1",
        symbol: "NFT1",
        description: "",
        projectTokenSettings: {
          projectId: project1Id,
          teamId: aliceBobDaoId
        }
      });

      const issueNft1ToAliceBobDaoCmd = new IssueNonFungibleTokenCmd({
        issuer: aliceBobDaoId,
        classId: nft1Id,
        instanceId: nft1InstanceId,
        recipient: aliceBobDaoId,
      });

      const proposal1Batch = [
        createProjectContentCmd,
        createNft1Cmd,
        issueNft1ToAliceBobDaoCmd
      ];

      return chainTxBuilder.getBatchWeight(proposal1Batch)
        .then((batchWeight) => {
          proposal1BatchWeight = batchWeight;

          const createProposalCmd = new CreateProposalCmd({
            entityId: proposal1Id,
            type: APP_PROPOSAL.PROJECT_PROPOSAL,
            creator: charlieDaoId,
            expirationTime: Date.now() + 3e6,
            proposedCmds: proposal1Batch,
          });

          txBuilder.addCmd(createProposalCmd);
          return txBuilder.end();
        })
    });

  const createProposal1ByEveCharlieDaoByEveDaoTx = await createProposal1Tx.signAsync(charlie.getPrivKey(), api); // 1st approval from Eve-Charlie DAO on behalf Eve DAO
  await sendTxAndWaitAsync(createProposal1ByEveCharlieDaoByEveDaoTx);
  const proposal1 = await rpc.getProposalAsync(proposal1Id);
  logJsonResult(`Charlie DAO Proposal-1 created`, proposal1);

  // /**
  //  * Approve Proposal-1 created by Charlie Dao actor on behalf all required actors:
  //  * Alice-Bob-Eve (Moderators) multisig Dao actor
  //  * Charlie Dao actor
  //  */

  logInfo(`Deciding on Charlie DAO Proposal-1, Charlie Dao approves Proposal-1 ...`);
  // Charlie Dao approves Proposal-1
  const decideOnProposal1ByCharlieDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const acceptProposalCmd = new AcceptProposalCmd({
        entityId: proposal1Id,
        account: charlieDaoId,
        batchWeight: proposal1BatchWeight,
      });
      txBuilder.addCmd(acceptProposalCmd);
      return txBuilder.end();
    });

  const proposal1SignedByCharlieDaoTx = await decideOnProposal1ByCharlieDaoTx.signAsync(charlie.getPrivKey(), api); // 1st approval from Charlie DAO (final)
  await sendTxAndWaitAsync(proposal1SignedByCharlieDaoTx);

  const aliceBobDaoNft1BalanceAfterCharlieDaoApproval = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(aliceBobDaoId, nft1Id);
  const charlieBobDaoNft1BalanceAfterCharlieDaoApproval = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(charlieDaoId, nft1Id);
  logJsonResult(`AliceBob Dao Nft1 balance after Charlie approval`, aliceBobDaoNft1BalanceAfterCharlieDaoApproval);
  logJsonResult(`Charlie Dao Nft1 balance after Charlie approval`, charlieBobDaoNft1BalanceAfterCharlieDaoApproval);



  logInfo(`Deciding on Charlie DAO Proposal-1, ALiceBob Dao approves Proposal-1 ...`);
  // ALiceBob Dao approves Proposal-1
  const decideOnProposal1ByAliceBobDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const acceptProposalCmd = new AcceptProposalCmd({
        entityId: proposal1Id,
        account: aliceBobDaoId,
        batchWeight: proposal1BatchWeight,
      });
      txBuilder.addCmd(acceptProposalCmd);
      return txBuilder.end();
    });

  const proposal1SignedByAliceBobDaoTx = await decideOnProposal1ByAliceBobDaoTx.signAsync(eve.getPrivKey(), api, { override: true }); // 2st approval from AliceBob DAO by Eve (final)
  await sendTxAndWaitAsync(proposal1SignedByAliceBobDaoTx);

  const aliceBobDaoNft1BalanceAfterAliceBobDaoApproval = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(aliceBobDaoId, nft1Id);
  const charlieDaoNft1BalanceAfterAliceBobDaoApproval = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(charlieDaoId, nft1Id);
  logJsonResult(`AliceBob Dao Nft1 balance after AliceBob Dao approval`, aliceBobDaoNft1BalanceAfterAliceBobDaoApproval);
  logJsonResult(`Charlie Dao Nft1 balance after AliceBob Dao approval`, charlieDaoNft1BalanceAfterAliceBobDaoApproval);


  // /**
  //  * Creating Proposal-2 for SWAP NFT1 to COINS on behalf of Dave DAO actor
  //  */
  const proposal2Id = genRipemd160Hash(randomAsHex(20));
  let proposal2BatchWeight;
  const createProposal2Tx = await chainTxBuilder.begin()
    .then((txBuilder) => {

      const transferFt1 = new TransferFungibleTokenCmd({
        from: daveDaoId,
        to: aliceBobDaoId,
        tokenId: DEIP_APPCHAIN_CORE_ASSET.id,
        symbol: DEIP_APPCHAIN_CORE_ASSET.symbol,
        precision: DEIP_APPCHAIN_CORE_ASSET.precision,
        amount: "99999"
      });

      const transferNft1 = new TransferNonFungibleTokenCmd({
        from: aliceBobDaoId,
        to: daveDaoId,
        classId: nft1Id,
        instanceId: nft1InstanceId
      })

      const proposal2Batch = [transferFt1, transferNft1];

      return chainTxBuilder.getBatchWeight(proposal2Batch)
        .then((batchWeight) => {
          proposal2BatchWeight = batchWeight;

          const createProposalCmd = new CreateProposalCmd({
            entityId: proposal2Id,
            type: APP_PROPOSAL.PROJECT_PROPOSAL,
            creator: daveDaoId,
            expirationTime: Date.now() + 3e6,
            proposedCmds: proposal2Batch,
          });

          txBuilder.addCmd(createProposalCmd);
          return txBuilder.end();
        })
    });

  const createProposal2ByDaveDaoTx = await createProposal2Tx.signAsync(dave.getPrivKey(), api); // 1st approval from Eve-Charlie DAO on behalf Eve DAO
  await sendTxAndWaitAsync(createProposal2ByDaveDaoTx);
  const proposal2 = await rpc.getProposalAsync(proposal2Id);
  logJsonResult(`Dave DAO Proposal-2 created`, proposal2);


  const aliceBobDaoFtBalanceBeforeProposal2Approved = await rpc.getFungibleTokenBalanceByOwnerAsync(aliceBobDaoId, DEIP_APPCHAIN_CORE_ASSET.id);
  const daveDaoFtBalanceBeforeProposal2Approved = await rpc.getFungibleTokenBalanceByOwnerAsync(daveDaoId, DEIP_APPCHAIN_CORE_ASSET.id);
  logJsonResult(`AliceBob Dao balance before Proposal-2 approved`, aliceBobDaoFtBalanceBeforeProposal2Approved);
  logJsonResult(`Dave Dao balance before Proposal-2 approved`, daveDaoFtBalanceBeforeProposal2Approved);


  logInfo(`Deciding on Dave DAO Proposal-2, Dave Dao approves Proposal-2 ...`);
  // Charlie Dao approves Proposal-1
  const decideOnProposal2ByDaveDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const acceptProposalCmd = new AcceptProposalCmd({
        entityId: proposal2Id,
        account: daveDaoId,
        batchWeight: proposal2BatchWeight,
      });
      txBuilder.addCmd(acceptProposalCmd);
      return txBuilder.end();
    });

  const proposal2SignedByDaveDaoTx = await decideOnProposal2ByDaveDaoTx.signAsync(dave.getPrivKey(), api); // 1st approval from Dave DAO
  await sendTxAndWaitAsync(proposal2SignedByDaveDaoTx);

  logInfo(`Deciding on Dave DAO Proposal-2, ALiceBob Dao approves Proposal-2 ...`);
  // ALiceBob Dao approves Proposal-2
  const decideOnProposal2ByAliceBobDaoTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const acceptProposalCmd = new AcceptProposalCmd({
        entityId: proposal2Id,
        account: aliceBobDaoId,
        batchWeight: proposal2BatchWeight,
      });
      txBuilder.addCmd(acceptProposalCmd);
      return txBuilder.end();
    });

  const proposal2SignedByAliceBobDaoTx = await decideOnProposal2ByAliceBobDaoTx.signAsync(eve.getPrivKey(), api, { override: true }); // 2st approval from AliceBob DAO (final)
  await sendTxAndWaitAsync(proposal2SignedByAliceBobDaoTx);

  const aliceBobDaoNft1BalanceAfterProposal2Approved = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(aliceBobDaoId, nft1Id);
  const daveDaoNft1BalanceAfterProposal2Approved = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(daveDaoId, nft1Id);
  logJsonResult(`AliceBob Dao Nft1 balance after AliceBob Dao approval`, aliceBobDaoNft1BalanceAfterProposal2Approved);
  logJsonResult(`Dave Dao Nft1 balance after AliceBob Dao approval`, daveDaoNft1BalanceAfterProposal2Approved);


  const aliceBobDaoFtBalanceAfterProposal2Approved = await rpc.getFungibleTokenBalanceByOwnerAsync(aliceBobDaoId, DEIP_APPCHAIN_CORE_ASSET.id);
  const daveDaoFtBalanceAfterProposal2Approved = await rpc.getFungibleTokenBalanceByOwnerAsync(daveDaoId, DEIP_APPCHAIN_CORE_ASSET.id);
  logJsonResult(`AliceBob Dao balance after Proposal-2 approved`, aliceBobDaoFtBalanceAfterProposal2Approved);
  logJsonResult(`Dave Dao balance after Proposal-2 approved`, daveDaoFtBalanceAfterProposal2Approved);

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
