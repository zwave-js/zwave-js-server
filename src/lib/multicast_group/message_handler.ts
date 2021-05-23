import { Driver } from "zwave-js";
import { UnknownCommandError, VirtualEndpointNotFoundError } from "../error";
import { MulticastGroupCommand } from "./command";
import { IncomingMessageMulticastGroup } from "./incoming_message";
import { MulticastGroupResultTypes } from "./outgoing_message";

export class MulticastGroupMessageHandler {
  static async handle(
    message: IncomingMessageMulticastGroup,
    driver: Driver
  ): Promise<MulticastGroupResultTypes[MulticastGroupCommand]> {
    const { command } = message;
    let virtualEndpoint;

    const virtualNode = driver.controller.getMulticastGroup(message.nodeIDs);

    switch (message.command) {
      case MulticastGroupCommand.setValue:
        const success = await virtualNode.setValue(
          message.valueId,
          message.value
        );
        return { success };
      case MulticastGroupCommand.getEndpointCount:
        const count = virtualNode.getEndpointCount();
        return { count };
      case MulticastGroupCommand.supportsCC:
        virtualEndpoint = virtualNode.getEndpoint(message.index);
        if (!virtualEndpoint) {
          throw new VirtualEndpointNotFoundError(
            message.index,
            message.nodeIDs,
            undefined
          );
        }
        const supported = virtualEndpoint.supportsCC(message.commandClass);
        return { supported };
      case MulticastGroupCommand.getCCVersion:
        virtualEndpoint = virtualNode.getEndpoint(message.index);
        if (!virtualEndpoint) {
          throw new VirtualEndpointNotFoundError(
            message.index,
            message.nodeIDs,
            undefined
          );
        }
        const version = virtualEndpoint.getCCVersion(message.commandClass);
        return { version };
      default:
        throw new UnknownCommandError(command);
    }
  }
}
