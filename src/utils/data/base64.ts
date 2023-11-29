import { Buffer } from "buffer";

// Base64 decode/encode logic from: https://stackoverflow.com/a/61155795
export const base64 = {
    decode: (str: string): string => {
        // Base64 validation from: https://stackoverflow.com/a/35002237
        const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        if (!base64regex.test(str)) throw Error("Input is not base64")
        return Buffer.from(str, 'base64').toString('binary')
    },
    encode: (str: string): string => Buffer.from(str, 'binary').toString('base64')
}

export default base64;