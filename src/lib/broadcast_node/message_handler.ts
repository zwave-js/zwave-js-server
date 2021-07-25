import { Driver, VirtualEndpoint, VirtualNode } from "zwave-js";
import { UnknownCommandError, VirtualEndpointNotFoundError } from "../error";
import { BroadcastNodeCommand } from "./command";
import { IncomingMessageBroadcastNode } from "./incoming_message";
import { BroadcastNodeResultTypes } from "./outgoing_message";

export class BroadcastNodeMessageHandler {
  static async handle(
    message: IncomingMessageBroadcastNode,
    driver: Driver
  ): Promise<BroadcastNodeResultTypes[BroadcastNodeCommand]> {
    const { command } = message;
    let supported: boolean;

    const virtualNode = driver.controller.getBroadcastNode();

    switch (message.command) {
      case BroadcastNodeCommand.setValue:
        const success = await virtualNode.setValue(
          message.valueId,
          message.value,
          message.options
        );
        return { success };
      case BroadcastNodeCommand.getEndpointCount:
        const count = virtualNode.getEndpointCount();
        return { count };
      case BroadcastNodeCommand.supportsCC:
        supported = getVirtualEndpoint(virtualNode, message.index).supportsCC(
          message.commandClass
        );
        return { supported };
      case BroadcastNodeCommand.getCCVersion:
        const version = getVirtualEndpoint(
          virtualNode,
          message.index
        ).getCCVersion(message.commandClass);
        return { version };
      case BroadcastNodeCommand.invokeCCAPI:
        const response = getVirtualEndpoint(
          virtualNode,
          message.index
        ).invokeCCAPI(
          message.commandClass,
          message.methodName,
          ...message.args
        );
        return { response };
      case BroadcastNodeCommand.supportsCCAPI:
        supported = getVirtualEndpoint(
          virtualNode,
          message.index
        ).supportsCCAPI(message.commandClass);
        return { supported };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

function getVirtualEndpoint(
  virtualNode: VirtualNode,
  index?: number
): VirtualEndpoint {
  if (!index) return virtualNode;
  const virtualEndpoint = virtualNode.getEndpoint(index);
  if (!virtualEndpoint) {
    throw new VirtualEndpointNotFoundError(index, undefined, true);
  }
  return virtualEndpoint;
}
