import 'module-alias/register';
import * as dotenv from "dotenv";

/**
 * deploy as:
 * controller must be set in scripts: #3, #5 
 * setTokenCreator must be set in script #3
 * issuanceModule must be set in scripts: #3, #4, #5
 * ComponentManageModule must be set in scripts: #3
 */

import DeployHelper from '../utils/deploys';
import { SetTokenCreator, Controller, BasicIssuanceModule, ComponentManageModule } from '../utils/contracts';
import { Account } from '../utils/types';
import { getAccounts } from '../utils/index';

let owner: Account;
let setTokenCreator: SetTokenCreator;
let controller: Controller;
let issuanceModule: BasicIssuanceModule;
let componentManageModule: ComponentManageModule;
let deployer: DeployHelper;

async function main(): Promise<any> {    
    [ owner ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    
    controller = await deployer.core.deployController(owner.address);
    await controller.deployed();
    console.log('\ncontroller=', controller.address);
    
    setTokenCreator = await deployer.core.deploySetTokenCreator(controller.address);
    await setTokenCreator.deployed();
    console.log('setTokenCreator=', setTokenCreator.address);
    
    issuanceModule  = await deployer.modules.deployBasicIssuanceModule(controller.address);
    await issuanceModule.deployed();
    console.log('issuanceModule=', issuanceModule.address);

    componentManageModule  = await deployer.modules.deployComponentManageModule(controller.address);
    await componentManageModule.deployed();
    console.log('componentManageModule=', componentManageModule.address);

    /**
     * modules initialization
     */
        
    await controller.initialize(
        [setTokenCreator.address], 
        [issuanceModule.address, componentManageModule.address], [], []);
    console.log('controller.initialize');

    /**
     * module can be added further
     * await controller.addModule(componentManageModule.address);    
     */

    return;
}
main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});