import store from '../store.js'
import SolidityContract from './SolidityContract';
import tokenUcd_artifacts from '../contractsBuild/TokenUcd.json' ;

export const TOKENUCD_CONNECT_REQUESTED = 'tokenUcd/TOKENUCD_CONNECT_REQUESTED'
export const TOKENUCD_CONNECTED= 'tokenUcd/TOKENUCD_CONNECTED'

export const TOKENUCD_REFRESH_REQUESTED = 'tokenUcd/TOKENUCD_REFRESH_REQUESTED'
export const TOKENUCD_REFRESHED= 'tokenUcd/TOKENUCD_REFRESHED'

const initialState = {
    contract: null,
    owner: '?',
    balance: '?',
    decimals: '?',
    decimalsDiv: '?',
    ucdBalance: '?',
    totalSupply: '?',
    loanManagerAddress: '?',
    isLoading: false  // TODO: this is not in use - need to refactored (see ethBase.isLoading + isConnected)
}

export default (state = initialState, action) => {
    switch (action.type) {
        case TOKENUCD_CONNECT_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case TOKENUCD_CONNECTED:
        return {
            ...state,
            isLoading: false,
            contract: action.contract
        }

        case TOKENUCD_REFRESH_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case TOKENUCD_REFRESHED:
        return {
            ...state,
            isLoading: false,
            owner: action.owner,
            decimals: action.decimals,
            decimalsDiv: action.decimalsDiv,
            ucdBalance: action.ucdBalance,
            balance: action.balance,
            totalSupply: action.totalSupply,
            loanManagerAddress: action.loanManagerAddress
        }

        default:
            return state
    }
}

export const connectTokenUcd =  () => {
    return async dispatch => {
        dispatch({
            type: TOKENUCD_CONNECT_REQUESTED
        })
        return dispatch({
            type: TOKENUCD_CONNECTED,
            contract: await SolidityContract.connectNew(
                store.getState().ethBase.web3Instance.currentProvider, tokenUcd_artifacts)
        })
    }
}

export const refreshTokenUcd =  () => {
    return async dispatch => {
        dispatch({
            type: TOKENUCD_REFRESH_REQUESTED
        })
        let tokenUcd = store.getState().tokenUcd.contract.instance;
        let web3 = store.getState().ethBase.web3Instance;
        var balance;
        // TODO: make these paralel
        let owner = await tokenUcd.owner();
        let totalSupply = await tokenUcd.totalSupply();
        let loanManagerAddress = await tokenUcd.loanManagerAddress();
        let decimals = (await tokenUcd.decimals()).toNumber();
        let decimalsDiv = 10**decimals;
        return web3.eth.getBalance(tokenUcd.address, function(error, bal) {
            balance = bal;
            return web3.eth.getBalance(tokenUcd.address, function(error, ucdBalance) {

                dispatch({
                    type: TOKENUCD_REFRESHED,
                    owner: owner,
                    decimals: decimals,
                    decimalsDiv: decimalsDiv,
                    ucdBalance: ucdBalance.toNumber() / decimalsDiv,
                    balance: web3.fromWei( balance.toNumber()),
                    totalSupply: totalSupply.toNumber(),
                    loanManagerAddress: loanManagerAddress
                });
            });
        });
    }
}
