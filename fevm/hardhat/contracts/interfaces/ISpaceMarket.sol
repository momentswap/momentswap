// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct Item {
        address spaceFnsContract;
        uint64 spaceId;
        uint64 price;
        bool selling;
}

interface ISpaceMarket {
    /**
     * @dev 上架域名事件
     * 当用户在上架域名时释放,传参为 卖家钱包地址，域名合约地址，spaceid，价格
     */ 
    event List(
        address indexed seller,
        address indexed nftAddr,
        uint64 indexed spaceId,
        uint64 price
    );

    /**
     * @dev 用户租用域名事件
     * 当用户在租用域名时释放,传参为 买家钱包地址，域名合约地址，spaceid，价格
     */ 
    event Rent(
        address indexed buyer,
        address indexed nftAddr,
        uint64 indexed spaceId,
        uint64 price
    );

    /**
     * @dev 撤单事件
     * 当用户在撤单时释放,传参为 卖家钱包地址，域名合约地址，spaceid
     */ 
    event Revoke(
        address indexed seller,
        address indexed nftAddr,
        uint64 indexed spaceId
    );

    /**
     * @dev 修改价格事件
     * 当用户在修改价格时释放,传参为 卖家钱包地址，域名合约地址，spaceid
     */ 
    event Update(
        address indexed seller,
        address indexed nftAddr,
        uint64 indexed spaceId,
        uint64 newPrice
    );

    /**
     * @dev 用户赎回租金事件
     * 当用户在回租时释放
     */ 
    event WithdrawRent(
        address to,
        uint64 amount
    );
    

    /**
     * @dev 设置受益人
     */
    function setBeneficiary(address beneficiary) external;
    
    /**
     * @dev 查看受益人
     */
    function getBeneficiary() external pure returns (address);

    /**
     * @dev 设置手续费率
     */
    function setFeeRate(uint64 feeRate) external;
    
    /**
     * @dev 查看手续费率
     */
    function getFeeRate() external pure returns (uint64);

    /**
     * @dev 上架 ， 释放 List 事件
     */
    function listSpace(address nftAddr, uint64 spaceId, uint64 price) external ;

    /**
     * @dev 租域名 成交， 释放 Rent 事件
     */
    function rentSpace(address nftAddr, uint64 spaceId) external ;

    /**
     * @dev 取消上架，释放 Revoke 事件
     */
    function cancelListSpace(address nftAddr, uint64 spaceId) external ;

    /**
     * @dev 更新价格，释放 Update 事件
     */
    function updateListedSpace(address nftAddr, uint64 spaceId, uint64 newPrice) external ;

    /**
     * @dev 管理员赎回手续费
     */
    function withdrawTransactionFee() external;

    /**
     * @dev 用户赎回域名租金, 释放 WithdrawRent 事件
     */
    function withdrawRentalIncome() external;
}