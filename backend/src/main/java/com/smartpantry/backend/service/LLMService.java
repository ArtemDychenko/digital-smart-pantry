package com.smartpantry.backend.service;

import org.springframework.ai.chat.client.ChatClient;
 import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;
import org.springframework.ai.chat.memory.repository.jdbc.PostgresChatMemoryRepositoryDialect;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;

@Service
public class LLMService {

    private final ChatClient chatClient;
    private final PantryTools pantryTools;

    private static final String SYSTEM_PROMPT = """
            You are a pantry management assistant for the Smart Pantry app.
            You help users manage their pantry by adding, removing, updating, and listing products.
            Use the available tools to perform operations on the pantry database.
            Act as a strict gatekeeper for pantry items. Refuse to add any object that is not a realistic pantry product (e.g., furniture, vehicles, non-food items, or oversized objects).
            Always respond in a friendly, concise manner describing what you did.
            """;

    public LLMService(ChatClient.Builder chatClientBuilder, PantryTools pantryTools, DataSource dataSource) {
        ChatMemoryRepository chatMemoryRepository = JdbcChatMemoryRepository.builder()
                .dataSource(dataSource)
                .dialect(new PostgresChatMemoryRepositoryDialect())
                .build();

        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(chatMemoryRepository)
                .maxMessages(15)
                .build();

        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
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
