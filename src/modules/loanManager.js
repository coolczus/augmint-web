import store from '../store.js'
import SolidityContract from './SolidityContract';
import loanManager_artifacts from '../contractsBuild/LoanManager.json' ;

export const LOANMANAGER_CONNECT_REQUESTED = 'loanManager/LOANMANAGER_CONNECT_REQUESTED'
export const LOANMANAGER_CONNECTED= 'loanManager/LOANMANAGER_CONNECTED'

export const LOANMANAGER_REFRESH_REQUESTED = 'loanManager/LOANMANAGER_REFRESH_REQUESTED'
export const LOANMANAGER_REFRESHED= 'loanManager/LOANMANAGER_REFRESHED'

const initialState = {
    contract: null,
    balance: '?',
    owner: '?',
    ratesAddress: '?',
    tokenUcdAddress: '?',
    loanCount: '?',
    productCount: '?',
    products: [],
    isLoading: false  // TODO: this is not in use - need to refactored (see ethBase.isLoading + isConnected)
}

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANMANAGER_CONNECT_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case LOANMANAGER_CONNECTED:
        return {
            ...state,
            isLoading: false,
            contract: action.contract
        }

        case LOANMANAGER_REFRESH_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case LOANMANAGER_REFRESHED:
        return {
            ...state,
            isLoading: false,
            owner: action.owner,
            balance: action.balance,
            loanCount: action.loanCount,
            productCount: action.productCount,
            products: action.products,
            ratesAddress: action.ratesAddress,
            tokenUcdAddress: action.tokenUcdAddress
        }

        default:
            return state
    }
}

export const connectloanManager =  () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_CONNECT_REQUESTED
        })
        return dispatch({
            type: LOANMANAGER_CONNECTED,
            contract: await SolidityContract.connectNew(
                store.getState().ethBase.web3Instance.currentProvider, loanManager_artifacts)
        })
    }
}

export const refreshLoanManager =  () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_REFRESH_REQUESTED
        })
        let loanManager = store.getState().loanManager.contract.instance;
        let web3 = store.getState().ethBase.web3Instance;
        // TODO: make calls paralel
        let loanCount = await loanManager.getLoanCount();
        let productCount = await loanManager.getProductCount();
        let products = [];
        for (let i=0; i < productCount; i++) {
            let p = await loanManager.products(i);
            let prod = {
                term: p[0].toNumber(),
                discountRate: p[1].toNumber() / 1000000,
                loanCoverageRatio: p[2].toNumber() / 1000000,
                minLoanAmountInUcd: p[3].toNumber(),
                repayPeriod: p[4].toNumber(),
                minDisbursedAmountInUcd: p[3].toNumber() / decimalsDiv,
                isActive: p[5]
            }
            products.push(prod);
        }
        let tokenUcdAddress = await loanManager.tokenUcd();
        let ratesAddress = await loanManager.rates();
        let owner = await loanManager.owner();

        return web3.eth.getBalance(loanManager.address, function(error, balance) {
            dispatch({
                type: LOANMANAGER_REFRESHED,
                owner: owner,
                balance: web3.fromWei( balance.toNumber()),
                loanCount: loanCount.toNumber(),
                products: products,
                productCount: productCount.toNumber(),
                tokenUcdAddress: tokenUcdAddress,
                ratesAddress: ratesAddress
            });
        });
    }
}