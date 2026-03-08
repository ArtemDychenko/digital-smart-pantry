package com.smartpantry.backend.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class LLMService {

    private final ChatClient chatClient;
    private final PantryTools pantryTools;

    private static final String SYSTEM_PROMPT = """
            You are a pantry management assistant for the Smart Pantry app.
            You help users manage their pantry by adding, removing, updating, and listing products.
            Use the available tools to perform operations on the pantry database.
            Always respond in a friendly, concise manner describing what you did.
            """;

    public LLMService(ChatClient.Builder chatClientBuilder, PantryTools pantryTools) {
        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .build();
        this.pantryTools = pantryTools;
    }

    public String process(String userPrompt) {
        return chatClient
                .prompt()
                .user(userPrompt)
                .tools(pantryTools)
                .call()
                .content();
    }
}
