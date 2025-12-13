import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { HttpExceptionWrapper } from 'src/helpers/wrapper';

export function FileUploadInterceptor(fieldName = 'record') {
  return FileInterceptor(fieldName, {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/^application\/pdf$/)) {
        return callback(
          new HttpExceptionWrapper(ERROR_MESSAGES.INVALID_FILE_TYPE),
          false,
        );
      }
      callback(null, true);
    },
  });
}
