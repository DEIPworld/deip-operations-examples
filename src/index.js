import config from './config';
import types from './types.json';
import { ApiPromise } from '@polkadot/api/promise';
import { HttpProvider } from '@polkadot/rpc-provider';
import { TypeRegistry } from '@polkadot/types/create';
import { Metadata } from '@polkadot/metadata';
import { logInfo, logSuccess, logError, logWarn } from './log';
import { getFaucetAccount, generateAccount, daoIdToAddress, getMultiAddress, getDefaultDomain } from './utils';
import { sendTxAsync, sendTxAndWaitAsync, getAccountAsync, getProjectAsync } from './api';
import { keccakAsHex, encodeAddress, decodeAddress, blake2AsU8a, createKeyMulti, randomAsHex } from '@polkadot/util-crypto';
import { u8aToHex, hexToU8a, isU8a, isHex, stringToU8a } from '@polkadot/util';



async function setup() {
  const typesRegistry = new TypeRegistry();
  typesRegistry.register(types);

  const provider = new HttpProvider(config.DEIP_APPCHAIN_NODE_URL);

  const api = await ApiPromise.create({ provider, registry: typesRegistry });
  const [chain, nodeName, nodeVersion, rpcMetadata] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
    api.rpc.state.getMetadata()
  ]);
  api.registry.setMetadata(new Metadata(typesRegistry, rpcMetadata));
  console.log(`Connected to DEIP Appchain node ${chain.toString()} using ${nodeName.toString()} v${nodeVersion.toString()}`);
  return api;
}


async function fundAddress(addrees, api) {
  // const amount = "1000000000000000000"; // Mill
  const amount = "1000000000000000000";
  const tx = api.tx.balances.transfer(addrees, amount);
  await tx.signAsync(getFaucetAccount());
  await sendTxAndWaitAsync(tx.toHex());
}



async function run(api) {

  /**
   * Create Alice DAO actor
   */
  logInfo(`Creating Alice DAO ...`);
  const alice = generateAccount("alice");
  await fundAddress(alice.address, api);
  const aliceDaoId = randomAsHex(20);
  const aliceDaoAddress = daoIdToAddress(aliceDaoId, api);
  const createAliceDaoOp = api.tx.deipDao.create(
    /* ID */ aliceDaoId,
    /* Authority */ {
      "signatories": [alice.address],
      "threshold": 0
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Alice DAO" }), 256)
  );
  const createAliceDaoTx = api.tx.utility.batchAll([
    createAliceDaoOp
  ]);
  await createAliceDaoTx.signAsync(alice);
  await sendTxAndWaitAsync(createAliceDaoTx.toHex());
  await fundAddress(aliceDaoAddress, api);
  const aliceDao = await getAccountAsync(aliceDaoId);
  logSuccess(`Alice DAO created: ${JSON.stringify(aliceDao)}\n`);


  /**
   * Create Bob DAO actor
   */
  logInfo(`Creating Bob DAO ...`);
  const bob = generateAccount("bob");
  await fundAddress(bob.address, api);
  const bobDaoId = randomAsHex(20);
  const bobDaoAddress = daoIdToAddress(bobDaoId, api);
  const createBobDaoOp = api.tx.deipDao.create(
    /* ID */ bobDaoId,
    /* Authority */ {
      "signatories": [bob.address],
      "threshold": 0
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Bob DAO" }), 256)
  );
  const createBobDaoTx = api.tx.utility.batchAll([
    createBobDaoOp
  ]);
  await createBobDaoTx.signAsync(bob);
  await sendTxAndWaitAsync(createBobDaoTx.toHex());
  await fundAddress(bobDaoAddress, api);
  const bobDao = await getAccountAsync(bobDaoId);
  logSuccess(`Bob DAO created: ${JSON.stringify(bobDao)}\n`)


  /**
   * Create Charlie DAO actor
   */
  logInfo(`Creating Charlie DAO ...`);
  const charlie = generateAccount("charlie");
  await fundAddress(charlie.address, api);
  const charlieDaoId = randomAsHex(20);
  const charlieDaoAddress = daoIdToAddress(charlieDaoId, api);
  const createCharlieDaoOp = api.tx.deipDao.create(
    /* ID */ charlieDaoId,
    /* Authority */ {
      "signatories": [charlie.address],
      "threshold": 0
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Charlie DAO" }), 256)
  );
  const createCharlieDaoTx = api.tx.utility.batchAll([
    createCharlieDaoOp
  ]);
  await createCharlieDaoTx.signAsync(charlie);
  await sendTxAndWaitAsync(createCharlieDaoTx.toHex());
  await fundAddress(charlieDaoAddress, api);
  const charlieDao = await getAccountAsync(charlieDaoId);
  logSuccess(`Charlie DAO created: ${JSON.stringify(charlieDao)}\n`)


  /**
   * Create Dave DAO actor
   */
  logInfo(`Creating Dave DAO ...`);
  const dave = generateAccount("dave");
  await fundAddress(dave.address, api);
  const daveDaoId = randomAsHex(20);
  const daveDaoAddress = daoIdToAddress(daveDaoId, api);
  const createDaveDaoOp = api.tx.deipDao.create(
    /* ID */ daveDaoId,
    /* Authority */ {
      "signatories": [dave.address],
      "threshold": 0
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Dave DAO" }), 256)
  );
  const createDaveDaoTx = api.tx.utility.batchAll([
    createDaveDaoOp
  ]);
  await createDaveDaoTx.signAsync(dave);
  await sendTxAndWaitAsync(createDaveDaoTx.toHex());
  await fundAddress(daveDaoAddress, api);
  const daveDao = await getAccountAsync(daveDaoId);
  logSuccess(`Dave DAO created: ${JSON.stringify(daveDao)}\n`)


  /**
   * Create Eve DAO actor
   */
  logInfo(`Creating Eve DAO ...`);
  const eve = generateAccount("eve");
  await fundAddress(eve.address, api);
  const eveDaoId = randomAsHex(20);
  const eveDaoAddress = daoIdToAddress(eveDaoId, api);
  const createEveDaoOp = api.tx.deipDao.create(
    /* ID */ eveDaoId,
    /* Authority */ {
      "signatories": [eve.address],
      "threshold": 0
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Eve DAO" }), 256)
  );
  const createEveDaoTx = api.tx.utility.batchAll([
    createEveDaoOp
  ]);
  await createEveDaoTx.signAsync(eve);
  await sendTxAndWaitAsync(createEveDaoTx.toHex());
  await fundAddress(eveDaoAddress, api);
  const eveDao = await getAccountAsync(eveDaoId);
  logSuccess(`Eve DAO created: ${JSON.stringify(eveDao)}\n`)



  /**
   * Create Alice-Bob multisig DAO actor with a threshold equal to 1 signature
   */
  logInfo(`Creating Alice-Bob multisig DAO ...`);
  const aliceBobDaoId = randomAsHex(20);
  const aliceBobDaoAddress = daoIdToAddress(aliceBobDaoId, api);
  const createAliceBobDaoOp = api.tx.deipDao.create(
    /* ID */ aliceBobDaoId,
    /* Authority */ {
      "signatories": [aliceDaoAddress, bobDaoAddress],
      "threshold": 1
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Alice-Bob multisig DAO" }), 256)
  );

  const createAliceBobDaoTx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(aliceDaoId, api.tx.multisig.asMultiThreshold1([bobDaoAddress], createAliceBobDaoOp))
  ]);
  await createAliceBobDaoTx.signAsync(alice);
  await sendTxAndWaitAsync(createAliceBobDaoTx.toHex());
  await fundAddress(aliceBobDaoAddress, api);
  const aliceBobDao = await getAccountAsync(aliceBobDaoId);
  logSuccess(`Alice-Bob multisig DAO created: ${JSON.stringify(aliceBobDao)}\n`)



  /**
   * Create Alice-Charlie multisig DAO actor with a threshold equal to 1 signature
   */
  logInfo(`Creating Alice-Charlie multisig DAO ...`);
  const aliceCharlieDaoId = randomAsHex(20);
  const aliceCharlieDaoAddress = daoIdToAddress(aliceCharlieDaoId, api);
  const createAliceCharlieDaoOp = api.tx.deipDao.create(
    /* ID */ aliceCharlieDaoId,
    /* Authority */ {
      "signatories": [aliceDaoAddress, charlieDaoAddress],
      "threshold": 1
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Alice-Charlie multisig DAO" }), 256)
  );

  const createAliceCharlieDaoTx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(aliceDaoId, api.tx.multisig.asMultiThreshold1([charlieDaoAddress], createAliceCharlieDaoOp))
  ]);
  await createAliceCharlieDaoTx.signAsync(alice);
  await sendTxAndWaitAsync(createAliceCharlieDaoTx.toHex());
  await fundAddress(aliceCharlieDaoAddress, api);
  const aliceCharlieDao = await getAccountAsync(aliceCharlieDaoId);
  logSuccess(`Alice-Charlie multisig DAO created: ${JSON.stringify(aliceCharlieDao)}\n`)
 


  /**
   * Create Bob-Dave multisig DAO actor with a threshold equal to 2 signatures
   */
  logInfo(`Creating Bob-Dave multisig DAO ...`);
  const bobDaveDaoId = randomAsHex(20);
  const bobDaveDaoAddress = daoIdToAddress(bobDaveDaoId, api);
  const createBobDaveDaoOp = api.tx.deipDao.create(
    /* ID */ bobDaveDaoId,
    /* Authority */ {
      "signatories": [bobDaoAddress, daveDaoAddress],
      "threshold": 2
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Bob-Dave multisig DAO" }), 256)
  );
  const bobDaveMultiAddress = getMultiAddress([bobDaoAddress, daveDaoAddress], 2);
  const { weight } = await createBobDaveDaoOp.paymentInfo(bobDaveMultiAddress);
  const createBobDaveDaoByBobTx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(bobDaoId, api.tx.multisig.approveAsMulti(2, [daveDaoAddress], null, createBobDaveDaoOp.method.hash, weight))
  ]);
  await createBobDaveDaoByBobTx.signAsync(bob); // first approval
  await sendTxAndWaitAsync(createBobDaveDaoByBobTx.toHex());
  const multisigInfo1 = await api.query.multisig.multisigs(bobDaveMultiAddress, createBobDaveDaoOp.method.hash);
  const timepoint = multisigInfo1.isSome ? multisigInfo1.unwrap().when : null;
  const createBobDaveDaoByDaveTx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(daveDaoId, api.tx.multisig.asMulti(2, [bobDaoAddress], timepoint, createBobDaveDaoOp.method.toHex(), true, weight))
  ]);
  await createBobDaveDaoByDaveTx.signAsync(dave); // final approval
  await sendTxAndWaitAsync(createBobDaveDaoByDaveTx.toHex());
  await fundAddress(bobDaveDaoAddress, api);
  const bobDaveDao = await getAccountAsync(bobDaveDaoId);
  logSuccess(`Bob-Dave multisig DAO created: ${JSON.stringify(bobDaveDao)}\n`)



  /**
   * Create Multigroup-1 (Alice-Charlie, Bob-Dave) multisig DAO actor with a threshold equal to 1 signature
   */
  logInfo(`Creating Multigroup-1 (Alice-Charlie, Bob-Dave) multisig DAO ...`);
  const multigroupDaoId = randomAsHex(20);
  const multigroupDaoAddress = daoIdToAddress(multigroupDaoId, api);
  const createMultigroupOp = api.tx.deipDao.create(
    /* ID */ multigroupDaoId,
    /* Authority */ {
      "signatories": [aliceCharlieDaoAddress, bobDaveDaoAddress],
      "threshold": 1
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Multigroup-1 multisig DAO" }), 256)
  );
  const createMultigroupDaoOp = api.tx.deipDao.onBehalf(
    aliceDaoId,
    api.tx.multisig.asMultiThreshold1(
      [charlieDaoAddress],
      api.tx.deipDao.onBehalf(
        aliceCharlieDaoId,
        api.tx.multisig.asMultiThreshold1(
          [bobDaveDaoAddress],
          createMultigroupOp
        )
      )
    )
  );
  const createMultiDaoTx = api.tx.utility.batchAll([createMultigroupDaoOp]);
  await createMultiDaoTx.signAsync(alice);
  await sendTxAndWaitAsync(createMultiDaoTx.toHex());
  await fundAddress(multigroupDaoAddress, api);
  const multigroupDao = await getAccountAsync(multigroupDaoId);
  logSuccess(`Multigroup-1 (Alice-Charlie, Bob-Dave) multisig DAO created: ${JSON.stringify(multigroupDao)}\n`)


  /**
   * Create Multigroup-2 (Alice-Charlie, Bob-Dave) multisig DAO actor with a threshold equal to 2 signatures
   */
  logInfo(`Creating Multigroup-2 (Alice-Charlie, Bob-Dave) multisig DAO ...`);
  const multigroup2DaoId = randomAsHex(20);
  const multigroup2DaoAddress = daoIdToAddress(multigroup2DaoId, api);
  const createMultigroup2Op = api.tx.deipDao.create(
    /* ID */ multigroup2DaoId,
    /* Authority */ {
      "signatories": [aliceCharlieDaoAddress, bobDaveDaoAddress],
      "threshold": 2
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Multigroup-2 multisig DAO" }), 256)
  );
  const multigroup2MultiAddress = getMultiAddress([aliceCharlieDaoAddress, bobDaveDaoAddress], 2);
  const { weight: weight2 } = await createMultigroup2Op.paymentInfo(multigroup2MultiAddress);
  const createMultigroup2By1Tx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(aliceDaoId,
      api.tx.multisig.asMultiThreshold1(
        [charlieDaoAddress],
        api.tx.deipDao.onBehalf(
          aliceCharlieDaoId,
          api.tx.multisig.approveAsMulti(2, [bobDaveDaoAddress], null, createMultigroup2Op.method.hash, weight2)
        )
      )
    )
  ]);
  await createMultigroup2By1Tx.signAsync(alice);
  await sendTxAndWaitAsync(createMultigroup2By1Tx.toHex());

  const multisigInfo2 = await api.query.multisig.multisigs(multigroup2MultiAddress, createMultigroup2Op.method.hash);
  const timepoint2 = multisigInfo2.isSome ? multisigInfo2.unwrap().when : null;
  const approveOp1 = api.tx.deipDao.onBehalf(
    bobDaveDaoId,
    api.tx.multisig.asMulti(2, [aliceCharlieDaoAddress], timepoint2, createMultigroup2Op.method.toHex(), true, weight2)
  );
  const { weight: weight3 } = await approveOp1.paymentInfo(bobDaveDaoAddress);
  const approveOp2 = api.tx.multisig.approveAsMulti(2, [daveDaoAddress], null, approveOp1.method.hash, weight3)
  const createMultigroup2By2Tx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(bobDaoId, approveOp2)
  ]);
  await createMultigroup2By2Tx.signAsync(bob);
  await sendTxAndWaitAsync(createMultigroup2By2Tx.toHex());


  const multisigInfo3 = await api.query.multisig.multisigs(bobDaveMultiAddress, approveOp1.method.hash);
  const timepoint5 = multisigInfo3.isSome ? multisigInfo3.unwrap().when : null;
  const approveOp3 = api.tx.multisig.asMulti(2, [bobDaoAddress], timepoint5, approveOp1.method.toHex(), true, weight3)
  const createMultigroup2By3Tx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(daveDaoId, approveOp3)
  ]);
  await createMultigroup2By3Tx.signAsync(dave);
  await sendTxAndWaitAsync(createMultigroup2By3Tx.toHex());
  await fundAddress(multigroup2DaoAddress, api);
  const multigroup2Dao = await getAccountAsync(multigroup2DaoId);
  logSuccess(`Multigroup-2 (Alice-Charlie, Bob-Dave) multisig DAO created: ${JSON.stringify(multigroup2Dao)}\n`)


  /**
   * Update Alice DAO actor
   */
  logInfo(`Updating Alice DAO ...`);
  const updateAliceDaoOp = api.tx.deipDao.onBehalf(aliceDaoId,
    api.tx.deipDao.updateDao(
      /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Updated Multigroup-2 multisig DAO" }), 256)
    )
  );
  const updateAliceDaoTx = api.tx.utility.batchAll([
    updateAliceDaoOp
  ]);
  debugger;
  await updateAliceDaoTx.signAsync(alice);
  await sendTxAndWaitAsync(updateAliceDaoTx.toHex());
  const updatedAliceDao = await getAccountAsync(aliceDaoId);
  logSuccess(`Alice DAO updated: ${JSON.stringify(updatedAliceDao)}\n`);


  /**
   * Create Project on behalf of Alice DAO actor
   */
  logInfo(`Creating Alice DAO Project ...`);
  const aliceDaoProjectId = randomAsHex(20);
  const createAliceDaoProjectOp = api.tx.deipDao.onBehalf(aliceDaoId,
    api.tx.deip.createProject(
      /* "is_private": */ false,
      /* "external_id": */ aliceDaoProjectId,
      /* "team_id": */ { Dao: aliceDaoId },
      /* "description": */ keccakAsHex(JSON.stringify({ "description": "Alice DAO Project" }), 256),
      /* "domains": */[getDefaultDomain()]
    )
  );

  const createAliceDaoProjectTx = api.tx.utility.batchAll([
    createAliceDaoProjectOp
  ]);
  debugger;
  await createAliceDaoProjectTx.signAsync(alice);
  await sendTxAndWaitAsync(createAliceDaoProjectTx.toHex());
  const aliceDaoProject = await getProjectAsync(aliceDaoProjectId);
  logSuccess(`Alice DAO Project created: ${JSON.stringify(aliceDaoProject)}\n`);


  /**
   * Update Alice DAO Project on behalf of Alice DAO actor
   */
  logInfo(`Updating Alice DAO Project ...`);
  const updateAliceDaoProjectOp = api.tx.deipDao.onBehalf(aliceDaoId,
    api.tx.deip.updateProject(
      /* "project_id": */ aliceDaoProjectId,
      /* "description": */ keccakAsHex(JSON.stringify({ "description": "Updated Alice DAO Project" }), 256),
      /* "is_private": */ null
    )
  );
  debugger;
  const updateAliceDaoProjectTx = api.tx.utility.batchAll([
    updateAliceDaoProjectOp
  ]);
  await updateAliceDaoProjectTx.signAsync(alice);
  await sendTxAndWaitAsync(updateAliceDaoProjectTx.toHex());
  const updatedAliceDaoProject = await getProjectAsync(aliceDaoProjectId);
  logSuccess(`Alice DAO Project updated: ${JSON.stringify(updatedAliceDaoProject)}\n`);


}


setup()
  .then((api) => {
    logInfo('\nRunning ...\n');
    return run(api);
  })
  .then(() => {
    logInfo('Successfully finished !');
    process.exit(0);
  })
  .catch((err) => {
    logError(err);
    process.exit(1);
  });
