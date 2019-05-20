# LinTo-Skills-Optional - Datetime
This entry provides information about the datetime skill in the context of the project [LinTO](https://linto.ai/)

The skill gives information about the date or the time

## LinTo Skills
The following describes the possible inputs and outputs for the datetime skill

**Input**
```
{
    transcript : 'text transcript',
    nlu : {
    intent : 'intentDetected',
        entitiesNumber : 0, //number of entities
        entities : []
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
The datetime skill is triggered by the following intentions:
  * date
  * time

## Entities
This skill does not currently take any entities
