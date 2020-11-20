import 'module-alias/register';

/**
 * create and initialize contract settoken, must be set in scripts #4, #5
 */

import { SetTokenCreator, Controller, BasicIssuanceModule, SetToken, StandardTokenMock, ComponentManageModule } from '../utils/contracts';
import { Account, Address } from '../utils/types';
import { getAccounts, getProtocolUtils } from '../utils/index';
import { BigNumberish } from 'ethers/utils';
import { SetTokenFactory } from '../typechain/SetTokenFactory';
import { StandardTokenMockFactory } from '../typechain/StandardTokenMockFactory';
import { ControllerFactory } from '../typechain/ControllerFactory';
import { SetTokenCreatorFactory } from '../typechain/SetTokenCreatorFactory';
import { BasicIssuanceModuleFactory } from '../typechain/BasicIssuanceModuleFactory';
import { ComponentManageModuleFactory } from '../typechain/ComponentManageModuleFactory';
import { constants } from 'ethers';

let owner: Account;
let setTokenCreator: SetTokenCreator;
let controller: Controller;
let issuanceModule: BasicIssuanceModule;
let setToken: SetToken;
let componentManageModule: ComponentManageModule;

const { AddressZero } = constants;
const protocolUtils = getProtocolUtils();

const controller_address = String(process.env.CONTROLLER);
const setTokenCreator_address = String(process.env.TOKENCREATOR);
const issuanceModule_address = String(process.env.ISSUANCEMODULE);
const componentManageModule_address = String(process.env.COMPONENTMANAGEMODULE);
const _components: Address[] = [
    '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    '0x3f392b2eac1772adbd02402c37658d6965db6839',
    '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    '0xb82a765bb22ba51ce8b9a4192786caba429e0d18',
    '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02'
];
const _units: BigNumberish[] = [
    '250000',
    '250000000000000000',
    '250000000000000000',
    '250000000000000000',
    '250000000000000000'
];

async function main(): Promise<any> {
    [ owner ] = await getAccounts();
    
    let _componentsToken: StandardTokenMock[] = [];    
    for (let index = 0; index < _components.length; index++) {
        _componentsToken[index] = StandardTokenMockFactory.connect( _components[index], owner.wallet);  }
    
    controller = await ControllerFactory.connect( controller_address, owner.wallet);
    console.log('\ncontroller=', controller.address);
    setTokenCreator = await SetTokenCreatorFactory.connect( setTokenCreator_address, owner.wallet);
    //console.log('setTokenCreator=', setTokenCreator.address);
    
    issuanceModule = BasicIssuanceModuleFactory.connect( issuanceModule_address, owner.wallet);
    await issuanceModule.deployed();
    console.log('issuanceModule=', issuanceModule.address);
    componentManageModule = ComponentManageModuleFactory.connect(componentManageModule_address, owner.wallet);
    await componentManageModule.deployed();
    console.log('componentManageModule=', componentManageModule.address);
    const receipt = await setTokenCreator.create(
        _components,
        _units,
        [issuanceModule.address, componentManageModule.address],
        owner.address,
        'Test Index Token1',
        'IndexToken1',
    );        
    //await timeout(120000);
    //console.log("setTokenCreator.create", "receipt.hash", receipt.hash);
    // wait for complete TX    
    await receipt.wait()
    //console.log("receipt.wait", await receipt.wait());
    const retrievedSetAddress = await protocolUtils.getCreatedSetTokenAddress(receipt.hash);
    setToken = await new SetTokenFactory(owner.wallet).attach(retrievedSetAddress);
    console.log(
        "\nsettoken adderss=", retrievedSetAddress ,
        "\nsettoken islocked=", await setToken.getComponents(), 
        "\nissuanceModule isPendingModule=", await setToken.isPendingModule(issuanceModule.address),
        "\nissuanceModule isInitializedModule=", await setToken.isInitializedModule(issuanceModule.address),
        "\ncomponentManageModule isPendingModule=", await setToken.isPendingModule(componentManageModule.address),
        "\ncomponentManageModule isInitializedModule=", await setToken.isInitializedModule(componentManageModule.address)
    );
    /***********************************************************************
     * setToken initialisations
     * 
     ***********************************************************************/ 
    await issuanceModule.initialize(retrievedSetAddress, AddressZero);
    console.log("issuanceModule initialised\n");
    
    await componentManageModule.initialize(retrievedSetAddress);
    console.log("componentManageModule initialised");
    
    return;
}
main().then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});

const timeout = (ms: any) => {return new Promise(resolve => setTimeout(resolve, ms))};