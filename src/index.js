import config from './config';
import types from './types.json';
import { ApiPromise } from '@polkadot/api/promise';
import { HttpProvider } from '@polkadot/rpc-provider';
import { TypeRegistry } from '@polkadot/types/create';
import { Metadata } from '@polkadot/metadata';
import { logInfo, logSuccess, logError, logWarn } from './log';
import { getFaucetAccount, generateAccount, daoIdToAddress, getMultiAddress, getDefaultDomain } from './utils';
import { sendTxAndWaitAsync, getAccountAsync, getProjectAsync, getProposalAsync } from './rpc';
import { keccakAsHex, randomAsHex } from '@polkadot/util-crypto';



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
  logSuccess(`Alice DAO created: \n${JSON.stringify(aliceDao)}\n`);

  

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
  logSuccess(`Bob DAO created: \n${JSON.stringify(bobDao)}\n`)



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
  logSuccess(`Charlie DAO created: \n${JSON.stringify(charlieDao)}\n`)



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
  logSuccess(`Dave DAO created: \n${JSON.stringify(daveDao)}\n`)



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
  logSuccess(`Eve DAO created: \n${JSON.stringify(eveDao)}\n`)



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
  await createAliceBobDaoTx.signAsync(alice); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(createAliceBobDaoTx.toHex());
  await fundAddress(aliceBobDaoAddress, api);
  const aliceBobDao = await getAccountAsync(aliceBobDaoId);
  logSuccess(`Alice-Bob multisig DAO created: \n${JSON.stringify(aliceBobDao)}\n`)



  /**
   * Create Eve-Charlie multisig DAO actor with a threshold equal to 1 signature
   */
  logInfo(`Creating Eve-Charlie multisig DAO ...`);
  const eveCharlieDaoId = randomAsHex(20);
  const eveCharlieDaoAddress = daoIdToAddress(eveCharlieDaoId, api);
  const createEveCharlieDaoOp = api.tx.deipDao.create(
    /* ID */ eveCharlieDaoId,
    /* Authority */ {
      "signatories": [eveDaoAddress, charlieDaoAddress],
      "threshold": 1
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Eve-Charlie multisig DAO" }), 256)
  );

  const createEveCharlieDaoTx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(eveDaoId, api.tx.multisig.asMultiThreshold1([charlieDaoAddress], createEveCharlieDaoOp))
  ]);
  await createEveCharlieDaoTx.signAsync(eve); // 1st approval from Eve DAO (final)
  await sendTxAndWaitAsync(createEveCharlieDaoTx.toHex());
  await fundAddress(eveCharlieDaoAddress, api);
  const eveCharlieDao = await getAccountAsync(eveCharlieDaoId);
  logSuccess(`Alice-Eve multisig DAO created: \n${JSON.stringify(eveCharlieDao)}\n`)
 


  /**
   * Create Bob-Dave multisig DAO actor with a threshold equal to 2 signatures
   */
  logInfo(`Creating Bob-Dave multisig DAO ...`);
  const bobDaveDaoId = randomAsHex(20);
  const bobDaveDaoAddress = daoIdToAddress(bobDaveDaoId, api);
  const bobDaveMultiAddress = getMultiAddress([bobDaoAddress, daveDaoAddress], 2);
  const createBobDaveDaoOp = api.tx.deipDao.create(
    /* ID */ bobDaveDaoId,
    /* Authority */ {
      "signatories": [bobDaoAddress, daveDaoAddress],
      "threshold": 2
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Bob-Dave multisig DAO" }), 256)
  );
  const { weight } = await createBobDaveDaoOp.paymentInfo(bobDaveMultiAddress);
  const createBobDaveDaoByBobTx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(bobDaoId, api.tx.multisig.approveAsMulti(2, [daveDaoAddress], null, createBobDaveDaoOp.method.hash, weight))
  ]);
  await createBobDaveDaoByBobTx.signAsync(bob); // 1st approval from Bob DAO
  await sendTxAndWaitAsync(createBobDaveDaoByBobTx.toHex());
  const multisigInfo1 = await api.query.multisig.multisigs(bobDaveMultiAddress, createBobDaveDaoOp.method.hash);
  const timepoint = multisigInfo1.isSome ? multisigInfo1.unwrap().when : null;
  const createBobDaveDaoByDaveTx = api.tx.utility.batchAll([
    api.tx.deipDao.onBehalf(daveDaoId, api.tx.multisig.asMulti(2, [bobDaoAddress], timepoint, createBobDaveDaoOp.method.toHex(), true, weight))
  ]);
  await createBobDaveDaoByDaveTx.signAsync(dave); // 2nd approval from Dave DAO (final)
  await sendTxAndWaitAsync(createBobDaveDaoByDaveTx.toHex());
  await fundAddress(bobDaveDaoAddress, api);
  const bobDaveDao = await getAccountAsync(bobDaveDaoId);
  logSuccess(`Bob-Dave multisig DAO created: \n${JSON.stringify(bobDaveDao)}\n`)



  /**
   * Create Multigroup-1 (Eve-Charlie, Bob-Dave) multisig DAO actor with a threshold equal to 1 signature
   */
  logInfo(`Creating Multigroup-1 (Eve-Charlie, Bob-Dave) multisig DAO ...`);
  const multigroupDaoId = randomAsHex(20);
  const multigroupDaoAddress = daoIdToAddress(multigroupDaoId, api);
  const createMultigroupOp = api.tx.deipDao.create(
    /* ID */ multigroupDaoId,
    /* Authority */ {
      "signatories": [eveCharlieDaoAddress, bobDaveDaoAddress],
      "threshold": 1
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Multigroup-1 multisig DAO" }), 256)
  );

  const createMultigroupDaoByEveCharlieDaoOp = api.tx.deipDao.onBehalf(eveCharlieDaoId, api.tx.multisig.asMultiThreshold1([bobDaveDaoAddress], createMultigroupOp));
  const createMultigroupDaoByEveCharlieDaoByEveDaoOp = api.tx.deipDao.onBehalf(eveDaoId, api.tx.multisig.asMultiThreshold1([charlieDaoAddress], createMultigroupDaoByEveCharlieDaoOp));
  const createMultigroupDaoByEveCharlieDaoByEveDaoTx = api.tx.utility.batchAll([
    createMultigroupDaoByEveCharlieDaoByEveDaoOp
  ]);
  await createMultigroupDaoByEveCharlieDaoByEveDaoTx.signAsync(eve); // 1st approval from Eve DAO on behalf Eve-Charlie DAO (final)
  await sendTxAndWaitAsync(createMultigroupDaoByEveCharlieDaoByEveDaoTx.toHex());
  await fundAddress(multigroupDaoAddress, api);
  const multigroupDao = await getAccountAsync(multigroupDaoId);
  logSuccess(`Multigroup-1 (Eve-Charlie, Bob-Dave) multisig DAO created: \n${JSON.stringify(multigroupDao)}\n`)



  /**
   * Create Multigroup-2 (Eve-Charlie, Bob-Dave) multisig DAO actor with a threshold equal to 2 signatures
   */
  logInfo(`Creating Multigroup-2 (Eve-Charlie, Bob-Dave) multisig DAO ...`);
  const multigroup2DaoId = randomAsHex(20);
  const multigroup2DaoAddress = daoIdToAddress(multigroup2DaoId, api);
  const multigroup2MultiAddress = getMultiAddress([eveCharlieDaoAddress, bobDaveDaoAddress], 2);
  const createMultigroup2Op = api.tx.deipDao.create(
    /* ID */ multigroup2DaoId,
    /* Authority */ {
      "signatories": [eveCharlieDaoAddress, bobDaveDaoAddress],
      "threshold": 2
    },
    /* Metadata Hash */ keccakAsHex(JSON.stringify({ "description": "Multigroup-2 multisig DAO" }), 256)
  );

  const { weight: weight2 } = await createMultigroup2Op.paymentInfo(multigroup2MultiAddress);
  const createMultigroup2DaoByEveCharlieDaoOp = api.tx.deipDao.onBehalf(
    eveCharlieDaoId,
    api.tx.multisig.approveAsMulti(2, [bobDaveDaoAddress], null, createMultigroup2Op.method.hash, weight2)
  );
  const createMultigroup2DaoByEveCharlieDaoByEveDaoOp = api.tx.deipDao.onBehalf(eveDaoId, api.tx.multisig.asMultiThreshold1([charlieDaoAddress], createMultigroup2DaoByEveCharlieDaoOp));
  const createMultigroup2DaoByEveCharlieDaoByEveDaoTx = api.tx.utility.batchAll([
    createMultigroup2DaoByEveCharlieDaoByEveDaoOp
  ]);
  await createMultigroup2DaoByEveCharlieDaoByEveDaoTx.signAsync(eve); // 1st approval from Eve DAO on behalf Eve-Charlie DAO
  await sendTxAndWaitAsync(createMultigroup2DaoByEveCharlieDaoByEveDaoTx.toHex());


  const multisigInfo2 = await api.query.multisig.multisigs(multigroup2MultiAddress, createMultigroup2Op.method.hash);
  const timepoint2 = multisigInfo2.isSome ? multisigInfo2.unwrap().when : null;
  const createMultigroup2DaoByBobDaveDaoOp = api.tx.deipDao.onBehalf(
    bobDaveDaoId,
    api.tx.multisig.asMulti(2, [eveCharlieDaoAddress], timepoint2, createMultigroup2Op.method.toHex(), true, weight2)
  );
  const { weight: weight3 } = await createMultigroup2DaoByBobDaveDaoOp.paymentInfo(bobDaveDaoAddress);
  const createMultigroup2DaoByBobDaveDaoByBobDaoOp = api.tx.deipDao.onBehalf(bobDaoId, api.tx.multisig.approveAsMulti(2, [daveDaoAddress], null, createMultigroup2DaoByBobDaveDaoOp.method.hash, weight3));
  const createMultigroup2DaoByBobDaveDaoByBobDaoTx = api.tx.utility.batchAll([
    createMultigroup2DaoByBobDaveDaoByBobDaoOp
  ]);
  await createMultigroup2DaoByBobDaveDaoByBobDaoTx.signAsync(bob); // 2nd approval from Bob DAO on behalf Bob-Dave DAO
  await sendTxAndWaitAsync(createMultigroup2DaoByBobDaveDaoByBobDaoTx.toHex());


  const multisigInfo3 = await api.query.multisig.multisigs(bobDaveMultiAddress, createMultigroup2DaoByBobDaveDaoOp.method.hash);
  const timepoint5 = multisigInfo3.isSome ? multisigInfo3.unwrap().when : null;
  const createMultigroup2DaoByBobDaveDaoByDaveDaoOp = api.tx.deipDao.onBehalf(daveDaoId, api.tx.multisig.asMulti(2, [bobDaoAddress], timepoint5, createMultigroup2DaoByBobDaveDaoOp.method.toHex(), true, weight3));
  const createMultigroup2DaoByBobDaveDaoByDaveDaoTx = api.tx.utility.batchAll([
    createMultigroup2DaoByBobDaveDaoByDaveDaoOp
  ]);
  await createMultigroup2DaoByBobDaveDaoByDaveDaoTx.signAsync(dave); // 3rd approval from Dave DAO on behalf Bob-Dave DAO (final)
  await sendTxAndWaitAsync(createMultigroup2DaoByBobDaveDaoByDaveDaoTx.toHex());

  await fundAddress(multigroup2DaoAddress, api);
  const multigroup2Dao = await getAccountAsync(multigroup2DaoId);
  logSuccess(`Multigroup-2 (Eve-Charlie, Bob-Dave) multisig DAO created: \n${JSON.stringify(multigroup2Dao)}\n`)



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
  await updateAliceDaoTx.signAsync(alice); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(updateAliceDaoTx.toHex());
  const updatedAliceDao = await getAccountAsync(aliceDaoId);
  logSuccess(`Alice DAO updated: \n${JSON.stringify(updatedAliceDao)}\n`);

  

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
  await createAliceDaoProjectTx.signAsync(alice); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(createAliceDaoProjectTx.toHex());
  const aliceDaoProject = await getProjectAsync(aliceDaoProjectId);
  logSuccess(`Alice DAO Project created: \n${JSON.stringify(aliceDaoProject)}\n`);



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
  const updateAliceDaoProjectTx = api.tx.utility.batchAll([
    updateAliceDaoProjectOp
  ]);
  await updateAliceDaoProjectTx.signAsync(alice); // 1st approval from Alice DAO (final)
  await sendTxAndWaitAsync(updateAliceDaoProjectTx.toHex());
  const updatedAliceDaoProject = await getProjectAsync(aliceDaoProjectId);
  logSuccess(`Alice DAO Project updated: \n${JSON.stringify(updatedAliceDaoProject)}\n`);


  
  /**
   * Create Project on behalf of Multigroup-2 (Eve-Charlie, Bob-Dave) multisig DAO actor
   */
  logInfo(`Creating Multigroup-2 DAO Project ...`);
  const multigroup2ProjectId = randomAsHex(20);
  const createMultigroup2DaoProjectOp = api.tx.deipDao.onBehalf(multigroup2DaoId, api.tx.deip.createProject(
    /* "is_private": */ false,
    /* "external_id": */ multigroup2ProjectId,
    /* "team_id": */ { Dao: multigroup2DaoId },
    /* "description": */ keccakAsHex(JSON.stringify({ "description": "Alice DAO Project" }), 256),
    /* "domains": */[getDefaultDomain()]
  ));

  const { weight: weight5 } = await createMultigroup2DaoProjectOp.paymentInfo(multigroup2MultiAddress);
  const createMultigroup2DaoProjectByEveCharlieDaoOp = api.tx.deipDao.onBehalf(eveCharlieDaoId, api.tx.multisig.approveAsMulti(2, [bobDaveDaoAddress], null, createMultigroup2DaoProjectOp.method.hash, weight5));
  const createMultigroup2DaoProjectByEveCharlieDaoByEveDaoOp = api.tx.deipDao.onBehalf(eveDaoId, api.tx.multisig.asMultiThreshold1([charlieDaoAddress], createMultigroup2DaoProjectByEveCharlieDaoOp));
  const createMultigroup2DaoProjectByEveCharlieDaoByEveDaoTx = api.tx.utility.batchAll([
    createMultigroup2DaoProjectByEveCharlieDaoByEveDaoOp
  ]);
  await createMultigroup2DaoProjectByEveCharlieDaoByEveDaoTx.signAsync(eve); // 1st approval from Eve DAO on behalf Eve-Charlie DAO
  await sendTxAndWaitAsync(createMultigroup2DaoProjectByEveCharlieDaoByEveDaoTx.toHex());


  const info6 = await api.query.multisig.multisigs(multigroup2MultiAddress, createMultigroup2DaoProjectOp.method.hash);
  const timepoint6 = info6.isSome ? info6.unwrap().when : null;
  const createMultigroup2DaoProjectByBobDaveDaoOp = api.tx.deipDao.onBehalf(bobDaveDaoId, api.tx.multisig.asMulti(2, [eveCharlieDaoAddress], timepoint6, createMultigroup2DaoProjectOp.method.toHex(), true, weight5));
  const { weight: weight7 } = await createMultigroup2DaoProjectByBobDaveDaoOp.paymentInfo(bobDaveDaoAddress);
  const createMultigroup2DaoProjectByBobDaveDaoByBobDaoOp = api.tx.deipDao.onBehalf(bobDaoId, api.tx.multisig.approveAsMulti(2, [daveDaoAddress], null, createMultigroup2DaoProjectByBobDaveDaoOp.method.hash, weight7));
  const createMultigroup2DaoProjectByBobDaveDaoByBobDaoTx = api.tx.utility.batchAll([
    createMultigroup2DaoProjectByBobDaveDaoByBobDaoOp
  ]); 
  await createMultigroup2DaoProjectByBobDaveDaoByBobDaoTx.signAsync(bob); // 2nd approval from Bob DAO on behalf Bob-Dave DAO
  await sendTxAndWaitAsync(createMultigroup2DaoProjectByBobDaveDaoByBobDaoTx.toHex());


  const info7 = await api.query.multisig.multisigs(bobDaveMultiAddress, createMultigroup2DaoProjectByBobDaveDaoOp.method.hash);
  const timepoint7 = info7.isSome ? info7.unwrap().when : null;
  const createMultigroup2DaoProjectByBobDaveDaoByDaveDaoOp = api.tx.deipDao.onBehalf(daveDaoId, api.tx.multisig.asMulti(2, [bobDaoAddress], timepoint7, createMultigroup2DaoProjectByBobDaveDaoOp.method.toHex(), true, weight7));
  const createMultigroup2DaoProjectByBobDaveDaoByDaveDaoTx = api.tx.utility.batchAll([
    createMultigroup2DaoProjectByBobDaveDaoByDaveDaoOp
  ]);
  await createMultigroup2DaoProjectByBobDaveDaoByDaveDaoTx.signAsync(dave); // 3rd approval from Dave DAO on behalf Bob-Dave DAO (final)
  await sendTxAndWaitAsync(createMultigroup2DaoProjectByBobDaveDaoByDaveDaoTx.toHex());

  const multigroup2DaoProject = await getProjectAsync(multigroup2ProjectId);
  logSuccess(`Multigroup-2 DAO Project created: \n${JSON.stringify(multigroup2DaoProject)}\n`);



  /**
   * Create Proposal-1 on behalf Eve-Charlie multisig Dao actor 
   * to propose Alice-Bob multisig Dao actor and Bob-Dave multisig Dao actor 
   * to start new projects with initial funding from Charlie Dao actor and Multigroup-1 multisig DAO actor
   */
  logInfo(`Creating Eve-Charlie DAO Proposal ...`);
  const proposal1Id = randomAsHex(20);
  const aliceBobDaoProjectId = randomAsHex(20);
  const bobDaveDaoProjectId = randomAsHex(20);

  const createproposal1Op = api.tx.deipDao.onBehalf(eveCharlieDaoId,
    api.tx.deipProposal.propose(
      [{
        call: api.tx.deip.createProject(
          /* "is_private": */ false,
          /* "external_id": */ aliceBobDaoProjectId,
          /* "team_id": */ { Dao: aliceBobDaoId },
          /* "description": */ keccakAsHex(JSON.stringify({ "description": "Alice DAO Project" }), 256),
          /* "domains": */[getDefaultDomain()]
        ),
        account: { Dao: aliceBobDaoId }
      },
      {
        call: api.tx.deip.createProject(
          /* "is_private": */ false,
          /* "external_id": */ bobDaveDaoProjectId,
          /* "team_id": */ { Dao: bobDaveDaoId },
          /* "description": */ keccakAsHex(JSON.stringify({ "description": "Alice DAO Project" }), 256),
          /* "domains": */[getDefaultDomain()]
        ),
        account: { Dao: bobDaveDaoId }
      },
      {
        call: api.tx.balances.transfer(
          /* "to": */ bobDaveDaoAddress,
          /* "amount": */ 1000000000
        ),
        account: { Dao: charlieDaoId }
      },
      {
        call: api.tx.balances.transfer(
          /* "to": */ aliceBobDaoAddress,
          /* "amount": */ 1000000000
        ),
        account: { Dao: multigroupDaoId }
      }],
      proposal1Id
    ));

  const createproposal1ByEveDaoOp = api.tx.deipDao.onBehalf(eveDaoId,
    api.tx.multisig.asMultiThreshold1([charlieDaoAddress], createproposal1Op)
  );
  const createproposal1ByEveDaoTx = api.tx.utility.batchAll([
    createproposal1ByEveDaoOp
  ]);
  await createproposal1ByEveDaoTx.signAsync(eve);
  await sendTxAndWaitAsync(createproposal1ByEveDaoTx.toHex());
  const proposal1 = await getProposalAsync(proposal1Id);
  logSuccess(`Eve-Charlie DAO Proposal created: \n${JSON.stringify(proposal1)}\n`);



  /**
   * Approve Proposal-1 created by Eve-Charlie multisig Dao actor on behalf all required actors: 
   * Alice-Bob multisig Dao actor
   * Bob-Dave multisig Dao actor
   * Charlie Dao actor
   * Multigroup-1 multisig Dao actor
   */

  // Alice-Bob multisig Dao approves Proposal-1
  const decideOnProposal1ByAliceBobDaoOp = api.tx.deipDao.onBehalf(aliceBobDaoId,
    api.tx.deipProposal.decide(proposal1Id, 'Approve')
  );
  const decideOnProposal1ByAliceBobDaoByAliceDaoOp = api.tx.deipDao.onBehalf(aliceDaoId,
    api.tx.multisig.asMultiThreshold1([bobDaoAddress], decideOnProposal1ByAliceBobDaoOp)
  );
  const decideOnProposal1ByAliceBobDaoByAliceDaoTx = api.tx.utility.batchAll([
    decideOnProposal1ByAliceBobDaoByAliceDaoOp
  ]);
  await decideOnProposal1ByAliceBobDaoByAliceDaoTx.signAsync(alice);
  await sendTxAndWaitAsync(decideOnProposal1ByAliceBobDaoByAliceDaoTx.toHex());


  // Bob-Dave multisig Dao approves Proposal-1
  const decideOnProposal1ByBobDaveDaoOp = api.tx.deipDao.onBehalf(bobDaveDaoId,
    api.tx.deipProposal.decide(proposal1Id, 'Approve')
  );
  const { weight: weight9 } = await decideOnProposal1ByBobDaveDaoOp.paymentInfo(bobDaveMultiAddress);
  const decideOnProposal1ByBobDaveDaoByBobDaoOp = api.tx.deipDao.onBehalf(bobDaoId, api.tx.multisig.approveAsMulti(2, [daveDaoAddress], null, decideOnProposal1ByBobDaveDaoOp.method.hash, weight9));
  const decideOnProposal1ByBobDaveDaoByBobDaoTx = api.tx.utility.batchAll([
    decideOnProposal1ByBobDaveDaoByBobDaoOp
  ]);
  await decideOnProposal1ByBobDaveDaoByBobDaoTx.signAsync(bob);
  await sendTxAndWaitAsync(decideOnProposal1ByBobDaveDaoByBobDaoTx.toHex());

  const info9 = await api.query.multisig.multisigs(bobDaveMultiAddress, decideOnProposal1ByBobDaveDaoOp.method.hash);
  const timepoint9 = info9.isSome ? info9.unwrap().when : null;
  const decideOnProposal1ByBobDaveDaoByDaveDaoOp = api.tx.deipDao.onBehalf(daveDaoId, api.tx.multisig.asMulti(2, [bobDaoAddress], timepoint9, decideOnProposal1ByBobDaveDaoOp.method.toHex(), true, weight9));
  const decideOnProposal1ByBobDaveDaoByDaveDaoTx = api.tx.utility.batchAll([
    decideOnProposal1ByBobDaveDaoByDaveDaoOp
  ]);
  await decideOnProposal1ByBobDaveDaoByDaveDaoTx.signAsync(dave);
  await sendTxAndWaitAsync(decideOnProposal1ByBobDaveDaoByDaveDaoTx.toHex());


  // Charlie Dao approves Proposal-1
  const decideOnProposal1ByCharlieDaoOp = api.tx.deipDao.onBehalf(charlieDaoId,
    api.tx.deipProposal.decide(proposal1Id, 'Approve')
  );
  const decideOnProposal1ByCharlieDaoTx = api.tx.utility.batchAll([
    decideOnProposal1ByCharlieDaoOp
  ]);
  await decideOnProposal1ByCharlieDaoTx.signAsync(charlie);
  await sendTxAndWaitAsync(decideOnProposal1ByCharlieDaoTx.toHex());


  // Multigroup-1 multisig Dao approves Proposal-1
  const decideOnProposal1ByMultigroupDaoOp = api.tx.deipDao.onBehalf(multigroupDaoId,
    api.tx.deipProposal.decide(proposal1Id, 'Approve')
  );
  const decideOnProposal1ByMultigroupDaoByEveCharlieDaoOp = api.tx.deipDao.onBehalf(eveCharlieDaoId,
    api.tx.multisig.asMultiThreshold1([bobDaveDaoAddress], decideOnProposal1ByMultigroupDaoOp)
  );
  const decideOnProposal1ByMultigroupDaoByEveCharlieDaoByEveDaoOp = api.tx.deipDao.onBehalf(eveDaoId,
    api.tx.multisig.asMultiThreshold1([charlieDaoAddress], decideOnProposal1ByMultigroupDaoByEveCharlieDaoOp)
  );
  const decideOnProposal1ByMultigroupDaoByEveCharlieDaoByEveDaoTx = api.tx.utility.batchAll([
    decideOnProposal1ByMultigroupDaoByEveCharlieDaoByEveDaoOp
  ]);
  await decideOnProposal1ByMultigroupDaoByEveCharlieDaoByEveDaoTx.signAsync(eve);
  await sendTxAndWaitAsync(decideOnProposal1ByMultigroupDaoByEveCharlieDaoByEveDaoTx.toHex());

  const aliceBobDaoProject = await getProjectAsync(aliceBobDaoProjectId);
  const bobDaveDaoProject = await getProjectAsync(bobDaveDaoProjectId);
  logSuccess(`Eve-Charlie DAO Proposal resolved, new projects created: \n${JSON.stringify(aliceBobDaoProject)}\n${JSON.stringify(bobDaveDaoProject)}\n`);

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
