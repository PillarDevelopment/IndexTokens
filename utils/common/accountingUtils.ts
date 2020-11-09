import {
  getWaffleExpect,
  preciseMul,
} from "../../utils/index";
import { Account } from "../../utils/types";
import { SetToken } from "../../utils/contracts";
import { Erc20Factory } from "../../typechain/Erc20Factory";


export async function reconcileBalances(setToken: SetToken, subject: any, signer: Account): Promise<void> {
  const expect = getWaffleExpect();

  await subject();

  const currentSetTokenSupply = await setToken.totalSupply();
  const components = await setToken.getComponents();
  for (let i = 0; i < components.length; i++) {
    const component = Erc20Factory.connect(components[i], signer.wallet);
    const defaultPositionUnit = await setToken.getDefaultPositionRealUnit(component.address);

    const expectedBalance = preciseMul(defaultPositionUnit, currentSetTokenSupply);
    const actualBalance = await component.balanceOf(setToken.address);

    expect(actualBalance).to.be.gte(expectedBalance);
  }
}