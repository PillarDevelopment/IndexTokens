import 'module-alias/register';

/**
 * Locks component tokens and issues SetToken tokens
 * 
 */

import { BasicIssuanceModule, SetToken, StandardTokenMock } from '../utils/contracts';
import { Account, Address } from '../utils/types';
import { getAccounts, ether } from '../utils/index';
import { BigNumberish } from 'ethers/utils';
import { SetTokenFactory } from '../typechain/SetTokenFactory';
import { StandardTokenMockFactory } from '../typechain/StandardTokenMockFactory';
import { BasicIssuanceModuleFactory } from '../typechain/BasicIssuanceModuleFactory';

let owner: Account;
let issuanceModule: BasicIssuanceModule;
let setToken: SetToken;

const issuanceModule_address = String(process.env.ISSUANCEMODULE);
const SetToken_address = String(process.env.SETTOKEN);
const _components: Address[] = [

    '0x577d296678535e4903d59a4c929b718e1d575e0a',
    '0xe4319c0cd15fc7517fa8414a08b08b5f7bfc0794',
    '0xc778417e063141139fce010982780140aa0cd5ab '
];
const _units: BigNumberish[] = [
    '25000000000000000000',
    '25000000000000000000',
    '5000000000000000000'
];

async function main(): Promise<any> {
    [ owner ] = await getAccounts();
    
    let _componentsToken: StandardTokenMock[] = [];
    
    for (let index = 0; index < _components.length; index++) {
        _componentsToken[index] = StandardTokenMockFactory.connect( _components[index], owner.wallet); }
    
    issuanceModule = BasicIssuanceModuleFactory.connect( issuanceModule_address, owner.wallet);
    await issuanceModule.deployed();
    console.log("\nissuanceModule=", issuanceModule.address);
    
    console.log("SetToken address", SetToken_address);
    setToken = await new SetTokenFactory(owner.wallet).attach(SetToken_address);
    
    console.log("Making approve");
    let tokens : string[] = [];
    let tokenValues : string[] = [];
    
    let index = 0;
    for await (const iterator of _componentsToken) {        
        await timeout(15000);
        await iterator.approve(issuanceModule.address, _units[index]);
        
        tokens.push(iterator.address);
        tokenValues.push(_units[index].toString());
        console.log("approve for", index);
        index++;
    }
    
    console.log("tokens", tokens, "tokenValues", tokenValues);
    
    await timeout(15000);
    
    await issuanceModule.issue(
        setToken.address,
        ether(1),
        owner.address,
        {
            gasLimit: 750000
        }
    );
    
    await timeout(15000);
    console.log("setToken balance", (await setToken.balanceOf(owner.address)).toString());
    
    return;
}
main().then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});

const timeout = (ms: any) => {return new Promise(resolve => setTimeout(resolve, ms))};