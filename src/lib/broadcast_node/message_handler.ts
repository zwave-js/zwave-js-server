import { Driver, VirtualEndpoint, VirtualNode } from "zwave-js";
import { UnknownCommandError, VirtualEndpointNotFoundError } from "../error";
import { BroadcastNodeCommand } from "./command";
import { IncomingMessageBroadcastNode } from "./incoming_message";
import { BroadcastNodeResultTypes } from "./outgoing_message";
import { Client } from "../server";
import { setValueOutgoingMessage } from "../common";
import { MessageHandler } from "../message_handler";

export class BroadcastNodeMessageHandler extends MessageHandler {
  constructor(
    private driver: Driver,
    private client: Client,
  ) {
    super();
  }

  async handle(
    message: IncomingMessageBroadcastNode,
  ): Promise<BroadcastNodeResultTypes[BroadcastNodeCommand]> {
    const { command } = message;

    const virtualNode = this.driver.controller.getBroadcastNode();

    switch (message.command) {
      case BroadcastNodeCommand.setValue: {
        const result = await virtualNode.setValue(
          message.valueId,
          message.value,
          message.options,
        );
        return setValueOutgoingMessage(result, this.client.schemaVersion);
      }
      case BroadcastNodeCommand.getEndpointCount: {
        const count = virtualNode.getEndpointCount();
        return { count };
      }
      case BroadcastNodeCommand.supportsCC: {
        const supported = getVirtualEndpoint(
          virtualNode,
          message.index,
        ).supportsCC(message.commandClass);
        return { supported };
      }
      case BroadcastNodeCommand.getCCVersion: {
        const version = getVirtualEndpoint(
          virtualNode,
          message.index,
        ).getCCVersion(message.commandClass);
        return { version };
      }
      case BroadcastNodeCommand.invokeCCAPI: {
        const response = getVirtualEndpoint(
          virtualNode,
          message.index,
        ).invokeCCAPI(
          message.commandClass,
          message.methodName,
          ...message.args,
        );
        return { response };
      }
      case BroadcastNodeCommand.supportsCCAPI: {
        const supported = getVirtualEndpoint(
          virtualNode,
          message.index,
        ).supportsCCAPI(message.commandClass);
        return { supported };
      }
      case BroadcastNodeCommand.getDefinedValueIDs: {
        const valueIDs = virtualNode.getDefinedValueIDs();
        return { valueIDs };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

function getVirtualEndpoint(
  virtualNode: VirtualNode,
  index?: number,
): VirtualEndpoint {
  if (!index) return virtualNode;
  const virtualEndpoint = virtualNode.getEndpoint(index);
  if (!virtualEndpoint) {
    throw new VirtualEndpointNotFoundError(index, undefined, true);
  }
  return virtualEndpoint;
}
