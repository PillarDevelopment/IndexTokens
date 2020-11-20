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