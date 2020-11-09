// SPDX-License-Identifier: MIT

pragma solidity 0.6.10;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/SafeCast.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";

import { IController } from "../../interfaces/IController.sol";
//import { IManagerIssuanceHook } from "../../interfaces/IManagerIssuanceHook.sol";
//import { Invoke } from "../lib/Invoke.sol";
import { ISetToken } from "../../interfaces/ISetToken.sol";
import { ModuleBase } from "../lib/ModuleBase.sol";
//import { Position } from "../lib/Position.sol";
//import { PreciseUnitMath } from "../../lib/PreciseUnitMath.sol";

/**
 * @title ComponentManageModule
 * @author Maksim Kiselev
 * Module adds, removes component tokens
 */

contract ComponentManageModule is ModuleBase, ReentrancyGuard {

    /**
     * Throws if SetToken is locked and called by any account other than the locker.
     */
    modifier whenLockedOnlyManager(ISetToken _setToken) {
        if (_setToken.isLocked()) {
            require(msg.sender == _setToken.manager(), "When locked, only the locker can call");
        }
        _;
    }
/* ============ Events ============ */
/* ============ Structs ============ */
/* ============ State Variables ============ */
/* ============ Constants ============ */
/* ============ Constructor ============ */
    /**
    * Set state controller state variable
    *
    * @param _controller             Address of controller contract
    */
    constructor(IController _controller) public ModuleBase(_controller) {}
    /* ============ External Functions ============ */
    /**
    * Initializes this module to the SetToken with issuance-related hooks. Only callable by the SetToken's manager.
    * Hook addresses are optional. Address(0) means that no hook will be called
    *
    * @param _setToken             Instance of the SetToken to issue
    */
    function initialize(
        ISetToken _setToken
    )
        external
        onlySetManager(_setToken, msg.sender)
        onlyValidAndPendingSet(_setToken)
    {
        _setToken.initializeModule();
    }

    function removeModule() external override {}

    function lockSetToken(
        ISetToken _setToken
    ) 
        external
        nonReentrant
        onlyManagerAndValidSet(_setToken)
        onlyValidAndInitializedSet(_setToken)
    {
        _setToken.lock();
    }

    function unlockSetToken(
        ISetToken _setToken
    ) 
        external
        nonReentrant
        onlyManagerAndValidSet(_setToken)
        onlyValidAndInitializedSet(_setToken)
    {
        _setToken.unlock();
    }

    /** Remove component from the SetToken, partially or total
    *  @param _setToken     settoken implementation
    *  @param component     token component address
    *  @param _quantity     remove value
    *  @param _to           send removed component to reciever _to
    */

    function removeFromSetToken(
        ISetToken _setToken,
        address component,
        uint256 _quantity,
        address _to
    ) 
        external
        onlyValidAndInitializedSet(_setToken)
        whenLockedOnlyManager(_setToken)
    {    
        require(_setToken.isComponent( component ), "Only component token can be removed");
        require(_setToken.getTotalComponentRealUnits( component ) >= int256(_quantity), "Remove: not sufficient amount");

        if (_setToken.getTotalComponentRealUnits( component ) == int256(_quantity)) {
            _setToken.removeComponent( component );
        } else {
            _setToken.editDefaultPositionUnit(component, int256(_quantity));
        }

        // Instruct the SetToken to transfer the component to the user
        _setToken.strictInvokeTransfer(
            component,
            _to,
            _quantity
        );
    }

    /** Add component to the SetToken, partially or total
    *  @param _setToken     settoken implementation
    *  @param component     token component address
    *  @param _quantity     adding value
    */

    function addToSetToken(
        ISetToken _setToken,
        address component,
        uint256 _quantity
    ) 
        external
        onlyValidAndInitializedSet(_setToken)
        whenLockedOnlyManager(_setToken)
    {
        require(_quantity > 0, "Add component quantity must be > 0");

        // Transfer the component to the SetToken
        transferFrom(
            IERC20(component),
            msg.sender,
            address(_setToken),
            _quantity
        );

        _setToken.addComponent(component);
        _setToken.editDefaultPositionUnit(component, int256(_quantity));        
    }
    
/* ============ External Getter Functions ============ */
/* ============ Internal Functions ============ */
}