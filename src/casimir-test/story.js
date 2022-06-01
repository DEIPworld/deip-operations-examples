import config from '../config';
import { logError, logInfo, logJsonResult } from '../log';
import { randomAsHex } from '@polkadot/util-crypto';
import { genRipemd160Hash, genSha256Hash } from '@deip/toolbox';
import {
  CreateDaoCmd,
  CreateFungibleTokenCmd,
  CreateNonFungibleTokenCmd,
  IssueFungibleTokenCmd,
  IssueNonFungibleTokenCmd,
  TransferFungibleTokenCmd,
  TransferNonFungibleTokenCmd
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

  const recipientAddress = "5F9XVEoQDCYmTH4k5qczas4DiZUfp1RGbYKHyBYFgA9Zj1qn";


  logInfo(`Creating FT ...`);
  const ft1Id = await rpc.getNextAvailableFtId();;
  const createAndIssueFt1Tx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createFt1Cmd = new CreateFungibleTokenCmd({
        entityId: ft1Id,
        issuer: aliceDaoId,
        name: `Fungible Token ${ft1Id}`,
        symbol: `FT-${ft1Id}`,
        precision: 2,
        description: "",
        minBalance: 1,
        maxSupply: 1000000000000000 // TODO: add 'maxSupply' for Substrate assets_pallet wrapper
      });
      txBuilder.addCmd(createFt1Cmd);

      const issueFt1Cmd = new IssueFungibleTokenCmd({
        issuer: aliceDaoId,
        tokenId: ft1Id,
        amount: 200,
        recipient: aliceDaoId
      });
      txBuilder.addCmd(issueFt1Cmd);

      const issueFt2Cmd = new IssueFungibleTokenCmd({
        issuer: aliceDaoId,
        tokenId: ft1Id,
        amount: 300,
        recipient: recipientAddress
      });
      txBuilder.addCmd(issueFt2Cmd);

      return txBuilder.end();
    });
  const createAndIssueFt1TxByAlicDao = await createAndIssueFt1Tx.signAsync(alice.getPrivKey(), api); // 1st approval from Treasury DAO (final)
  await sendTxAndWaitAsync(createAndIssueFt1TxByAlicDao);
  const ft1 = await rpc.getFungibleTokenAsync(ft1Id);
  logJsonResult(`FT-${ft1Id} created`, ft1);

  const ft1Balance = await rpc.getFungibleTokenBalanceByOwnerAsync(recipientAddress, ft1Id);
  logJsonResult(`FT-${ft1Id} balance for ${recipientAddress}`, ft1Balance);


  logInfo(`Creating NFT ...`);
  const nft1Id = await rpc.getNextAvailableNftClassId();
  const createAndIssueNft1Tx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const createNft1Cmd = new CreateNonFungibleTokenCmd({
        entityId: nft1Id,
        issuer: aliceDaoId,
        admin: aliceDaoId,
        name: "Non-Fungible Token 1",
        symbol: "NFT1",
        description: "",
      });
      txBuilder.addCmd(createNft1Cmd);

      const issueNft1Cmd = new IssueNonFungibleTokenCmd({
        issuer: aliceDaoId,
        recipient: aliceDaoId, // daoIdOrPubKeyOrAddress
        classId: nft1Id,
        instanceId: 1,
      });
      txBuilder.addCmd(issueNft1Cmd);

      const issueNft2Cmd = new IssueNonFungibleTokenCmd({
        issuer: aliceDaoId,
        recipient: recipientAddress, // daoIdOrPubKeyOrAddress
        classId: nft1Id,
        instanceId: 2,
      });

      txBuilder.addCmd(issueNft2Cmd);
      return txBuilder.end();
    });
  const createAndIssueNft1ByAliceDaoTx = await createAndIssueNft1Tx.signAsync(alice.getPrivKey(), api); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(createAndIssueNft1ByAliceDaoTx);

  const nft1 = await rpc.getNonFungibleTokenClassAsync(nft1Id);
  logJsonResult(`NFT-${nft1Id}`, nft1);

  const nft1Balance = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(recipientAddress, nft1Id); // daoIdOrPubKeyOrAddress
  logJsonResult(`NFT-${nft1Id} balance for ${recipientAddress}`, nft1Balance);


  logInfo(`Transfer ...`);
  const transferFtTx = await chainTxBuilder.begin()
    .then((txBuilder) => {
      const transferFt1 = new TransferFungibleTokenCmd({
        from: aliceDaoId,
        to: recipientAddress, // daoIdOrPubKeyOrAddress
        tokenId: ft1Id,
        amount: 100
      });
      txBuilder.addCmd(transferFt1);

      const transferNft1 = new TransferNonFungibleTokenCmd({
        from: aliceDaoId,
        to: recipientAddress, // daoIdOrPubKeyOrAddress
        classId: nft1Id,
        instanceId: 1
      })
      txBuilder.addCmd(transferNft1);

      const transferCore = new TransferFungibleTokenCmd({
        from: aliceDaoId,
        to: recipientAddress, // daoIdOrPubKeyOrAddress
        tokenId: DEIP_APPCHAIN_CORE_ASSET.id,
        amount: "50000000000000000000"
      });
      txBuilder.addCmd(transferCore);
      
      return txBuilder.end();
    });
  const transferFtTxByAliceDaoTx = await transferFtTx.signAsync(getDaoCreatorPrivKey(alice), api); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(transferFtTxByAliceDaoTx);

  const ft1Balance1 = await rpc.getFungibleTokenBalanceByOwnerAsync(recipientAddress, ft1Id); // daoIdOrPubKeyOrAddress
  logJsonResult(`Updated FT-${ft1Id} balance for ${recipientAddress}`, ft1Balance1);

  const nft1Balance1 = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(recipientAddress, nft1Id); // daoIdOrPubKeyOrAddress
  logJsonResult(`Updated NFT-${nft1Id} balance for ${recipientAddress}`, nft1Balance1);

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
