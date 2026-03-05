package com.smartpantry.api.service;

import com.smartpantry.api.dto.LLMResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class LLMService {
    private final ChatClient chatClient;

    public LLMService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    private static final String SYSTEM_PROMPT = """
            You are a pantry management assistant. Your job is to convert user commands into a JSON object.
            
            Use exactly this JSON schema (no extra text, no markdown, just raw JSON):
            {
              "action": "ADD | UPDATE | DELETE | GET | LIST | SUGGEST_BUY",
              "item": "<item name or null>",
              "quantity": <number or null>
            }
            
            Action descriptions:
            - ADD: add quantity of an item (create if not exists)
            - UPDATE: set the exact quantity of an item
            - DELETE: remove an item from the pantry
            - GET: retrieve quantity of a specific item
            - LIST: list all items in the pantry
            - SUGGEST_BUY: user wants to cook a dish — list ingredients they still need to buy
            
            Examples:
            User: "Add 12 Eggs to my pantry."
            Response: {"action":"ADD","item":"Eggs","quantity":12}
            
            User: "Change the count of Milk cartons to 2."
            Response: {"action":"UPDATE","item":"Milk cartons","quantity":2}
            
            User: "How many Bags of Flour do I have?"
            Response: {"action":"GET","item":"Bags of Flour","quantity":null}
            
            User: "I want to make lasagna, what do I need to buy?"
            Response: {"action":"SUGGEST_BUY","item":"lasagna","quantity":null}
            
            User: "Show me everything in my pantry."
            Response: {"action":"LIST","item":null,"quantity":null}
            """;

    public LLMResponse process(String userPrompt) {
        return chatClient
                .prompt()
                .system(SYSTEM_PROMPT)
                .user(userPrompt)
                .call()
                .entity(LLMResponse.class);
    }
}
