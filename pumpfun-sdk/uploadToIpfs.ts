
import fs from 'fs';
import { FleekSdk, PersonalAccessTokenService } from '@fleekxyz/sdk';
import dotenv from 'dotenv';
import { TokenConfig } from '../types';
dotenv.config();

const pat = process.env.PAT || '';
const project_id = process.env.PROJECT_ID || '';

const patService = new PersonalAccessTokenService({
  personalAccessToken: pat,
  projectId: project_id,
})

const fleekSdk = new FleekSdk({ accessTokenService: patService })

async function uploadFileToIPFS(filename: string, content: Buffer) {
  const result = await fleekSdk.ipfs().add({
    path: filename,
    content: content
  });
  return result;  
}

export const getUploadedMetadataURI = async (tokenConfig: TokenConfig): Promise<string> => {
  const fileContent = fs.readFileSync(tokenConfig.image);

  try {
    const imageUploadResult = await uploadFileToIPFS(tokenConfig.image, fileContent);
    console.log('Image uploaded to IPFS:', imageUploadResult);
    console.log('IPFS URL:', `https://cf-ipfs.com/ipfs/${imageUploadResult.cid}`);

    const data = {
      "name": tokenConfig.name,
      "symbol": tokenConfig.symbol,
      "description": tokenConfig.description,
      "image": `https://cf-ipfs.com/ipfs/${imageUploadResult.cid}`,
      "showName": tokenConfig.showName,
      "createdOn": tokenConfig.createdOn,
      "twitter": tokenConfig.twitter,
      "telegram": tokenConfig.telegram,
      "website": tokenConfig.website
    }
    const metadataString = JSON.stringify(data);
    const bufferContent = Buffer.from(metadataString, 'utf-8');

    const metadataUploadResult = await uploadFileToIPFS(tokenConfig.image, bufferContent);
    console.log('File uploaded to IPFS:', metadataUploadResult);
    console.log('IPFS URL:', `https://cf-ipfs.com/ipfs/${metadataUploadResult.cid}`)
    return `https://cf-ipfs.com/ipfs/${metadataUploadResult.cid}`;
  } catch (error) {
    return "";
  }
}