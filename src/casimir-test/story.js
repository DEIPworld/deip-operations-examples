import { NonFungibleTokenService } from '@casimir/token-service';
import config from '../config';
import { logError, logInfo, logJsonResult } from '../log';
import { randomAsHex } from '@polkadot/util-crypto';
import { assert, genRipemd160Hash, genSha256Hash } from '@deip/toolbox';
import { APP_PROPOSAL, PROJECT_CONTENT_TYPES } from '@casimir/platform-core';
import { getDefaultDomain } from '../utils';
import {
    AcceptProposalCmd, AddDaoMemberCmd,
    CreateDaoCmd,
    CreateNonFungibleTokenCmd,
    UpdateNonFungibleTokenTeamCmd,
    UpdateNonFungibleTokenOwnerCmd,
    CreateNftCollectionCmd,
    CreateProposalCmd,
    IssueNonFungibleTokenCmd,
    TransferFTCmd,
    TransferNonFungibleTokenCmd,
} from '@deip/commands';
import { proxydi } from '@deip/proxydi';
import { AccessService } from '@deip/access-service';
const accessService = AccessService.getInstance();
const axios = require('axios').default;


proxydi.register('env', {
    "NODE_ENV": "development",
    "DEIP_CLIENT_URL": "http://localhost:8080",
    "DEIP_SERVER_URL": "http://localhost:9081",
    "DEIP_WEB_SOCKET_URL": "ws://localhost:9083",
    "DEIP_FULL_NODE_URL": "wss://ws-appchain.yuliyachykiliova.lol/",
    "DEIP_CHAIN_EXPLORER_URL": "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fws-appchain.yuliyachykiliova.lol#/explorer",
    "TENANT": "0000000000000000000000000000000000000001",
    "TENANT_HOT_WALLET_DAO_ID": "20d1c50067827d1ba447d1be4a4d5129fb0583ed",
    "DEIP_PAYMENT_SERVICE_URL": "https://dev-payments.deip.world",
    "PROTOCOL": 2,
    "CORE_ASSET": {
        "id": 0,
        "symbol": "DEIP",
        "precision": 18
    },
    "ACCOUNT_DEFAULT_FUNDING_AMOUNT": "10000000000000000000000",
    "FAUCET_ACCOUNT_USERNAME": "regacc",
    "SIG_SEED": "quickbrownfoxjumpsoverthelazydog",
    "APP_ID": "25f9e794323b453885f5181f1b624d0b",
    "VUE_APP_I18N_LOCALE": "en",
    "VUE_APP_I18N_FALLBACK_LOCALE": "en",
    "WALLET_OAUTH_URL": "https://wallet-testnet.deip.world/account/oauth"
});

const nftTokenService = NonFungibleTokenService.getInstance()
console.log("NFT TOKEN SERVICE", nftTokenService)

import PRE_SET from '../casimir/preset';

const {
    setup,
    getChainService,
    getDaoCreator,
    getDaoCreatorPrivKey,
    fundAddressFromFaucet,
    sendTxAndWaitAsync
} = PRE_SET(config);

const getAuthToken = async ({ username, secretSigHex }) => {
    const options = {
        method: 'POST',
        url: 'http://127.0.0.1:9081/auth/sign-in',
        headers: {
            Connection: 'keep-alive',
            'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
            DNT: '1',
            'sec-ch-ua-mobile': '?0',
            // Authorization: 'Bearer null',
            'deip-application': 'undefined',
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
            'sec-ch-ua-platform': '"macOS"',
            Origin: 'http://localhost:8080',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            Referer: 'http://localhost:8080/',
            'Accept-Language': 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7'
        },
        data: {
            username: username,
            secretSigHex: secretSigHex,
        }
    };
    // const mock = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjA1MzE5MWMwZGRkMThmZTc2NjA5M2Q5Mjk4NzkyOTc5ODk0YzIwYTAiLCJwb3J0YWwiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxIiwiaXNQb3J0YWxBZG1pbiI6ZmFsc2UsImV4cCI6MTY1ODIyMzM5MywiaWF0IjoxNjU4MTM2OTkzfQ.0Sv9sFZ0-Dj8pdOxqPPNLilIIPnOteCpOzNuAOPlUxU'
    // return mock
    const result = await axios.request(options).then(function (response) {
        console.log(response.data);
        return response.data.data.jwtToken;
    }).catch(function (error) {
        console.error(error);
    });
    console.log('result', result)
    return result;
}


async function run() {
    const chainService = await getChainService();
    const chainTxBuilder = chainService.getChainTxBuilder();
    const api = chainService.getChainNodeClient();
    const rpc = chainService.getChainRpc();

    const CORE_ASSET = config.CORE_ASSET;
    const DAO_SEED_FUNDING_AMOUNT = config.FAUCET_ACCOUNT.fundingAmount
    const DAO_FUNDING_AMOUNT = config.FAUCET_ACCOUNT.fundingAmount;


    /**
     * Create Creator DAO actor
     */
    logInfo(`Creating Creator DAO ...`);
    const creatorPwd = "0x1a98c2a8566e1aa6943274a84885674bb4be26e8d4f9518102ba5a967601f624";
    const creatorDaoId = "053191c0ddd18fe766093d9298792979894c20a0";

    // const creatorPwd = randomAsHex(32);
    // const creatorDaoId = genRipemd160Hash(randomAsHex(20));

    const creator = await chainService.generateChainSeedAccount({ username: "creator", password: creatorPwd });
    // await fundAddressFromFaucet(creator.getPubKey(), DAO_SEED_FUNDING_AMOUNT);
    // const createCreatorDaoTx = await chainTxBuilder.begin()
    // .then((txBuilder) => {
    //   const createDaoCmd = new CreateDaoCmd({
    //     entityId: creatorDaoId,
    //     authority: {
    //       owner: {
    //         auths: [
    //           { key: creator.getPubKey(), weight: 1 },
    //         ],
    //         weight: 1
    //       }
    //     },
    //     creator: getDaoCreator(creator),
    //     description: genSha256Hash({ "description": "Creator DAO" }),
    //     // offchain
    //     isTeamAccount: false,
    //     attributes: []
    //   });

    //   txBuilder.addCmd(createDaoCmd);
    //   return txBuilder.end();
    // });
    // const createCreatorDaoByCreatorTx = await createCreatorDaoTx.signAsync(getDaoCreatorPrivKey(creator), api); // 1st approval from Creator DAO (final)
    // await sendTxAndWaitAsync(createCreatorDaoByCreatorTx);
    // await fundAddressFromFaucet(creatorDaoId, DAO_SEED_FUNDING_AMOUNT);
    // const creatorDao = await rpc.getAccountAsync(creatorDaoId);
    // logJsonResult(`Creator DAO created`, creatorDao);


    //login
    const signedSeedSid = creator.signString("quickbrownfoxjumpsoverthelazydog");
    console.log("signedSeedSid", signedSeedSid)
    const jwt = await getAuthToken({ username: creatorDaoId, secretSigHex: signedSeedSid });

    //set data to access service
    accessService.setAccessToken(jwt, creator.getPrivKey(), creator.getPubKey());
    console.log("Asset service", accessService.getAccessToken());
    logInfo(`Creating Portal Project-1 NFT Class 1 ...`);
    /**
     * Create NFT Class-1
     */
    await nftTokenService.createNftCollection({
        initiator: {
            privKey: getDaoCreatorPrivKey(creator),
        },
        data: {
            issuer: creatorDaoId,
            issuedByTeam: false,
            metadata: null
        }
    }).catch(err => {
        if (!err.message.indexOf("ReferenceError: FormData is not defined") > -1)
            console.error("error", err);
    });

    // logInfo(`Creating Portal Project-1 NFT Class 1 ...`);
    // const nft1Id = await rpc.getNextAvailableNftClassId();;
    // const createNftClass1Tx = await chainTxBuilder.begin()
    // .then((txBuilder) => {
    //     const createNft1Cmd = new CreateNonFungibleTokenCmd({
    //         entityId: nft1Id,
    //         issuer: creatorDaoId,
    //         name: "Non-Fungible Token 1 of Project-1",
    //         symbol: "NFT1",
    //         description: "",
    //     });
    //     txBuilder.addCmd(createNft1Cmd);

    //     return txBuilder.end();
    // });

    // const createNftClass1TxByCreatorDao = await createNftClass1Tx.signAsync(creator.getPrivKey(), api); // 1st approval from Creator DAO (final)
    // await sendTxAndWaitAsync(createNftClass1TxByCreatorDao);
    // logJsonResult(`Portal NFT Class 1 created`, nft1Id);


    //   // /**
    //   //  * Creating lazy-mint Proposal-1 of Project-1 on behalf of Buyer DAO actor
    //   //  */
    //   logInfo(`Creating lazy-buy proposal on behalf of Buyer DAO actor ...`);
    //   const proposal1Id = genRipemd160Hash(randomAsHex(20));
    //   let proposal1BatchWeight;
    //   const nft1InstanceId = 1;
    //   const createProposal1Tx = await chainTxBuilder.begin()
    //     .then((txBuilder) => {

    //       const transferFt = new TransferFTCmd({
    //         from: buyerDaoId,
    //         to: creatorDaoId,
    //         tokenId: CORE_ASSET.id,
    //         symbol: CORE_ASSET.symbol,
    //         precision: CORE_ASSET.precision,
    //         amount: "99999"
    //       });

    //       const issueNft = new IssueNonFungibleTokenCmd({
    //         issuer: hotWalletDaoId,
    //         recipient: buyerDaoId,
    //         classId: nft1Id,
    //         instanceId: nft1InstanceId,
    //       });

    //       const proposal1Batch = [
    //         transferFt,
    //         issueNft
    //       ];

    //       return chainTxBuilder.getBatchWeight(proposal1Batch)
    //         .then((batchWeight) => {
    //           proposal1BatchWeight = batchWeight;

    //           const createProposalCmd = new CreateProposalCmd({
    //             entityId: proposal1Id,
    //             type: APP_PROPOSAL.PROJECT_PROPOSAL,
    //             creator: buyerDaoId,
    //             expirationTime: Date.now() + 3e6,
    //             proposedCmds: proposal1Batch,
    //             batchWeight
    //           });

    //           txBuilder.addCmd(createProposalCmd);

    //           const acceptProposalCmd = new AcceptProposalCmd({
    //             entityId: proposal1Id,
    //             account: buyerDaoId,
    //             batchWeight: proposal1BatchWeight,
    //           });
    //           txBuilder.addCmd(acceptProposalCmd);
    //           return txBuilder.end();
    //         })
    //     });


    //   const createProposal1ByCreatorDaoTx = await createProposal1Tx.signAsync(buyer.getPrivKey(), api); // lazy-mint proposal created
    //   await sendTxAndWaitAsync(createProposal1ByCreatorDaoTx);
    //   const proposal1 = await rpc.getProposalAsync(proposal1Id);
    //   logJsonResult(`Buyer DAO lazy-buy Proposal-1 created`, proposal1);

    //   logInfo(`Deciding on Buyer DAO Proposal-1, HotWallet DAO approves Proposal-1 ...`);
    //   const decideOnProposal1ByHotWalletDaoTx = await chainTxBuilder.begin()
    //     .then((txBuilder) => {
    //       const acceptProposalCmd = new AcceptProposalCmd({
    //         entityId: proposal1Id,
    //         account: hotWalletDaoId,
    //         batchWeight: proposal1BatchWeight,
    //       });
    //       txBuilder.addCmd(acceptProposalCmd);
    //       return txBuilder.end();
    //     });

    //   const proposal1SignedByHotWalletDaoTx = await decideOnProposal1ByHotWalletDaoTx.signAsync(hotWallet.getPrivKey(), api); // 1st approval from Buyer DAO
    //   await sendTxAndWaitAsync(proposal1SignedByHotWalletDaoTx);

    //   const hotWalletDaoNft1BalanceAfterAllRequiredApprovals = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(hotWalletDaoId, nft1Id);
    //   logJsonResult(`HotWallet Dao Nft1 balance after all required approvals`, hotWalletDaoNft1BalanceAfterAllRequiredApprovals);

    //   const creatorBobDaoNft1BalanceAfterAllRequiredApprovals = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(creatorDaoId, nft1Id);
    //   logJsonResult(`Creator Dao Nft1 balance after all required approvals`, creatorBobDaoNft1BalanceAfterAllRequiredApprovals);

    //   const buyerBobDaoNft1BalanceAfterAllRequiredApprovals = await rpc.getNonFungibleTokenClassInstancesByOwnerAsync(buyerDaoId, nft1Id);
    //   logJsonResult(`Buyer Dao Nft1 balance after all required approvals`, buyerBobDaoNft1BalanceAfterAllRequiredApprovals);
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
