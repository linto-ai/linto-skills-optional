# LinTo-Skills-Calendar
This entry provides information about the calendar skill in the context of the project [LinTO](https://linto.ai/)

The skill allow to connect to the [OpenPaas Dav API](https://ng.open-paas.org/)

## LinTo Skills
The following describes the possible inputs and outputs for the news skill

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

__Conversation Mode__ : In conversation mode, LinTO first demands additional information before responding to the original request.
```
{
    behavior: {
        ask: 'message that linto gonna say',
        conversationData : { //json nlu generally copies the intent from input but  data can be added if required by the skill
            requireData :  'some data',
            requireDataJson : {}, //some other data
            intent : 'intentDetected',
            entitiesNumber : 1, //number of entities
            entities : [{
                entity: 'entity type',
                value: 'entity name'
            }]
        }
    }
}
```

## Intentions
The news skill is triggered by the following intentions: `calendar`

## Entities
Here are the entities supported for this skill:
  * `action_create`
  * `action_delete`
  * `action_list`
