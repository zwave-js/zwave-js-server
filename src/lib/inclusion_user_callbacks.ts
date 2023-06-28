import { InclusionGrant, InclusionUserCallbacks } from "zwave-js";
import { createDeferredPromise } from "alcalzone-shared/deferred-promise";
import { Client, ClientsController } from "./server";

export const inclusionUserCallbacks = (
  clientsController: ClientsController,
  client?: Client
): InclusionUserCallbacks => {
  return {
    grantSecurityClasses: (
      requested: InclusionGrant
    ): Promise<InclusionGrant | false> => {
      clientsController.grantSecurityClassesPromise = createDeferredPromise();
      clientsController.grantSecurityClassesPromise.catch(() => {});
      clientsController.grantSecurityClassesPromise.finally(() => {
        if (clientsController.grantSecurityClassesPromise !== undefined) {
          delete clientsController.grantSecurityClassesPromise;
        }
      });
      if (client !== undefined) {
        client.sendEvent({
          source: "controller",
          event: "grant security classes",
          requested: requested as any,
        });
      } else {
        clientsController.clients.map((client) => {
          client.sendEvent({
            source: "controller",
            event: "grant security classes",
            requested: requested as any,
          });
        });
      }

      return clientsController.grantSecurityClassesPromise;
    },
    validateDSKAndEnterPIN: (dsk: string): Promise<string | false> => {
      clientsController.validateDSKAndEnterPinPromise = createDeferredPromise();
      clientsController.validateDSKAndEnterPinPromise.catch(() => {});
      clientsController.validateDSKAndEnterPinPromise.finally(() => {
        if (clientsController.validateDSKAndEnterPinPromise != undefined) {
          delete clientsController.validateDSKAndEnterPinPromise;
        }
      });
      if (client !== undefined) {
        client.sendEvent({
          source: "controller",
          event: "validate dsk and enter pin",
          dsk,
        });
      } else {
        clientsController.clients.map((client) =>
          client.sendEvent({
            source: "controller",
            event: "validate dsk and enter pin",
            dsk,
          })
        );
      }
      return clientsController.validateDSKAndEnterPinPromise;
    },
    abort: (): void => {
      // settle the promises to ensure finally is triggered for the cleanup.
      clientsController.grantSecurityClassesPromise?.resolve(false);
      clientsController.validateDSKAndEnterPinPromise?.resolve(false);
      if (client !== undefined) {
        client.sendEvent({
          source: "controller",
          event: "inclusion aborted",
        });
      } else {
        clientsController.clients.map((client) =>
          client.sendEvent({
            source: "controller",
            event: "inclusion aborted",
          })
        );
      }
    },
  };
};

export const grantSecurityClasses =
  (clientsController: ClientsController, client?: Client) =>
  (requested: InclusionGrant): Promise<InclusionGrant | false> => {
    clientsController.grantSecurityClassesPromise = createDeferredPromise();
    clientsController.grantSecurityClassesPromise.catch(() => {});
    clientsController.grantSecurityClassesPromise.finally(() => {
      if (clientsController.grantSecurityClassesPromise !== undefined) {
        delete clientsController.grantSecurityClassesPromise;
      }
    });
    if (client !== undefined) {
      client.sendEvent({
        source: "controller",
        event: "grant security classes",
        requested: requested as any,
      });
    } else {
      clientsController.clients.map((client) => {
        client.sendEvent({
          source: "controller",
          event: "grant security classes",
          requested: requested as any,
        });
      });
    }

    return clientsController.grantSecurityClassesPromise;
  };

export const validateDSKAndEnterPIN =
  (clientsController: ClientsController, client?: Client) =>
  (dsk: string): Promise<string | false> => {
    clientsController.validateDSKAndEnterPinPromise = createDeferredPromise();
    clientsController.validateDSKAndEnterPinPromise.catch(() => {});
    clientsController.validateDSKAndEnterPinPromise.finally(() => {
      if (clientsController.validateDSKAndEnterPinPromise != undefined) {
        delete clientsController.validateDSKAndEnterPinPromise;
      }
    });
    if (client !== undefined) {
      client.sendEvent({
        source: "controller",
        event: "validate dsk and enter pin",
        dsk,
      });
    } else {
      clientsController.clients.map((client) =>
        client.sendEvent({
          source: "controller",
          event: "validate dsk and enter pin",
          dsk,
        })
      );
    }
    return clientsController.validateDSKAndEnterPinPromise;
  };

export const abort =
  (clientsController: ClientsController, client?: Client) => (): void => {
    // settle the promises to ensure finally is triggered for the cleanup.
    clientsController.grantSecurityClassesPromise?.resolve(false);
    clientsController.validateDSKAndEnterPinPromise?.resolve(false);
    if (client !== undefined) {
      client.sendEvent({
        source: "controller",
        event: "inclusion aborted",
      });
    } else {
      clientsController.clients.map((client) =>
        client.sendEvent({
          source: "controller",
          event: "inclusion aborted",
        })
      );
    }
  };
