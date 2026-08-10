import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import {root} from './lib.mjs';
import {loadCompanionContract} from './companion-contract.mjs';

export const QR_OPTIONS=Object.freeze({
  type:'png',
  errorCorrectionLevel:'M',
  margin:4,
  width:512,
  color:Object.freeze({dark:'#071923',light:'#FFFFFF'})
});

export async function renderCompanionQr(){
  const contract=loadCompanionContract();
  return QRCode.toBuffer(contract.COMPANION_HOME,QR_OPTIONS);
}

if(process.argv[1]===new URL(import.meta.url).pathname){
  fs.writeFileSync(path.join(root,'companion-qr.png'),await renderCompanionQr());
  console.log(`Generated companion-qr.png for ${loadCompanionContract().COMPANION_HOME}`);
}
