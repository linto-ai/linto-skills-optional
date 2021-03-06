# LinTo-Skills-Optional - Weather
This entry provides information about the weather skill in the context of the project [LinTO](https://linto.ai/)

The skill gives information about retrieve weather data for a city

## LinTo Skills
The following describes the possible inputs and outputs for the weather skill

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
The weather skill is triggered by the following intentions: `weather`

## Entities
Here are the entities supported for this skill:
  * `location`, city to detect the pollution
  * `time`, will check tomorrow day weather
