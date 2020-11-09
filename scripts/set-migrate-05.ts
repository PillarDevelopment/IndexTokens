import 'module-alias/register';

/**
 * Redeems SetToken tokens and transfer back component tokens
 */

import { Controller, BasicIssuanceModule, SetToken } from '../utils/contracts';
import { Account } from '../utils/types';
import { getAccounts } from '../utils/index';
import { SetTokenFactory } from '../typechain/SetTokenFactory';
import { ControllerFactory } from '../typechain/ControllerFactory';
import { BasicIssuanceModuleFactory } from '../typechain/BasicIssuanceModuleFactory';

let owner: Account;
let controller: Controller;
let issuanceModule: BasicIssuanceModule;
let setToken: SetToken;

const controller_address = String(process.env.CONTROLLER);
const issuanceModule_address = String(process.env.ISSUANCEMODULE);
const SetToken_address = String(process.env.SETTOKEN);
const setTokentoRedeem = '1000000000000000000';

async function main(): Promise<any> {
    [ owner ] = await getAccounts();    

    controller = await ControllerFactory.connect( controller_address, owner.wallet);
    console.log("\ncontroller=", controller.address);
    
    issuanceModule = BasicIssuanceModuleFactory.connect( issuanceModule_address, owner.wallet);
    await issuanceModule.deployed();
    console.log('issuanceModule=', issuanceModule.address);    
        
    setToken = await new SetTokenFactory(owner.wallet).attach(SetToken_address);    
    console.log('SetToken address', SetToken_address);
    console.log('setToken balance before redeem', (await setToken.balanceOf(owner.address)).toString(), '\n');
        
    await setToken.approve(controller.address, setTokentoRedeem);
    
    await issuanceModule.redeem(
        setToken.address,
        setTokentoRedeem,
        owner.address
    );
        
    await timeout(15000);
    console.log('setToken balance after redeem', (await setToken.balanceOf(owner.address)).toString(), '\n');

    return;
}
main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});
const timeout = (ms: any) => {return new Promise(resolve => setTimeout(resolve, ms))};