// SPDX-License-Identifier: MIT

pragma solidity 0.6.10;

import { ISetToken } from "./ISetToken.sol";

interface IComponentManageModule {
    function initialize( ISetToken _setToken) external;
    function lockSetToken( ISetToken _setToken ) external;
    function unlockSetToken( ISetToken _setToken ) external;
    function addToSetToken(ISetToken _setToken, address component, uint256 _quantity, address _from) external;
    function removeFromSetToken(ISetToken _setToken, address component, uint256 _quantity, address _to) external;
}