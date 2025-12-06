/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { join } from 'path';
import { RecordsService } from '../records/records.service';

const jsonPath = join(
  process.cwd(),
  'src/modules/ethers/contracts',
  'FileStorage.json',
);
const contractJson = JSON.parse(readFileSync(jsonPath, 'utf-8'));

@Injectable()
export class EthersService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(
    private readonly configService: ConfigService,
    private readonly recordsService: RecordsService,
  ) {
    const rpcUrl = configService.getOrThrow<string>('RPC_URL');
    const privateKey = configService.getOrThrow<string>('WALLET_PRIVATE_KEY');
    const contractAddr =
      configService.getOrThrow<ethers.Contract>('CONTRACT_ADDRESS');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      contractAddr,
      contractJson.abi,
      this.wallet,
    );

    this.contract.on(
      'FileStored',
      async (fileId: bigint, fileHash: string, blockId: bigint, event) => {
        await this.recordsService.updateRecord(
          Number(fileId),
          fileHash,
          Number(blockId),
          Number(event.log.transactionHash),
        );

        console.log('FileStored event:');
        console.log('blockId:', blockId);
        console.log('txHash:', event.log.transactionHash);
        console.log('fileId:', fileId);
        console.log('fileHash:', fileHash);
      },
    );
  }
}
