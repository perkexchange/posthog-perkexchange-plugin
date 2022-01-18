# Perk.Exchange Plugin

Reward users with cryptocurrency when they perform certain actions in your app.

## Requirements

1. Set the email address when identifying a user to Posthog. For example,

```
<script>
  posthog.init('phc_SUS.....Lt0iB', { api_host: 'https://your.posthog.server' })
  posthog.identify('Alice')
  posthog.people.set({ email: 'user@example.com' })
</script>
```

2. Create a new custom campaign at <https://perk.exchange>. Fund the campaign with [KIN cryptocurrency](https://kin.org)
3. Generate a **campaign secret**

## Installation

1. Visit 'Project Plugins' under 'Settings'
1. Enable plugins if you haven't already done so
1. Click the 'Repository' tab next to 'Installed'
1. Click 'Install' on this plugin
1. Add your [Perk.Exchange](https://perk.exchange/Campaigns) **campaign secret** at the configuration step
1. Specify the PostHog action name that should trigger a reward. A list of actions can be set by using a comma and no spaces. For example, `action1,action2`
1. Set the Reward amount that is given to a user when an action from the previous step is triggered.
1. Enable the plugin

## Collecting Rewards

When a user triggers a qualifying action a cryptocurrency reward is provisioned for them at [Perk.Exchange](https://perk.exchange). If it is the first time, an email is sent to the user with a link to pick up their reward at [Perk.Exchange](https://perk.exchange). Subsequent rewards are deposited at [Perk.Exchange](https://perk.exchange) and assigned to the user. Rewards expire after 30 days.
