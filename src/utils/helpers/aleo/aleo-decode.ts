import base58 from 'bs58';
import BigInteger from 'big-integer';
import * as crypto from 'crypto';


export function stringToBase58(str) {
    const buffer = Buffer.from(str, 'utf8');
    return  base58.encode(buffer);
  }
  export function base58ToInteger(base58String: string) {
    const decodedBytes = base58.decode(base58String);
    const hexString = Buffer.from(decodedBytes).toString('hex');
    const bigInteger = BigInteger(hexString, 16);
    return bigInteger.toString();
  }

 export  function integerToBase58(integerValueStr: string): string {
    let integerValue = BigInt(integerValueStr??"");
    const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const base = BigInt(base58Alphabet.length);
    let result = '';
  
    while (integerValue > 0n) {
      const remainder = integerValue % base;
      const quotient = integerValue / base;
      integerValue = quotient;
      result = base58Alphabet[Number(remainder)] + result;
    }
  
    return result;
  }

  export function base58ToAscii(base58String: string): string {
    const bytes = base58.decode(base58String);
    let asciiString = '';
  
    for (let i = 0; i < bytes.length; i++) {
      asciiString += String.fromCharCode(bytes[i]);
    }
  
    return asciiString;
  }

  export const ToDecodeBase58=(x:any[])=>{
    console.log(integerToBase58(x[1]));
    console.log(base58ToAscii(integerToBase58(x[1])));
    
    return x.map(t=>base58ToAscii(integerToBase58(t)))
  }
  export const ToEncode=(x:any[])=>{
    console.log(stringToBase58(x[1]));
    console.log(base58ToInteger(stringToBase58(x[1])));
    
    return x.map(t=>base58ToInteger(stringToBase58(t)))
  }

  export function splitAndAddField(str:string, field:string, c:number=5) {
    const chunkSize = Math.ceil(str.length / c);
    const chunks = [];
  
    for (let i = 0; i < str.length; i += chunkSize) {
      const chunk = "1" + str.slice(i, i + chunkSize) + field;
      chunks.push(chunk);
    }
  
    return chunks;
  }