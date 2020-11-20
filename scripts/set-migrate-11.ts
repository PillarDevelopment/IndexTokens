import "module-alias/register";

import DeployHelper from "../utils/deploys";
import { SetTokenCreator, Controller, BasicIssuanceModule, SetToken, StandardTokenMock } from "../utils/contracts";
import { Account, Address } from "../utils/types";
import { getAccounts, ether, getProtocolUtils } from "../utils/index";
import { BigNumber, BigNumberish } from "ethers/utils";
import { SetTokenFactory } from "../typechain/SetTokenFactory";
import { ComponentManageModule } from "../typechain/ComponentManageModule";
import { Signer, constants } from "ethers";
const { ethers, upgrades } = require("@nomiclabs/buidler");

const { AddressZero } = constants;

const protocolUtils = getProtocolUtils();

let owner: Account;
let feeRecipient: Account;
let mockSetTokenFactory: Account;
let mockPriceOracle: Account;
let mockUser: Account;
let setTokenCreator: SetTokenCreator;
let controller: Controller;
let issuanceModule: BasicIssuanceModule;
let componentManageModule: ComponentManageModule;
let setToken: SetToken;
let deployer: DeployHelper;

const timeout = (ms: any) => {return new Promise(resolve => setTimeout(resolve, ms))};

async function main(): Promise<any> {
    //console.log(await protocolUtils.getCreatedSetTokenAddress("0x910d488c2b550463931b499368ce28dc857faf48b16daae4f7bdfde8530605f4"));

    [
        owner,
        feeRecipient,        
        mockSetTokenFactory,
        mockPriceOracle,
        mockUser,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    
    let _components: Address[] = [];
    let _componentsToken: StandardTokenMock[] = [];
    let _units: BigNumberish[] = [];

    {
        _componentsToken[0] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000), new BigNumber(6)));
        _units[0] = ether(1);
        await _componentsToken[0].deployed();
        console.log("deployed 0", _componentsToken[0].address);        
        _componentsToken[1] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000), new BigNumber(8)));
        _units[1] = ether(2);
        await _componentsToken[1].deployed();
        console.log("deployed 1", _componentsToken[1].address);
        _componentsToken[2] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(10)));
        _units[2] = ether(3);
        await _componentsToken[2].deployed();
        console.log("deployed 2", _componentsToken[2].address);
        _componentsToken[3] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[3] = ether(4);
        await _componentsToken[3].deployed();
        console.log("deployed 3", _componentsToken[3].address);
        _componentsToken[4] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(23)));
        _units[4] = ether(5);
        await _componentsToken[4].deployed();
        console.log("deployed 4", _componentsToken[4].address);
        _componentsToken[5] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000), new BigNumber(6)));
        _units[5] = ether(6);
        await _componentsToken[5].deployed();
        console.log("deployed 5", _componentsToken[5].address);
        _componentsToken[6] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000), new BigNumber(8)));
        _units[6] = ether(7);
        await _componentsToken[6].deployed();
        console.log("deployed 6", _componentsToken[6].address);
        _componentsToken[7] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[7] = ether(8);
        await _componentsToken[7].deployed();
        console.log("deployed 7", _componentsToken[7].address);
        _componentsToken[8] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[8] = ether(9);
        await _componentsToken[8].deployed();
        console.log("deployed 8", _componentsToken[8].address);
        _componentsToken[9] = (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[9] = ether(10);
        await _componentsToken[9].deployed();
        console.log("deployed 9", _componentsToken[9].address);
        _componentsToken[10]= (await deployer.mocks.deployTokenMock(owner.address, ether(10000),new BigNumber(18)));
        _units[10] = ether(11);
        await _componentsToken[10].deployed();
        console.log("deployed 10", _componentsToken[10].address);
    }
    // TODO: finish deploy script and why it stops 

    async function getBalances(_address: Address, _owner: String): Promise<any> {
        console.log(_owner, "balances =====================================================")
        for (let index = 0; index < _componentsToken.length; index++) {
            _components[index] = _componentsToken[index].address;
            console.log("Token " + index + " balance", (await _componentsToken[index].balanceOf(_address)).toString());
        }
    }

    /* const _massApprove = await ethers.getContractFactory("massApprove");    
    const mass = await _massApprove.deploy();
    await mass.deployed(); */

    /* const mass = await deployer.product.deployMassApprove();
    await mass.deployed(); */

    await getBalances(owner.address, "owner's");
        
    
    controller      = await deployer.core.deployController(owner.address);
    
    await controller.deployed();
    
    console.log("controller", controller.address);
    
    setTokenCreator = await deployer.core.deploySetTokenCreator(controller.address);
    
    await setTokenCreator.deployed();
    
    console.log("setTokenCreator", setTokenCreator.address);
    
    issuanceModule  = await deployer.modules.deployBasicIssuanceModule(controller.address);
    
    await issuanceModule.deployed();
    
    console.log("issuanceModule", issuanceModule.address);

    componentManageModule = await deployer.modules.deployComponentManageModule(controller.address);

    await componentManageModule.deployed();

    console.log("componentManageModule", componentManageModule.address);


    
    
    // make controller initialisation
    await controller.initialize(
        [setTokenCreator.address], 
        [issuanceModule.address], [], []);
    console.log("controller.initialize");

    await controller.addModule(componentManageModule.address);
    console.log("controller.addModule");

    
    const receipt = await setTokenCreator.create(
        _components,
        _units,
        [issuanceModule.address, componentManageModule.address],
        owner.address,
        "Set 11 value tokens",
        "Set11",
      );
      
    await timeout(900);
    console.log("setTokenCreator.create", "receipt.hash", receipt.hash);
    // wait for complete TX    
    await receipt.wait()
    //console.log("receipt.wait", await receipt.wait());
    
    const retrievedSetAddress = await protocolUtils.getCreatedSetTokenAddress(receipt.hash);
    console.log("retrievedSetAddress", retrievedSetAddress);
    
    
    setToken = await new SetTokenFactory(owner.wallet).attach(retrievedSetAddress);
    
    console.log(
    "owner address", owner.address,
    "\ncontroller adderss=", controller.address,
    "\nissuance adderss=", issuanceModule.address,
    "\nsettoken adderss=", retrievedSetAddress ,
    "\nsettoken islocked=", await setToken.getComponents(), 
    "\nissuanceModule isPendingModule=", await setToken.isPendingModule(issuanceModule.address),
    "\nissuanceModule isInitializedModule=", await setToken.isInitializedModule(issuanceModule.address),
    "\ncomponentManageModule isPendingModule=", await setToken.isPendingModule(componentManageModule.address),
    "\ncomponentManageModule isInitializedModule=", await setToken.isInitializedModule(componentManageModule.address)
    );
    
    console.log("Making approve");
    let tokens : string[] = [];
    let tokenValues : string[] = [];

    let index = 0;
    for await (const iterator of _componentsToken) {
        index++;
	    await timeout(1500);
        await iterator.approve(issuanceModule.address, ether(index));
        
        tokens.push(iterator.address);
        tokenValues.push(ether(index).toString());
        console.log("approve for", index);
    }

    console.log("tokens", tokens, "tokenValues", tokenValues);

    //console.log("approveList", await mass.approveList(tokens, tokenValues, issuanceModule.address));
    
    
    // setToken initialisation    
    await issuanceModule.initialize(retrievedSetAddress, AddressZero);
    console.log("issuanceModule initialised");

    // componentManageModule initialisation    
    await componentManageModule.initialize(retrievedSetAddress);
    console.log("componentManageModule initialised");

    await componentManageModule.lockSetToken(retrievedSetAddress);
    console.log("setToken locked?", await setToken.isLocked());
    await componentManageModule.unlockSetToken(retrievedSetAddress);
    console.log("setToken locked?", await setToken.isLocked());
    
    // issue the "Set Token"
    let issueTX = await issuanceModule.issue(
        setToken.address,
        ether(1),
        owner.address,
        {
            gasLimit: 750000
        }
        );
        
    await getBalances(owner.address, "owner's");
    let setTokenOwned = await setToken.balanceOf(owner.address)
    console.log("setToken balance", setTokenOwned.toString());


    await componentManageModule.lockSetToken(retrievedSetAddress);
    console.log("setToken locked?", await setToken.isLocked());

    await componentManageModule.removeFromSetToken(
        retrievedSetAddress, 
        _componentsToken[0].address,
        ether(0.5),
        mockUser.address);

    console.log("removed 0.5 of first component to mockUser",  
        " and his balance", await (await _componentsToken[0].balanceOf(mockUser.address)).toString(),
        "components count", await (await setToken.getComponents()).length);

    await componentManageModule.removeFromSetToken(
        retrievedSetAddress, 
        _componentsToken[1].address,
        ether(2),
        mockUser.address);

    console.log("removed all of second component to mockUser",
        " and his balance", await (await _componentsToken[1].balanceOf(mockUser.address)).toString(),
        "components count", await (await setToken.getComponents()).length);

    await componentManageModule.unlockSetToken(retrievedSetAddress);
    console.log("setToken locked?", await setToken.isLocked());

    await getBalances(owner.address, "owner's");
    await getBalances(retrievedSetAddress, "SetToken's");

    await _componentsToken[1].approve(componentManageModule.address, ether(1));

    await componentManageModule.addToSetToken(
        retrievedSetAddress, 
        _componentsToken[1].address,
        ether(1));    

    console.log("Added second component",
    " and his balance", await (await _componentsToken[1].balanceOf(owner.address)).toString(),
    "set token second component amount", (await setToken.getPositions())[1].unit.toString(),
    "components count", await (await setToken.getComponents()).length);    

    await getBalances(owner.address, "owner's");
    await getBalances(retrievedSetAddress, "SetToken's");

    await _componentsToken[1].approve(componentManageModule.address, ether(3));    

    await componentManageModule.addToSetToken(
        retrievedSetAddress, 
        _componentsToken[1].address,
        ether(3));

    console.log("Added 3 to second component",
    " and his balance", (await _componentsToken[1].balanceOf(owner.address)).toString(),
    "set token second component amount", (await setToken.getPositions())[1].unit.toString(),
    "components count", (await setToken.getComponents()).length);

    await getBalances(owner.address, "owner's");
    await getBalances(retrievedSetAddress, "SetToken's");
    
    // redeem the "Set Token"
    await setToken.approve(controller.address, setTokenOwned);    
    
    await issuanceModule.redeem(
        setToken.address,
        setTokenOwned,
        owner.address);

    
    setTokenOwned = await setToken.balanceOf(owner.address)
    console.log("setToken balance after redeem", setTokenOwned.toString());
    await getBalances(owner.address, "owner's");
    await getBalances(retrievedSetAddress, "SetToken's");

    return;
}
main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});