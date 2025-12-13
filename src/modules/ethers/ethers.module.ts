import { Module } from '@nestjs/common';

import { EthersService } from './ethers.service';
import { RecordsModule } from '../records/records.module';

@Module({
  imports: [RecordsModule],
  controllers: [],
  providers: [EthersService],
  exports: [EthersService],
})
export class EthersModule {}
