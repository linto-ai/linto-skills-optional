# LinTo-Skills-Optional - Philips-hue
This entry provides information about the philips-Hue skill in the context of the project [LinTO](https://linto.ai/)

The skill gives information about operating Philips-Hue lights

## LinTo Skills
The following describes the possible inputs and outputs for the Philips-hue skill

**Input**
```
{
    transcript : 'text transcript',
    nlu : {
    intent : 'intentDetected',
        entitiesNumber : 1, //number of entities
        entities : [{
            entity: 'entity type',
            value: 'entity name'
        }]
    },
    conversationData : { } //optional json from the previous intention if a conversation is required
}
```

**Output**
__Say Mode__ : In say mode, LinTO provides a single response to a given question.
```
{
    behavior: {
        say: 'message that linto gonna say',
    }
}
```
For example, when asked "What time is it?", LinTO might respond, "It is 7:30 a.m."

__Conversation Mode__ : This skill does not support a conversation mode

## Intentions
The Philips-hue skill is triggered by the following intentions: `light`

## Entities
Here are the entities supported for this skill:
 * `action_on`, turn on the light
 * `action_off`, turn off the light
 * `action_set`, set the light at X percent
 * `action_up`, increase the light brightness
 * `action_down`, reduce the light brightness
 * `ordinal`, used with the `action_set` has value
 * `id`, used to identify the light (by name). It is combined with any `action_` entities