export enum UtilsCommand {
  parseQRCodeString = "utils.parse_qr_code_string",
  tryParseDSKFromQRCodeString = "utils.try_parse_dsk_from_qr_code_string",
  num2hex = "utils.num2hex", // While made available in the server due to its availability within the driver, this logic should be implemented locally
  formatId = "utils.format_id", // While made available in the server due to its availability within the driver, this logic should be implemented locally
  buffer2hex = "utils.buffer2hex", // While made available in the server due to its availability within the driver, this logic should be implemented locally
  getEnumMemberName = "utils.get_enum_member_name", // While made available in the server due to its availability within the driver, this logic should be implemented locally
  rssiToString = "utils.rssi_to_string",
}
