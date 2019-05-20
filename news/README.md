# LinTo-Skills-Optional - News
This entry provides information about the news skill in the context of the project [LinTO](https://linto.ai/)

The skill gives information about world news

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

__Conversation Mode__ : This skill does not support a conversation mode

## Intentions
The news skill is triggered by the following intentions: `news`

## Entities
Here are the entities supported for this skill:
  * `type_international`, (default entity)
  * `type_cultural`
  * `type_music`
  * `type_national`
  * `type_pixel`
  * `type_politique`
  * `type_societe`
  * `type_sport`
  * `type_world`
