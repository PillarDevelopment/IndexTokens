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
    
    '0x577d296678535e4903d59a4c929b718e1d575e0a',
    '0xe4319c0cd15fc7517fa8414a08b08b5f7bfc0794',
    '0xc778417e063141139fce010982780140aa0cd5ab '
];
const _units: BigNumberish[] = [
    '25000000000000000000',
    '25000000000000000000',
    '50000000000000000000'
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
        'Test WBTC_WETH Index',
        'wBTCwETHIndex',
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