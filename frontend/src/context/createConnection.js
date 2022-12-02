import { ThemeContext } from '@emotion/react'
import { createNymMixnetClient } from 'ntv-sdk'

export async function connectMixnet() {
    const nym = await createNymMixnetClient()

    const validatorApiUrl = 'https://validator.nymtech.net/api'
    const preferredGatewayIdentityKey =
        'E3mvZTHQCdBvhfr178Swx9g4QG3kkRUun7YnToLMcMbM'

    // start the client and connect to a gateway
        await nym.client.start({
            clientId: 'pastenymClient',
            validatorApiUrl,
            preferredGatewayIdentityKey,
            gatewayListener: 'wss://gateway1.nymtech.net:443',
        })

    return nym
}
