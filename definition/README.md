# LinTo-Skills-Optional - Definition
This entry provides information about the definition skill in the context of the project [LinTO](https://linto.ai/)

The skill gives information about the definition of an object

## LinTo Skills
The following describes the possible inputs and outputs for the definition skill

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
The definition skill is triggered by the following intentions: `definition`

## Entities
This skill requires the entity type `object` to work; if none is detected the skill will trigger an error