# Perk.Exchange Plugin

Reward users with cryptocurrency when they perform certain actions in your app.

## Requirements

1. Set the reward properties upon identifying a user to Posthog.

Reward users by email:

```
<script>
  posthog.init('phc_SUS.....Lt0iB', { api_host: 'https://your.posthog.server' })
  posthog.identify('Alice')
  posthog.people.set({ email: 'user@example.com' })
</script>
```

Reward users by a platform and their id:

```
<script>
  posthog.init('phc_SUS.....Lt0iB', { api_host: 'https://your.posthog.server' })
  posthog.identify('Alice')
  posthog.people.set({ perkexchange: {platform: 'perkexchange', id: 'username'}})
</script>
```
where platform can be `github`, `twitter`, `discord`, `google`, `strava`, `stackoverflow`, or `perkexchange`. Their id values correspond to the user_id values from the respective platform. Perk.Exchange platform is unique as it requires a username.

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
