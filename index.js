function isEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export async function onAction(action, event, { global, storage }) {
  if (action.name === global.actionName) {
    let email = await storage.get(event.distinct_id);

    if (email && isEmail(email)) {
      const rewardResp = await fetch(`https://perk.exchange/api/rewards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${global.campaignSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          amount: global.rewardAmount,
          notify: true,
        }),
      });
      if (!rewardResp.ok) {
        console.error(
          `Could not send reward to ${email}: ${rewardResp.status}`
        );
      }
    }
  }
}

// Runs when the plugin is loaded, allows for preparing it as needed
export async function setupPlugin({ global, config }) {
  let rewardAmount = parseInt(config.amount, 10);
  if (!Number.isInteger(rewardAmount)) {
    throw new Error(
      "Reward amount should be an integer greater than or equal to 1"
    );
  }
  if (rewardAmount <= 0) {
    throw new Error("Reward amount should be greater than or equal to 1");
  }

  const invoicesResp = await fetch(`https://perk.exchange/api/invoices`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.campaignSecret}`,
      "Content-Type": "application/json",
    },
  });

  if (!invoicesResp.ok) {
    throw new Error(
      "Unable to connect to Perk.Exchange. Please make sure your campaign secret is correct."
    );
  }

  global.rewardAmount = rewardAmount;
  global.campaignSecret = config.campaignSecret;
  global.actionName = config.action;
}

function getEmailFromIdentifyEvent(event) {
  return isEmail(event.distinct_id)
    ? event.distinct_id
    : !!event["$set"] && Object.keys(event["$set"]).includes("email")
    ? event["$set"]["email"]
    : "";
}

export async function processEvent(event, meta) {
  if (event.event === "$identify") {
    const email = getEmailFromIdentifyEvent(event);
    if (email) {
      await meta.storage.set(event.distinct_id, email);
    }
  }

  return event;
}
