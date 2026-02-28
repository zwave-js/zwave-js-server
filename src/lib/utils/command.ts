export enum UtilsCommand {
  parseQRCodeString = "utils.parse_qr_code_string",
  tryParseDSKFromQRCodeString = "utils.try_parse_dsk_from_qr_code_string",
  num2hex = "utils.num2hex", // While made available in the server due to its availability within the driver, this functionality works best when implemented locally
  formatId = "utils.format_id", // While made available in the server due to its availability within the driver, this functionality works best when implemented locally
  buffer2hex = "utils.buffer2hex", // While made available in the server due to its availability within the driver, this functionality works best when implemented locally
  getEnumMemberName = "utils.get_enum_member_name", // While made available in the server due to its availability within the driver, this functionality works best when implemented locally
  rssiToString = "utils.rssi_to_string",
  guessFirmwareFileFormat = "utils.guess_firmware_file_format",
  tryUnzipFirmwareFile = "utils.try_unzip_firmware_file",
  extractFirmware = "utils.extract_firmware",
}
