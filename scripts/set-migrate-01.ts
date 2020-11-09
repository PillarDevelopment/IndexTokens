import "module-alias/register";

/**
 * Creates list of tokens: addresses and values arrays, must be set in script #3 and #4
 */

import DeployHelper from "../utils/deploys";
import { StandardTokenMock } from "../utils/contracts";
import { Account } from "../utils/types";
import { getAccounts, ether } from "../utils/index";
import { BigNumber, BigNumberish } from "ethers/utils";

let owner: Account;
let deployer: DeployHelper;

async function main(): Promise<any> {

    [ owner ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
        
    let _componentsToken: StandardTokenMock[] = [];
    let _units: BigNumberish[] = [];

    {
        _componentsToken[0] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000), new BigNumber(6)));
        _units[0] = ether(1);
        await _componentsToken[0].deployed();
        _componentsToken[1] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000), new BigNumber(8)));
        _units[1] = ether(2);
        await _componentsToken[1].deployed();
        _componentsToken[2] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(10)));
        _units[2] = ether(3);
        await _componentsToken[2].deployed();
        _componentsToken[3] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[3] = ether(4);
        await _componentsToken[3].deployed();
        _componentsToken[4] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(23)));
        _units[4] = ether(5);
        await _componentsToken[4].deployed();
        _componentsToken[5] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000), new BigNumber(6)));
        _units[5] = ether(6);
        await _componentsToken[5].deployed();
        _componentsToken[6] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000), new BigNumber(8)));
        _units[6] = ether(7);
        await _componentsToken[6].deployed();
        _componentsToken[7] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[7] = ether(8);
        await _componentsToken[7].deployed();
        _componentsToken[8] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[8] = ether(9);
        await _componentsToken[8].deployed();
        _componentsToken[9] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[9] = ether(10);
        await _componentsToken[9].deployed();
        _componentsToken[10]= (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[10] = ether(11);
        await _componentsToken[10].deployed();
    }        
    
    console.log("\n");
    for (let index = 0; index < _componentsToken.length; index++) {
        console.log("'" + _componentsToken[index].address + ((index == _componentsToken.length - 1) ? "'" : "',"));
    }
    console.log("\n");

    for (let index = 0; index < _units.length; index++) {
        console.log("'" + _units[index].toString() + ((index == _units.length - 1) ? "'" : "',"));
    }

    console.log("\n");
}
main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});