import { Driver, VirtualEndpoint, VirtualNode } from "zwave-js";
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
        const supported = getVirtualEndpoint(
          virtualNode,
          message.index,
          message.nodeIDs
        ).supportsCC(message.commandClass);
        return { supported };
      case MulticastGroupCommand.getCCVersion:
        const version = getVirtualEndpoint(
          virtualNode,
          message.index,
          message.nodeIDs
        ).getCCVersion(message.commandClass);
        return { version };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

function getVirtualEndpoint(
  virtualNode: VirtualNode,
  index: number,
  nodeIDs: number[]
): VirtualEndpoint {
  const virtualEndpoint = virtualNode.getEndpoint(index);
  if (!virtualEndpoint) {
    throw new VirtualEndpointNotFoundError(index, nodeIDs, undefined);
  }
  return virtualEndpoint;
}
