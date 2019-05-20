# LinTo-Skills-Optional - Pollution
This entry provides information about the pollution skill
This node is part of the project [LinTO](https://linto.ai/)

It will retrieve data about the pollution for a city

## LinTo Skills
The following describes the possible inputs and outputs for the pollution skill

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
Depends on the speaking mode (say or conversation).

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
The pollution skill is triggered by the following intentions: `pollution`


## Entities
Here the supported entity for this skill:
  * `location`, city to detect the pollution
