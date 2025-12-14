/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, solidityPacked } from 'ethers';
import { readFileSync } from 'fs';
import { join } from 'path';
import { RecordsService } from '../records/records.service';
import { HttpExceptionWrapper } from 'src/helpers/wrapper';
import { ERROR_MESSAGES } from 'src/constants/error-messages';

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
    @Inject(forwardRef(() => RecordsService))
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
      async (
        fileId: bigint,
        fileHash: string,
        fileSignature: string,
        blockId: bigint,
        event,
      ) => {
        const isValid = this.verifyPayload(fileHash, fileSignature);
        if (!isValid) {
          throw new HttpExceptionWrapper(ERROR_MESSAGES.RECORD_MODIFIED);
        }

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

  hashPayload(
    hospitalIdentifier: number,
    patientIdentifier: number,
    record: Buffer,
  ): string {
    const packed = solidityPacked(
      ['uint256', 'uint256', 'bytes'],
      [hospitalIdentifier, patientIdentifier, `0x${record.toString('hex')}`],
    );
    return ethers.keccak256(packed);
  }

  async signPayload(hash: string): Promise<string> {
    return await this.wallet.signMessage(ethers.getBytes(hash));
  }

  verifyPayload(hash: string, signature: string) {
    try {
      ethers.verifyMessage(ethers.getBytes(hash), signature);
    } catch (e) {
      return false;
    }
    return true;
  }
}
