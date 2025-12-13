import { forwardRef, Module } from '@nestjs/common';

import { EthersService } from './ethers.service';
import { RecordsModule } from '../records/records.module';

@Module({
  imports: [forwardRef(() => RecordsModule)],
  controllers: [],
  providers: [EthersService],
  exports: [EthersService],
})
export class EthersModule {}
