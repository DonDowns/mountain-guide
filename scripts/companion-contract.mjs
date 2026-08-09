import vm from 'node:vm';
import {read} from './lib.mjs';

export function loadCompanionContract(){
  const context=vm.createContext({URL});
  vm.runInContext(read('js/companion-contract.js'),context,{filename:'js/companion-contract.js'});
  return Object.freeze({...context.DDMG_COMPANION});
}
