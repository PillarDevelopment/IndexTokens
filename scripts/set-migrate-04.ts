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
    '0x61f0bb2271d491415390e2A902FA0eD5E5cd4E8B',
'0xbbb0a5Cc397c5f03348818e4181120abE41C6a87',
'0xe4B5A287b250B5B2efae95c2AacF7E841BA88073',
'0xBb4066a1da3e3F0b20c1C971A29d7298cbed719b',
'0x3AC7B98e643dbFD7D71B1D04e799A2bA505E584f',
'0x97906a83004e961FD4b28C1EB0193c0b1e972810',
'0xE13862A029FbAeD6278d3008C22856135c435940',
'0xF0f02Ed6857B541b6a7fc6d43B1C28548a1911fA',
'0xd6c53dc8F8F8B7778126D282C45A54B7a0Ef4797',
'0xd1807374B29cFF9E9925686A7289FbcB5341a55c',
'0xD43a4a7F3F930F6e6FC0844894cD3C26113538fF'

];
const _units: BigNumberish[] = [
    '1000000000000000000',
    '2000000000000000000',
    '3000000000000000000',
    '4000000000000000000',
    '5000000000000000000',
    '6000000000000000000',
    '7000000000000000000',
    '8000000000000000000',
    '9000000000000000000',
    '10000000000000000000',
    '11000000000000000000'
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