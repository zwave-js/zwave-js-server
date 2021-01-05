import { Driver } from "zwave-js";
import express from "express";
import { addAPItoExpress } from "./lib/express";

(async () => {
  console.log(process.argv);
  if (process.argv.length < 3) {
    console.error("Error: Missing path to serial port");
    return;
  }

  const driver = new Driver(process.argv[2]);

  driver.on("error", (e) => {
    console.error("Error in driver", e);
  });

  driver.on("driver ready", () => {
    const app = express();
    addAPItoExpress(app.listen(3000), driver);
  });

  await driver.start();
})().catch((err) => {
  console.error("Unable to start driver", err);
});
