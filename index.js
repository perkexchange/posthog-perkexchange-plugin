function isEmail(email) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
}

export async function onAction(action, event, { global, cache, storage }) {
    let todayDate = Date()
    let cacheRewardKey = `${event.distinct_id}_${todayDate.toDateString()}`
    let todaysRewards = cache.get((key = cacheRewardKey))
    let reward = global.rewardAmount

    // Has the user already received rewards today?
    if (todaysRewards && todaysRewards + reward > global.dailyLimit) reward = global.dailyLimit - todaysRewards

    // User exceeded their daily amount
    if (reward <= 0) return

    let actions = global.actionName.split(',')

    if (actions.includes(action.name)) {
        let user = await storage.get(event.distinct_id)
        if (!user) return

        let request = {
            amount: reward,
            message: global.rewardMessage
        }

        if (user.platform === 'email' && user.id && isEmail(user.id)) {
            request['email'] = user.id
            request['notify'] = true
        } else if (
            ['twitter', 'github', 'stackoverflow', 'discord', 'strava', 'google', 'perkexchange'].includes(
                user.platform
            ) &&
            user.id
        ) {
            request['platform'] = user.platform
            request['user_id'] = user.id
        } else {
            console.debug(`Skipping reward for ${user.platform}/${user.id}`)
            return
        }

        const rewardResp = await fetch(`https://perk.exchange/api/rewards`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${global.campaignSecret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        })
        if (!rewardResp.ok) {
            console.error(`Could not send reward to ${user.platform}/${user.id}: ${rewardResp.status}`)
        } else {
            todaysRewards = cache.get((key = cacheRewardKey))

            // Store today's rewards in the cache for 1 day only
            if (todaysRewards) cache.set((key = cacheRewardKey), reward + todaysRewards, (ttlSeconds = 24 * 60 * 60))
        }
    }
}

// Runs when the plugin is loaded, allows for preparing it as needed
export async function setupPlugin({ global, config }) {
    let rewardAmount = parseInt(config.amount, 10)
    if (!Number.isInteger(rewardAmount)) {
        throw new Error('Reward amount should be a number greater than or equal to 1')
    }
    if (rewardAmount <= 0) {
        throw new Error('Reward amount should be greater than or equal to 1')
    }

    let dailyLimit = parseInt(config.daily_limit, 10)
    if (!Number.isInteger(dailyLimit)) {
        throw new Error('Daily limit should be a number greater than or equal to 1')
    }
    if (dailyLimit <= 0) {
        throw new Error('Daily limit should be greater than or equal to 1')
    }

    const invoicesResp = await fetch(`https://perk.exchange/api/invoices`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${config.campaignSecret}`,
            'Content-Type': 'application/json'
        }
    })

    if (!invoicesResp.ok) {
        throw new Error('Unable to connect to Perk.Exchange. Please make sure your campaign secret is correct.')
    }

    global.rewardAmount = rewardAmount
    global.dailyLimit = dailyLimit
    global.campaignSecret = config.campaignSecret
    global.actionName = config.action
    global.rewardMessage = config.message
}

function getEmailFromIdentifyEvent(event) {
    return isEmail(event.distinct_id)
        ? { platform: 'email', id: event.distinct_id }
        : !!event['$set'] && Object.keys(event['$set']).includes('email')
        ? { platform: 'email', id: event['$set']['email'] }
        : ''
}

function getPerkExchangeUserFromIdentifyEvent(event) {
    let user =
        !!event['$set'] && Object.keys(event['$set']).includes('perkexchange') ? event['$set']['perkexchange'] : null
    if (Object.keys(user).includes('platform') && Object.keys(user).includes('id')) {
        return user
    } else return null
}

export async function processEvent(event, meta) {
    if (event.event === '$identify') {
        // The user has been explicitly provided
        const user = getPerkExchangeUserFromIdentifyEvent(event)
        if (user) {
            await meta.storage.set(event.distinct_id, user)
        } else {
            // try to collect user by email
            user = getEmailFromIdentifyEvent(event)
            if (user) {
                await meta.storage.set(event.distinct_id, user)
            }
        }
    }

    return event
}
