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

        Rules:
        - Action first. If the user asks for something that can be done with a tool, CALL the appropriate tool immediately. Do not respond with text if a tool can handle the request.
        - When looking up one or more specific named products, call getProduct once per name. Never use listProducts for named lookups.
        - Only use listProducts when the user asks for the full list, all products, or wants to filter/search without specifying exact names.
        - You help users manage their pantry by adding, removing, updating, and listing products.
        - Adding a product that already exists should CALL updateProduct to adjust its quantity, not create a duplicate entry.
        - Adding a product requires BOTH a name and a quantity. If either is missing, do not CALL addProduct.
        - Use the available tools to perform operations on the pantry database.
        - Refuse to add any object that is not products (e.g., furniture, vehicles, non-food items, or oversized objects).
        - For conditional requests (e.g. "if X exists update them"), call getProduct first, then decide.
        - Be concise.
        """;

    public LLMService(ChatClient.Builder chatClientBuilder, PantryTools pantryTools, DataSource dataSource) {
        ChatMemoryRepository chatMemoryRepository = JdbcChatMemoryRepository.builder()
                .dataSource(dataSource)
                .dialect(new PostgresChatMemoryRepositoryDialect())
                .build();

        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(chatMemoryRepository)
                .maxMessages(5)
                .build();

        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
        this.pantryTools = pantryTools;
    }

    public String process(String userPrompt, String conversationId) {
        return chatClient
                .prompt()
                .user(userPrompt)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                .tools(pantryTools)
                .call()
                .content();
    }
}
